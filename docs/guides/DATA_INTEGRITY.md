# Data Integrity — Write Verification, Bulk Ops, Search Index

## Write Verification

Every bulk write operation must verify its results. Trust but verify — databases can silently drop writes due to rate limits, partial failures, or permission issues.

### The Three-Step Verification

1. **Count check** — Did we write the expected number of documents?
2. **Spot check** — Pick N random documents and verify their content
3. **Fail on mismatch** — If verification fails, log the discrepancy and exit non-zero

```typescript
async function verifyWrites(
	expected: number,
	countFn: () => Promise<number>,
	spotCheckFn: (id: string) => Promise<boolean>,
	sampleIds: string[],
): Promise<void> {
	// Step 1: Count check
	const actual = await countFn();
	if (actual !== expected) {
		throw new Error(`Count mismatch: expected ${expected}, got ${actual}`);
	}

	// Step 2: Spot check random documents
	const checks = await Promise.all(sampleIds.map(spotCheckFn));
	const failures = checks.filter((ok) => !ok).length;
	if (failures > 0) {
		throw new Error(`Spot check failed: ${failures}/${sampleIds.length} documents invalid`);
	}

	console.log(`Verified: ${actual} documents, ${sampleIds.length} spot checks passed`);
}
```

## Bulk Operation Pattern

When importing, migrating, or regenerating data, follow this sequence:

```
delete stale → import new → verify count → spot-check random doc
```

### Why Delete First?

`upsert` only updates documents with matching IDs. If a previous run created documents that no longer exist in the source data, they become orphans. Orphaned data causes counts to drift and search results to include stale entries.

```typescript
async function bulkImport(tenantId: string, newHosts: Host[]) {
	// Step 1: Delete stale documents for this tenant
	const deleted = await deleteByTenant(tenantId);
	console.log(`Deleted ${deleted} stale documents`);

	// Step 2: Import new documents in batches
	let imported = 0;
	for (const batch of chunk(newHosts, 500)) {
		await writeBatch(batch);
		imported += batch.length;
		console.log(`Imported ${imported}/${newHosts.length}`);
	}

	// Step 3: Verify
	const count = await countByTenant(tenantId);
	if (count !== newHosts.length) {
		throw new Error(`Import verification failed: expected ${newHosts.length}, got ${count}`);
	}

	// Step 4: Spot check
	const sample = newHosts.slice(0, 3);
	for (const host of sample) {
		const doc = await getById(host.id);
		if (!doc || doc.hostname !== host.hostname) {
			throw new Error(`Spot check failed for ${host.id}`);
		}
	}

	console.log(`Bulk import complete: ${imported} documents verified`);
}
```

## Search Index Lifecycle

Search indexes (Typesense, Elasticsearch, Algolia) are secondary data stores. They must be kept in sync with the primary database.

### Schema Drift Patching

Collections do not auto-update when your code schema changes. Your bootstrap function must detect missing fields and patch them.

```typescript
async function ensureCollection(client: SearchClient, schema: CollectionSchema) {
	try {
		const existing = await client.collections(schema.name).retrieve();

		// Detect missing fields
		const existingFieldNames = new Set(existing.fields.map((f) => f.name));
		const missingFields = schema.fields.filter((f) => !existingFieldNames.has(f.name));

		if (missingFields.length > 0) {
			console.log(`Patching collection: adding ${missingFields.length} fields`);
			await client.collections(schema.name).update({ fields: missingFields });
		}
	} catch (err) {
		if ((err as any).httpStatus === 404) {
			console.log(`Creating collection: ${schema.name}`);
			await client.collections().create(schema);
		} else {
			throw err;
		}
	}
}
```

### Stale Document Cleanup

When the primary data source changes, the search index must reflect those changes. Run cleanup during backfill operations:

```typescript
// Delete all documents for a tenant before re-indexing
await client
	.collections(collectionName)
	.documents()
	.delete({ filter_by: `tenantId:=${tenantId}` });
```

## Denormalized Counters

Aggregating counts from large collections is expensive. Maintain pre-computed counters for frequently accessed metrics.

### Rules

- **Backend writes counters** — The collector/API that writes data also updates counters atomically
- **Frontend reads counters** — The dashboard reads pre-computed values, never computes them client-side
- **Never sum from a page slice** — A paginated page of 25 items cannot represent fleet-wide totals

```typescript
// When the collector writes a new host scan:
await firestore.runTransaction(async (tx) => {
	// Write the host document
	tx.set(hostRef, hostData);

	// Atomically increment tenant counters
	tx.update(tenantRef, {
		endpointCount: FieldValue.increment(1),
		totalScans: FieldValue.increment(1),
		lastUpdated: FieldValue.serverTimestamp(),
	});
});
```

### Where to Store

Counters belong on the parent document. A tenant document holds fleet-wide counts. A host group document holds group-level counts. This avoids extra queries and leverages Firestore's document-level consistency.

## Script Discipline

Data scripts (generators, migrations, backfills) must follow strict discipline:

1. **Log actual errors** — Include the operation, document ID, and error message
2. **Exit non-zero on failure** — So CI/CD pipelines and calling scripts know something went wrong
3. **Never silently skip** — If a document fails to write, that is an error, not a warning
4. **Track results** — Count successes, failures, and skips. Print a summary at the end
5. **Support `--dry-run`** — For destructive operations, let the user preview what will happen

## Circuit Breaker with Observability

When a dependency (search index, external API) fails, the circuit breaker protects the system. But a silent circuit breaker is dangerous — users discover broken features before engineers know the dependency is down.

```typescript
// Always log state transitions
recordFailure(): void {
	this.failures++;
	if (this.failures >= this.threshold) {
		console.warn(`[circuit-breaker:${this.name}] OPEN — ${this.failures} failures, skipping for ${this.cooldownMs}ms`);
		// TODO: emit metric or alert
	}
}

recordSuccess(): void {
	if (this.failures > 0) {
		console.info(`[circuit-breaker:${this.name}] CLOSED — dependency recovered`);
	}
	this.failures = 0;
}
```

## Cache TTL Strategies

**Never cache forever.** Every cache entry must have an expiry.

| Data type | TTL | Rationale |
|---|---|---|
| User session | 24 hours | Security — limit exposure window |
| API response | 5-60 seconds | Freshness vs performance tradeoff |
| Search results | 30-60 seconds | Search index updates are near-real-time |
| Configuration | 5 minutes | Config changes are infrequent but should take effect reasonably fast |
| Static assets | 1 year | Versioned filenames (content hash) allow long cache |

## Multi-Environment Prefix Isolation

When multiple environments share the same database or search cluster, use a prefix to isolate data.

```typescript
// Every collection/document path includes the environment prefix
const prefix = process.env.FIRESTORE_PREFIX; // "prd_", "stg_", "local_"
if (!prefix) throw new Error("FIRESTORE_PREFIX is required");

const tenantsCollection = `${prefix}tenants`;
const hostsCollection = `${prefix}hosts`;
```

**Rules:**
- Prefix is mandatory — fail loudly if unset
- Prefix is set once at startup, not per-query
- Production prefix (`prd_`) must never appear in staging/local config
- Scripts that accept `--prefix` must validate the value

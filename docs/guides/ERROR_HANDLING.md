# Error Handling — Failure Design & Resilience

## The 5 Rules

### 1. Never Swallow Errors Silently

Every error must produce observable output — a log entry, a metric, or a re-thrown exception. If an error occurs and nobody knows, the system is lying about its state.

### 2. No Empty Catch Blocks

Empty catch blocks are bugs waiting to happen. Every catch must either: log the error, re-throw it, return a meaningful default, or contain a comment explaining why ignoring is intentional.

```typescript
// BAD — silent failure, impossible to debug
try { await saveToIndex(doc); } catch {}

// GOOD — classified as best-effort with visibility
try {
	await saveToIndex(doc); // best-effort: search index is eventually consistent
} catch (err) {
	console.warn(`[index] Failed to index doc ${doc.id}: ${(err as Error).message}`);
}
```

### 3. Classify Operations as Required vs Best-Effort

Add a comment to every try/catch indicating whether the operation is required (should fail the request) or best-effort (log and continue). This makes error handling intent explicit during code review.

```typescript
// required: tenant must exist to proceed
const tenant = await getTenant(tenantId);
if (!tenant) throw new HttpError(404, "Tenant not found");

try {
	await updateSearchIndex(tenant); // best-effort: index will catch up on next sync
} catch (err) {
	logger.warn({ op: "updateSearchIndex", tenantId, error: err.message });
}
```

### 4. Structured Error Logging

Every error log must include: the operation name, relevant IDs, the error message, and optionally the duration. This makes logs searchable and debuggable.

```typescript
const start = Date.now();
try {
	await processHost(hostId, tenantId);
	logger.info({ op: "processHost", hostId, tenantId, durationMs: Date.now() - start });
} catch (err) {
	logger.error({
		op: "processHost",
		hostId,
		tenantId,
		error: (err as Error).message,
		durationMs: Date.now() - start,
	});
	throw err; // required operation — re-throw
}
```

### 5. Exit Codes Reflect Reality

Scripts must exit non-zero when they fail. A script that logs an error but exits 0 poisons every pipeline that depends on it.

```typescript
try {
	await main();
	process.exit(0);
} catch (err) {
	console.error(`Fatal: ${(err as Error).message}`);
	process.exit(1);
}
```

## Circuit Breaker Pattern

When a dependency fails repeatedly, stop calling it temporarily to avoid cascading failures and wasted latency.

**Implementation:**

```typescript
class CircuitBreaker {
	private failures = 0;
	private openUntil = 0;

	constructor(
		private readonly threshold: number = 3,
		private readonly cooldownMs: number = 60_000,
	) {}

	isOpen(): boolean {
		if (Date.now() > this.openUntil) {
			return false; // cooldown expired, allow retry
		}
		return this.failures >= this.threshold;
	}

	recordSuccess(): void {
		if (this.failures > 0) {
			console.info("[circuit-breaker] Circuit closed — dependency recovered");
		}
		this.failures = 0;
		this.openUntil = 0;
	}

	recordFailure(): void {
		this.failures++;
		if (this.failures >= this.threshold) {
			this.openUntil = Date.now() + this.cooldownMs;
			console.warn(
				`[circuit-breaker] Circuit OPEN — ${this.failures} consecutive failures, ` +
				`skipping for ${this.cooldownMs / 1000}s`,
			);
		}
	}
}
```

**Key rules:**
- Always log when the circuit opens and closes (observability)
- Provide a fallback path when the circuit is open
- Make threshold and cooldown configurable
- Monitor circuit state — if it stays open, the dependency needs attention

## Script Error Handling

Scripts (CLI tools, migration scripts, data generators) have different error handling needs than API servers.

```typescript
// GOOD script pattern
async function main() {
	const results = { succeeded: 0, failed: 0, errors: [] as string[] };

	for (const item of items) {
		try {
			await process(item);
			results.succeeded++;
		} catch (err) {
			results.failed++;
			results.errors.push(`${item.id}: ${(err as Error).message}`);
		}
	}

	console.log(`Done: ${results.succeeded} succeeded, ${results.failed} failed`);
	if (results.errors.length > 0) {
		console.error("Errors:", results.errors.join("\n"));
		process.exit(1);
	}
}
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| Bare `catch (e) {}` | Error disappears completely | Log or re-throw |
| Retry without backoff | Hammers failing service | Exponential backoff with jitter |
| Swallowing errors in loops | Partial failures go unnoticed | Accumulate errors, report at end |
| `catch (e) { return null }` | Caller cannot distinguish "not found" from "failed" | Throw typed errors or return Result type |
| Logging error object directly | `[Object object]` in logs | Log `err.message` and `err.stack` separately |
| `process.exit(0)` after error log | CI/CD thinks script succeeded | Exit non-zero on any failure |

## Retry with Exponential Backoff

```typescript
async function withRetry<T>(
	fn: () => Promise<T>,
	{ maxRetries = 3, baseDelayMs = 1000 } = {},
): Promise<T> {
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (err) {
			if (attempt === maxRetries) throw err;
			const delay = baseDelayMs * 2 ** attempt + Math.random() * 1000;
			console.warn(`Retry ${attempt + 1}/${maxRetries} in ${Math.round(delay)}ms`);
			await new Promise((r) => setTimeout(r, delay));
		}
	}
	throw new Error("unreachable");
}
```

## Error Classification Hierarchy

1. **Fatal** — Cannot continue, exit process (missing config, corrupt data)
2. **Operational** — Expected failures, handle gracefully (network timeout, 404, rate limit)
3. **Programmer** — Bugs, should crash in dev (null reference, type mismatch)

Design error handling around this hierarchy. Fatal errors exit. Operational errors retry or degrade. Programmer errors surface loudly in development.

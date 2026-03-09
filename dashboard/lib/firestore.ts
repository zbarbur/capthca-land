import { cert, getApps, initializeApp } from "firebase-admin/app";
import { type Firestore, getFirestore } from "firebase-admin/firestore";

const USE_MEMORY_STORE = process.env.USE_MEMORY_STORE === "true";

export function getCollectionPrefix(): string {
	const env = process.env.CAPTHCA_LAND_ENV || "local";
	switch (env) {
		case "prd":
			return "prd_";
		case "stg":
			return "stg_";
		default:
			return "local_";
	}
}

// In-memory store for local dev without Java/emulator
const memoryStore = new Map<string, Map<string, Record<string, unknown>>>();

export interface DocSnapshot {
	id: string;
	data(): Record<string, unknown>;
}

export interface QuerySnapshot {
	docs: DocSnapshot[];
	size: number;
}

export interface QueryRef {
	get(): Promise<QuerySnapshot>;
	limit(n: number): QueryRef;
	startAfter(doc: DocSnapshot): QueryRef;
	orderBy(field: string, direction?: "asc" | "desc"): QueryRef;
	where(field: string, op: string, value: unknown): QueryRef;
}

export interface DocRef {
	set(
		data: Record<string, unknown>,
		options?: { merge?: boolean } & Record<string, unknown>,
	): Promise<unknown>;
	delete(): Promise<unknown>;
}

export interface CollectionRef extends QueryRef {
	doc(id: string): DocRef;
}

export interface DbLike {
	collection(name: string): CollectionRef;
}

/**
 * Mask an IP address by replacing the last octet with "xxx".
 * IPv6 addresses are returned with the last group masked.
 */
export function maskIp(ip: string): string {
	if (!ip) return "unknown";
	// IPv4
	const ipv4Parts = ip.split(".");
	if (ipv4Parts.length === 4) {
		ipv4Parts[3] = "xxx";
		return ipv4Parts.join(".");
	}
	// IPv6 — mask last group
	const ipv6Parts = ip.split(":");
	if (ipv6Parts.length > 1) {
		ipv6Parts[ipv6Parts.length - 1] = "xxxx";
		return ipv6Parts.join(":");
	}
	return ip;
}

function createMemoryQueryRef(
	col: Map<string, Record<string, unknown>>,
	filters: Array<{ field: string; op: string; value: unknown }> = [],
	orderByField?: string,
	orderByDir?: "asc" | "desc",
	limitN?: number,
	startAfterDoc?: DocSnapshot,
): QueryRef {
	const applyFilters = (): DocSnapshot[] => {
		let entries = Array.from(col.entries()).map(([id, data]) => ({
			id,
			data: () => ({ ...data }),
		}));

		for (const filter of filters) {
			entries = entries.filter((doc) => {
				const val = doc.data()[filter.field];
				switch (filter.op) {
					case "==":
						return val === filter.value;
					case "!=":
						return val !== filter.value;
					case ">":
						return (val as number) > (filter.value as number);
					case ">=":
						return (val as number) >= (filter.value as number);
					case "<":
						return (val as number) < (filter.value as number);
					case "<=":
						return (val as number) <= (filter.value as number);
					default:
						return true;
				}
			});
		}

		if (orderByField) {
			entries.sort((a, b) => {
				const aVal = a.data()[orderByField];
				const bVal = b.data()[orderByField];
				if (aVal === bVal) return 0;
				const cmp = aVal != null && bVal != null && aVal < bVal ? -1 : 1;
				return orderByDir === "desc" ? -cmp : cmp;
			});
		}

		if (startAfterDoc) {
			const idx = entries.findIndex((e) => e.id === startAfterDoc.id);
			if (idx >= 0) {
				entries = entries.slice(idx + 1);
			}
		}

		if (limitN != null) {
			entries = entries.slice(0, limitN);
		}

		return entries;
	};

	return {
		async get(): Promise<QuerySnapshot> {
			const docs = applyFilters();
			return { docs, size: docs.length };
		},
		where(field: string, op: string, value: unknown): QueryRef {
			return createMemoryQueryRef(
				col,
				[...filters, { field, op, value }],
				orderByField,
				orderByDir,
				limitN,
				startAfterDoc,
			);
		},
		orderBy(field: string, direction?: "asc" | "desc"): QueryRef {
			return createMemoryQueryRef(col, filters, field, direction || "asc", limitN, startAfterDoc);
		},
		limit(n: number): QueryRef {
			return createMemoryQueryRef(col, filters, orderByField, orderByDir, n, startAfterDoc);
		},
		startAfter(doc: DocSnapshot): QueryRef {
			return createMemoryQueryRef(col, filters, orderByField, orderByDir, limitN, doc);
		},
	};
}

function createMemoryDb(): DbLike {
	return {
		collection(name: string) {
			if (!memoryStore.has(name)) {
				memoryStore.set(name, new Map());
			}
			// biome-ignore lint/style/noNonNullAssertion: guaranteed by has-check above
			const col = memoryStore.get(name)!;

			const queryRef = createMemoryQueryRef(col);

			return {
				doc(id: string): DocRef {
					return {
						async set(data: Record<string, unknown>, options?: { merge?: boolean }) {
							if (options?.merge && col.has(id)) {
								const existing = col.get(id) ?? {};
								col.set(id, { ...existing, ...data });
							} else {
								col.set(id, data);
							}
							console.log(`[memory-store] ${name}/${id}:`, col.get(id));
						},
						async delete() {
							col.delete(id);
							console.log(`[memory-store] deleted ${name}/${id}`);
						},
					};
				},
				get: queryRef.get.bind(queryRef),
				where(field: string, op: string, value: unknown): QueryRef {
					return createMemoryQueryRef(col, [{ field, op, value }]);
				},
				orderBy(field: string, direction?: "asc" | "desc"): QueryRef {
					return createMemoryQueryRef(col, [], field, direction || "asc");
				},
				limit(n: number): QueryRef {
					return createMemoryQueryRef(col, [], undefined, undefined, n);
				},
				startAfter(doc: DocSnapshot): QueryRef {
					return createMemoryQueryRef(col, [], undefined, undefined, undefined, doc);
				},
			};
		},
	};
}

function createFirestoreDb(): Firestore {
	if (getApps().length > 0) {
		return getFirestore(getApps()[0]);
	}

	// When FIRESTORE_EMULATOR_HOST is set, credentials are not required
	if (process.env.FIRESTORE_EMULATOR_HOST) {
		return getFirestore(initializeApp({ projectId: "capthca-local" }));
	}

	// Production: use default credentials (Cloud Run service account)
	const options: Record<string, unknown> = {
		projectId: process.env.GOOGLE_CLOUD_PROJECT || "capthca-489205",
	};
	if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
		options.credential = cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
	}
	return getFirestore(initializeApp(options));
}

let _db: DbLike | null = null;

export const db: DbLike = {
	collection(name: string) {
		if (!_db) {
			_db = USE_MEMORY_STORE ? createMemoryDb() : createFirestoreDb();
		}
		return _db.collection(`${getCollectionPrefix()}${name}`);
	},
};

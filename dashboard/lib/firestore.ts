import { cert, getApps, initializeApp } from "firebase-admin/app";
import { type Firestore, getFirestore } from "firebase-admin/firestore";

const USE_MEMORY_STORE = process.env.USE_MEMORY_STORE === "true";

// In-memory store for local dev without Java/emulator
const memoryStore = new Map<string, Map<string, Record<string, unknown>>>();

export interface DocRef {
	set(data: Record<string, unknown>, options?: { merge?: boolean }): Promise<void>;
}

export interface CollectionRef {
	doc(id: string): DocRef;
}

export interface DbLike {
	collection(name: string): CollectionRef;
}

function createMemoryDb(): DbLike {
	return {
		collection(name: string) {
			if (!memoryStore.has(name)) {
				memoryStore.set(name, new Map());
			}
			// biome-ignore lint/style/noNonNullAssertion: guaranteed by has-check above
			const col = memoryStore.get(name)!;
			return {
				doc(id: string) {
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
					};
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
	const app = initializeApp({
		credential: process.env.GOOGLE_APPLICATION_CREDENTIALS
			? cert(process.env.GOOGLE_APPLICATION_CREDENTIALS)
			: undefined,
		projectId: process.env.GOOGLE_CLOUD_PROJECT || "capthca-land",
	});
	return getFirestore(app);
}

export const db: DbLike = USE_MEMORY_STORE ? createMemoryDb() : createFirestoreDb();

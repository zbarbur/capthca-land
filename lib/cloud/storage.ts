import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

// ── Interface ─────────────────────────────────────────────────────────

export interface ObjectStorage {
	uploadFile(
		bucket: string,
		key: string,
		data: string | Buffer,
		contentType?: string,
	): Promise<void>;
	getFile(bucket: string, key: string): Promise<Buffer>;
	listFiles(bucket: string, prefix: string): Promise<string[]>;
	deleteFile(bucket: string, key: string): Promise<void>;
}

// ── GCS implementation (lazy-loaded SDK) ──────────────────────────────
// Install @google-cloud/storage when using GCP: npm install @google-cloud/storage

// biome-ignore lint/suspicious/noExplicitAny: GCS SDK loaded dynamically
type GCSClient = any;

export class GCSObjectStorage implements ObjectStorage {
	private client: GCSClient;

	private async getClient(): Promise<GCSClient> {
		if (this.client) return this.client;
		const pkg = "@google-cloud/storage";
		const { Storage } = await import(/* webpackIgnore: true */ pkg);
		this.client = new Storage();
		return this.client;
	}

	async uploadFile(
		bucket: string,
		key: string,
		data: string | Buffer,
		contentType?: string,
	): Promise<void> {
		const client = await this.getClient();
		const file = client.bucket(bucket).file(key);
		await file.save(data instanceof Buffer ? data : Buffer.from(data), {
			contentType: contentType ?? "application/octet-stream",
		});
	}

	async getFile(bucket: string, key: string): Promise<Buffer> {
		const client = await this.getClient();
		const [content] = await client.bucket(bucket).file(key).download();
		return content;
	}

	async listFiles(bucket: string, prefix: string): Promise<string[]> {
		const client = await this.getClient();
		const [files] = await client.bucket(bucket).getFiles({ prefix });
		return (files as Array<{ name: string }>).map((f) => f.name);
	}

	async deleteFile(bucket: string, key: string): Promise<void> {
		const client = await this.getClient();
		await client.bucket(bucket).file(key).delete();
	}
}

// ── Local filesystem implementation ───────────────────────────────────

export class LocalObjectStorage implements ObjectStorage {
	private baseDir: string;

	constructor(baseDir?: string) {
		this.baseDir = baseDir ?? process.env.LOCAL_STORAGE_DIR ?? "data";
	}

	private filePath(bucket: string, key: string): string {
		return join(this.baseDir, bucket, key);
	}

	async uploadFile(
		bucket: string,
		key: string,
		data: string | Buffer,
		_contentType?: string,
	): Promise<void> {
		const path = this.filePath(bucket, key);
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(path, data);
	}

	async getFile(bucket: string, key: string): Promise<Buffer> {
		const path = this.filePath(bucket, key);
		return readFileSync(path);
	}

	async listFiles(bucket: string, prefix: string): Promise<string[]> {
		const bucketDir = join(this.baseDir, bucket);
		const prefixDir = join(bucketDir, prefix);

		if (!existsSync(prefixDir)) return [];

		const results: string[] = [];
		const walk = (dir: string): void => {
			const entries = readdirSync(dir, { withFileTypes: true });
			for (const entry of entries) {
				const full = join(dir, entry.name);
				if (entry.isDirectory()) {
					walk(full);
				} else {
					results.push(relative(bucketDir, full));
				}
			}
		};
		walk(prefixDir);

		return results;
	}

	async deleteFile(bucket: string, key: string): Promise<void> {
		const path = this.filePath(bucket, key);
		rmSync(path, { force: true });
	}
}

// ── Factory ───────────────────────────────────────────────────────────

let _instance: ObjectStorage | undefined;

export function createObjectStorage(): ObjectStorage {
	if (_instance) return _instance;

	const isGcp = process.env.STORAGE_PROVIDER === "gcp" || !!process.env.K_SERVICE;

	_instance = isGcp ? new GCSObjectStorage() : new LocalObjectStorage();
	return _instance;
}

/** Reset the cached singleton (for testing). */
export function resetObjectStorage(): void {
	_instance = undefined;
}

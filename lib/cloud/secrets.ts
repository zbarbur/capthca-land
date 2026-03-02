// ---------------------------------------------------------------------------
// General-Purpose Secret Provider
// Swap implementations via factory based on environment (local vs cloud).
// ---------------------------------------------------------------------------

export interface SecretProvider {
	/** Fetch a secret by name */
	getSecret(name: string): Promise<string>;
	/** Provider name for logging (e.g., "gcp", "env") */
	readonly provider: string;
}

// ---------------------------------------------------------------------------
// GCP Secret Manager Provider (REST API, no SDK dependency)
// ---------------------------------------------------------------------------

export class GCPSecretProvider implements SecretProvider {
	readonly provider = "gcp";
	private cache = new Map<string, string>();

	async getSecret(name: string): Promise<string> {
		const cached = this.cache.get(name);
		if (cached !== undefined) return cached;

		const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
		if (!projectId) {
			throw new Error(
				"GOOGLE_CLOUD_PROJECT or GCP_PROJECT env var is required for GCP Secret Manager",
			);
		}

		const accessToken = await this.getAccessToken();

		const url =
			`https://secretmanager.googleapis.com/v1/projects/${projectId}` +
			`/secrets/${name}/versions/latest:access`;

		const res = await fetch(url, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		if (!res.ok) {
			throw new Error(`Secret Manager API error for "${name}": ${res.status} ${res.statusText}`);
		}

		const data = (await res.json()) as { payload: { data: string } };
		const value = Buffer.from(data.payload.data, "base64").toString("utf-8");

		this.cache.set(name, value);
		return value;
	}

	private async getAccessToken(): Promise<string> {
		const res = await fetch(
			"http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
			{ headers: { "Metadata-Flavor": "Google" } },
		);
		if (!res.ok) {
			throw new Error("Failed to get access token from GCE metadata server");
		}
		const body = (await res.json()) as { access_token: string };
		return body.access_token;
	}
}

// ---------------------------------------------------------------------------
// Environment Variable Provider (for local development)
// ---------------------------------------------------------------------------

export class EnvSecretProvider implements SecretProvider {
	readonly provider = "env";

	constructor(private prefix = "{{ENV_PREFIX}}") {}

	async getSecret(name: string): Promise<string> {
		const envKey = `${this.prefix}${name.replace(/[-.]/g, "_").toUpperCase()}`;
		const value = process.env[envKey];
		if (value === undefined) {
			throw new Error(`Secret "${name}" not found: expected env var ${envKey} to be set`);
		}
		return value;
	}
}

// ---------------------------------------------------------------------------
// Factory — singleton with auto-detection
// ---------------------------------------------------------------------------

let _instance: SecretProvider | undefined;

export function createSecretProvider(): SecretProvider {
	if (_instance) return _instance;

	if (process.env.SECRET_PROVIDER === "gcp" || process.env.K_SERVICE) {
		_instance = new GCPSecretProvider();
	} else {
		_instance = new EnvSecretProvider();
	}

	return _instance;
}

/** Reset the cached singleton (for testing) */
export function resetSecretProvider(): void {
	_instance = undefined;
}

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
	createSecretProvider,
	EnvSecretProvider,
	resetSecretProvider,
} from "../../dashboard/lib/secrets.ts";

describe("EnvSecretProvider", () => {
	afterEach(() => {
		for (const key of Object.keys(process.env)) {
			if (key.startsWith("CAPTHCA_LAND_TEST_")) {
				delete process.env[key];
			}
		}
	});

	it("resolves secret from prefixed env var", async () => {
		process.env.CAPTHCA_LAND_MY_SECRET = "hunter2";
		const provider = new EnvSecretProvider();
		const value = await provider.getSecret("my-secret");
		assert.equal(value, "hunter2");
		delete process.env.CAPTHCA_LAND_MY_SECRET;
	});

	it("transforms kebab-case to UPPER_SNAKE_CASE", async () => {
		process.env.CAPTHCA_LAND_TURNSTILE_SECRET_KEY = "test-key";
		const provider = new EnvSecretProvider();
		const value = await provider.getSecret("turnstile-secret-key");
		assert.equal(value, "test-key");
		delete process.env.CAPTHCA_LAND_TURNSTILE_SECRET_KEY;
	});

	it("throws when env var is missing", async () => {
		const provider = new EnvSecretProvider();
		await assert.rejects(
			() => provider.getSecret("nonexistent-secret"),
			(err: Error) => {
				assert.ok(err.message.includes("CAPTHCA_LAND_NONEXISTENT_SECRET"));
				return true;
			},
		);
	});

	it("supports custom prefix", async () => {
		process.env.CUSTOM_MY_KEY = "custom-val";
		const provider = new EnvSecretProvider("CUSTOM_");
		const value = await provider.getSecret("my-key");
		assert.equal(value, "custom-val");
		delete process.env.CUSTOM_MY_KEY;
	});
});

describe("createSecretProvider factory", () => {
	afterEach(() => {
		resetSecretProvider();
		delete process.env.SECRET_PROVIDER;
		delete process.env.K_SERVICE;
	});

	it("returns EnvSecretProvider when not on GCP", () => {
		delete process.env.K_SERVICE;
		delete process.env.SECRET_PROVIDER;
		resetSecretProvider();
		const provider = createSecretProvider();
		assert.equal(provider.provider, "env");
	});

	it("returns singleton on repeated calls", () => {
		resetSecretProvider();
		const a = createSecretProvider();
		const b = createSecretProvider();
		assert.equal(a, b);
	});
});

describe("Turnstile secret via provider", () => {
	afterEach(() => {
		resetSecretProvider();
		delete process.env.CAPTHCA_LAND_TURNSTILE_SECRET_KEY;
	});

	it("resolves turnstile-secret-key from CAPTHCA_LAND_ env var", async () => {
		process.env.CAPTHCA_LAND_TURNSTILE_SECRET_KEY = "0x_test_turnstile_key";
		resetSecretProvider();
		const provider = createSecretProvider();
		const secret = await provider.getSecret("turnstile-secret-key");
		assert.equal(secret, "0x_test_turnstile_key");
	});
});

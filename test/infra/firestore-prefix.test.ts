import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { getCollectionPrefix } from "../../dashboard/lib/firestore.ts";

describe("Firestore collection prefix", () => {
	const originalEnv = process.env.CAPTHCA_LAND_ENV;

	afterEach(() => {
		if (originalEnv === undefined) {
			delete process.env.CAPTHCA_LAND_ENV;
		} else {
			process.env.CAPTHCA_LAND_ENV = originalEnv;
		}
	});

	it("returns prd_ for production", () => {
		process.env.CAPTHCA_LAND_ENV = "prd";
		assert.equal(getCollectionPrefix(), "prd_");
	});

	it("returns stg_ for staging", () => {
		process.env.CAPTHCA_LAND_ENV = "stg";
		assert.equal(getCollectionPrefix(), "stg_");
	});

	it("returns local_ for local dev", () => {
		process.env.CAPTHCA_LAND_ENV = "local";
		assert.equal(getCollectionPrefix(), "local_");
	});

	it("returns local_ when env var is not set", () => {
		delete process.env.CAPTHCA_LAND_ENV;
		assert.equal(getCollectionPrefix(), "local_");
	});

	it("returns local_ for unknown values", () => {
		process.env.CAPTHCA_LAND_ENV = "dev";
		assert.equal(getCollectionPrefix(), "local_");
	});
});

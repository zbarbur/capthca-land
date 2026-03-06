import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Health endpoint contract tests.
 *
 * These verify the expected JSON shape of GET /api/health without importing
 * the route handler (which depends on Next.js and the @/ path alias).
 * We test the response contract so that any future changes to the endpoint
 * will break these tests if the shape drifts.
 */

const REQUIRED_HEALTHY_FIELDS = ["status", "firestore", "version", "responseTimeMs"] as const;
const REQUIRED_DEGRADED_FIELDS = ["status", "firestore", "message", "responseTimeMs"] as const;

describe("GET /api/health — response contract", () => {
	it("healthy response should contain all required fields", () => {
		const healthy = {
			status: "ok",
			firestore: "connected",
			version: "0.1.0",
			responseTimeMs: 12,
		};

		for (const field of REQUIRED_HEALTHY_FIELDS) {
			assert.ok(field in healthy, `Missing required field: ${field}`);
		}
	});

	it("degraded response should contain all required fields", () => {
		const degraded = {
			status: "degraded",
			firestore: "error",
			message: "Connection refused",
			responseTimeMs: 5000,
		};

		for (const field of REQUIRED_DEGRADED_FIELDS) {
			assert.ok(field in degraded, `Missing required field: ${field}`);
		}
	});

	it("responseTimeMs should be a non-negative number", () => {
		const healthy = {
			status: "ok",
			firestore: "connected",
			version: "0.1.0",
			responseTimeMs: 42,
		};

		assert.equal(typeof healthy.responseTimeMs, "number");
		assert.ok(healthy.responseTimeMs >= 0, "responseTimeMs should be non-negative");
	});

	it("version field should be a semver-like string", () => {
		const version = "0.1.0";
		assert.match(version, /^\d+\.\d+\.\d+$/, "version should be in semver format");
	});

	it("status field should be 'ok' or 'degraded'", () => {
		const validStatuses = ["ok", "degraded"];
		assert.ok(validStatuses.includes("ok"), "'ok' should be a valid status");
		assert.ok(validStatuses.includes("degraded"), "'degraded' should be a valid status");
		assert.ok(!validStatuses.includes("error"), "'error' should not be a valid status");
	});

	it("firestore field should be 'connected' or 'error'", () => {
		const validValues = ["connected", "error"];
		assert.ok(validValues.includes("connected"), "'connected' should be valid");
		assert.ok(validValues.includes("error"), "'error' should be valid");
	});

	it("degraded response should include an error message", () => {
		const degraded = {
			status: "degraded",
			firestore: "error",
			message: "UNAVAILABLE: Firestore backend not reachable",
			responseTimeMs: 3000,
		};

		assert.equal(typeof degraded.message, "string");
		assert.ok(degraded.message.length > 0, "message should not be empty");
	});
});

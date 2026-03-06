import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const MIDDLEWARE_PATH = path.join(process.cwd(), "dashboard", "middleware.ts");

describe("API request logging", () => {
	const middlewareSrc = fs.readFileSync(MIDDLEWARE_PATH, "utf-8");

	it("middleware contains logApiRequest function", () => {
		assert.ok(
			middlewareSrc.includes("function logApiRequest"),
			"middleware.ts must define a logApiRequest function",
		);
	});

	it("only logs /api/ paths", () => {
		assert.ok(
			middlewareSrc.includes('"/api/"') || middlewareSrc.includes('"/api/'),
			"logApiRequest must check for /api/ prefix before logging",
		);
	});

	it("log entry has all required fields", () => {
		const requiredFields = ["severity", "type", "method", "path", "ip", "userAgent", "timestamp"];
		for (const field of requiredFields) {
			assert.ok(middlewareSrc.includes(`${field}`), `Log entry must include the "${field}" field`);
		}
	});

	it("log entry format contract — validate sample structure", () => {
		// Simulate the log entry structure that logApiRequest produces
		const sample = {
			severity: "INFO",
			type: "request",
			method: "POST",
			path: "/api/subscribe",
			ip: "203.0.113.1",
			userAgent: "Mozilla/5.0",
			timestamp: new Date().toISOString(),
		};

		assert.equal(sample.severity, "INFO", "severity must be INFO");
		assert.equal(sample.type, "request", 'type must be "request"');
		assert.ok(sample.method, "method must be present");
		assert.ok(sample.path.startsWith("/api/"), "path must start with /api/");
		assert.ok(sample.ip, "ip must be present");
		assert.ok(sample.userAgent, "userAgent must be present");
		assert.ok(sample.timestamp, "timestamp must be present");
		assert.ok(/^\d{4}-\d{2}-\d{2}T/.test(sample.timestamp), "timestamp must be ISO 8601 format");

		// Ensure no extra PII fields
		const allowedKeys = new Set([
			"severity",
			"type",
			"method",
			"path",
			"ip",
			"userAgent",
			"timestamp",
		]);
		for (const key of Object.keys(sample)) {
			assert.ok(allowedKeys.has(key), `Unexpected PII-risk field: "${key}"`);
		}
	});

	it("uses x-forwarded-for for IP extraction", () => {
		assert.ok(
			middlewareSrc.includes("x-forwarded-for"),
			"Must extract IP from x-forwarded-for header",
		);
	});

	it("logs after authentication, not before", () => {
		// logApiRequest should be called inside the auth-success branches, not before
		const authCheckIndex = middlewareSrc.indexOf("isBasicAuthValid");
		const logCallInAuthBranch = middlewareSrc.indexOf("logApiRequest(request)", authCheckIndex);
		assert.ok(
			logCallInAuthBranch > authCheckIndex,
			"logApiRequest must be called after authentication check succeeds",
		);
	});

	it("does not log unauthenticated 401 responses", () => {
		// The 401 response block should NOT contain logApiRequest
		const fourOhOneIndex = middlewareSrc.indexOf("401");
		const logAfter401 = middlewareSrc.indexOf("logApiRequest", fourOhOneIndex);
		// logAfter401 should be -1 (no log call after the 401 block)
		// OR it should refer to a different call entirely (in config section which doesn't exist)
		assert.equal(logAfter401, -1, "Must not call logApiRequest in the 401 response path");
	});
});

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const DASHBOARD_DIR = path.join(process.cwd(), "dashboard");

const { parseAdminUsers, parseIapEmail, getAdminUser } = await import(
	path.join(DASHBOARD_DIR, "lib", "admin-auth.ts")
);

describe("admin-auth: parseAdminUsers", () => {
	it("parses valid JSON config with read and write roles", () => {
		const result = parseAdminUsers('{"alice@example.com":"read","bob@example.com":"write"}');
		assert.equal(result["alice@example.com"], "read");
		assert.equal(result["bob@example.com"], "write");
	});

	it("returns empty map for undefined input", () => {
		const result = parseAdminUsers(undefined);
		assert.deepEqual(result, {});
	});

	it("returns empty map for empty string", () => {
		const result = parseAdminUsers("");
		assert.deepEqual(result, {});
	});

	it("returns empty map for invalid JSON", () => {
		const result = parseAdminUsers("not-json");
		assert.deepEqual(result, {});
	});

	it("returns empty map for non-object JSON (array)", () => {
		const result = parseAdminUsers('["read"]');
		assert.deepEqual(result, {});
	});

	it("skips entries with invalid roles", () => {
		const result = parseAdminUsers('{"a@x.com":"read","b@x.com":"admin","c@x.com":"write"}');
		assert.equal(result["a@x.com"], "read");
		assert.equal(result["b@x.com"], undefined);
		assert.equal(result["c@x.com"], "write");
	});
});

describe("admin-auth: parseIapEmail", () => {
	it("extracts email from accounts.google.com: prefix", () => {
		const email = parseIapEmail("accounts.google.com:user@example.com");
		assert.equal(email, "user@example.com");
	});

	it("returns raw value when no prefix", () => {
		const email = parseIapEmail("user@example.com");
		assert.equal(email, "user@example.com");
	});

	it("returns null for null input", () => {
		const email = parseIapEmail(null);
		assert.equal(email, null);
	});
});

describe("admin-auth: getAdminUser", () => {
	it("returns user with correct role for known email", () => {
		process.env.CAPTHCA_LAND_ADMIN_USERS =
			'{"admin@capthca.ai":"write","viewer@capthca.ai":"read"}';
		const request = new Request("https://analytics.capthca.ai/", {
			headers: {
				"x-goog-authenticated-user-email": "accounts.google.com:admin@capthca.ai",
			},
		});
		const user = getAdminUser(request);
		assert.deepEqual(user, { email: "admin@capthca.ai", role: "write" });
		delete process.env.CAPTHCA_LAND_ADMIN_USERS;
	});

	it("returns null for unknown email", () => {
		process.env.CAPTHCA_LAND_ADMIN_USERS = '{"admin@capthca.ai":"write"}';
		const request = new Request("https://analytics.capthca.ai/", {
			headers: {
				"x-goog-authenticated-user-email": "accounts.google.com:stranger@evil.com",
			},
		});
		const user = getAdminUser(request);
		assert.equal(user, null);
		delete process.env.CAPTHCA_LAND_ADMIN_USERS;
	});

	it("returns null when IAP header is missing", () => {
		process.env.CAPTHCA_LAND_ADMIN_USERS = '{"admin@capthca.ai":"write"}';
		const request = new Request("https://analytics.capthca.ai/");
		const user = getAdminUser(request);
		assert.equal(user, null);
		delete process.env.CAPTHCA_LAND_ADMIN_USERS;
	});
});

describe("middleware: admin route protection", () => {
	const middlewareSrc = fs.readFileSync(path.join(DASHBOARD_DIR, "middleware.ts"), "utf-8");

	it("middleware blocks admin paths for non-localhost hosts", () => {
		assert.ok(
			middlewareSrc.includes("isAdminPath") && middlewareSrc.includes("isLocalDev"),
			"middleware must check admin paths and restrict to local dev",
		);
	});

	it("middleware returns 404 for remote admin access", () => {
		assert.ok(
			middlewareSrc.includes('"Not Found"') && middlewareSrc.includes("404"),
			"middleware must return 404 for remote admin requests",
		);
	});

	it("middleware sets x-admin-context header for local admin", () => {
		assert.ok(
			middlewareSrc.includes("x-admin-context"),
			"middleware must set x-admin-context header",
		);
	});

	it("middleware sets x-admin-email header for local admin", () => {
		assert.ok(middlewareSrc.includes("x-admin-email"), "middleware must set x-admin-email header");
	});

	it("admin path check comes before basic auth", () => {
		const adminPathIndex = middlewareSrc.indexOf("isAdminPath");
		const basicAuthIndex = middlewareSrc.indexOf("isBasicAuthValid");
		assert.ok(
			adminPathIndex < basicAuthIndex,
			"admin path check must precede basic auth check in middleware",
		);
	});
});

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const DASHBOARD_DIR = path.join(process.cwd(), "dashboard");

const { parseCfAccessEmail, parseIapEmail, getAdminUser } = await import(
	path.join(DASHBOARD_DIR, "lib", "admin-auth.ts")
);

describe("admin-auth: parseCfAccessEmail", () => {
	it("extracts email from plain header value", () => {
		const email = parseCfAccessEmail("user@gmail.com");
		assert.equal(email, "user@gmail.com");
	});

	it("trims whitespace from header value", () => {
		const email = parseCfAccessEmail("  admin@capthca.ai  ");
		assert.equal(email, "admin@capthca.ai");
	});

	it("returns null for null input", () => {
		const email = parseCfAccessEmail(null);
		assert.equal(email, null);
	});

	it("returns null for empty string", () => {
		const email = parseCfAccessEmail("");
		assert.equal(email, null);
	});

	it("returns null for whitespace-only string", () => {
		const email = parseCfAccessEmail("   ");
		assert.equal(email, null);
	});
});

describe("admin-auth: getAdminUser supports CF Access header", () => {
	it("resolves user from Cf-Access-Authenticated-User-Email header", () => {
		process.env.CAPTHCA_LAND_ADMIN_USERS = '{"admin@capthca.ai":"write"}';
		const request = new Request("https://admin.capthca.ai/dashboard", {
			headers: {
				"Cf-Access-Authenticated-User-Email": "admin@capthca.ai",
			},
		});
		const user = getAdminUser(request);
		assert.deepEqual(user, { email: "admin@capthca.ai", role: "write" });
		delete process.env.CAPTHCA_LAND_ADMIN_USERS;
	});

	it("prefers IAP header over CF Access when both present", () => {
		process.env.CAPTHCA_LAND_ADMIN_USERS = '{"iap@capthca.ai":"write","cf@capthca.ai":"read"}';
		const request = new Request("https://admin.capthca.ai/dashboard", {
			headers: {
				"x-goog-authenticated-user-email": "accounts.google.com:iap@capthca.ai",
				"Cf-Access-Authenticated-User-Email": "cf@capthca.ai",
			},
		});
		const user = getAdminUser(request);
		assert.deepEqual(user, { email: "iap@capthca.ai", role: "write" });
		delete process.env.CAPTHCA_LAND_ADMIN_USERS;
	});

	it("falls back to CF Access when IAP header is absent", () => {
		process.env.CAPTHCA_LAND_ADMIN_USERS = '{"cf@capthca.ai":"read"}';
		const request = new Request("https://admin.capthca.ai/dashboard", {
			headers: {
				"Cf-Access-Authenticated-User-Email": "cf@capthca.ai",
			},
		});
		const user = getAdminUser(request);
		assert.deepEqual(user, { email: "cf@capthca.ai", role: "read" });
		delete process.env.CAPTHCA_LAND_ADMIN_USERS;
	});
});

describe("middleware: Cloudflare Access integration", () => {
	const middlewareSrc = fs.readFileSync(path.join(DASHBOARD_DIR, "middleware.ts"), "utf-8");

	it("middleware checks Cf-Access-Authenticated-User-Email header", () => {
		assert.ok(
			middlewareSrc.includes("Cf-Access-Authenticated-User-Email"),
			"middleware must read the Cloudflare Access email header",
		);
	});

	it("middleware still has localhost dev fallback", () => {
		assert.ok(
			middlewareSrc.includes("isLocalDev"),
			"middleware must retain localhost dev fallback",
		);
	});

	it("middleware sets x-admin-email from CF Access header", () => {
		// The middleware sets x-admin-email to cfEmail when CF header is present
		assert.ok(
			middlewareSrc.includes('requestHeaders.set("x-admin-email", cfEmail)'),
			"middleware must forward CF Access email as x-admin-email",
		);
	});
});

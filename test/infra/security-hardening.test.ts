import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const DASHBOARD_DIR = path.join(process.cwd(), "dashboard");

describe("security hardening", () => {
	it("HSTS header with 1-year max-age is configured", () => {
		const config = fs.readFileSync(path.join(DASHBOARD_DIR, "next.config.mjs"), "utf-8");
		assert.ok(
			config.includes("Strict-Transport-Security"),
			"next.config.mjs must include Strict-Transport-Security header",
		);
		assert.ok(
			config.includes("max-age=31536000"),
			"HSTS max-age must be at least 1 year (31536000)",
		);
	});

	it("CSP includes required directives", () => {
		const config = fs.readFileSync(path.join(DASHBOARD_DIR, "next.config.mjs"), "utf-8");
		for (const directive of ["default-src", "script-src", "frame-ancestors"]) {
			assert.ok(config.includes(directive), `CSP must include ${directive} directive`);
		}
	});

	it("API error responses do not reflect user input", () => {
		const apiDir = path.join(DASHBOARD_DIR, "app", "api");
		const routeFiles: string[] = [];

		function findRoutes(dir: string) {
			for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
				const full = path.join(dir, entry.name);
				if (entry.isDirectory()) findRoutes(full);
				else if (entry.name === "route.ts") routeFiles.push(full);
			}
		}
		findRoutes(apiDir);

		assert.ok(routeFiles.length > 0, "Should find at least one API route");

		for (const file of routeFiles) {
			const content = fs.readFileSync(file, "utf-8");
			const lines = content.split("\n");
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				if (line.includes("error:") && line.includes("${")) {
					assert.fail(
						`${file}:${i + 1} — error response appears to reflect user input: ${line.trim()}`,
					);
				}
			}
		}
	});

	it("subscribe route has body size limit", () => {
		const route = fs.readFileSync(
			path.join(DASHBOARD_DIR, "app", "api", "subscribe", "route.ts"),
			"utf-8",
		);
		assert.ok(
			route.includes("payload_too_large") || route.includes("413"),
			"subscribe route must check body size and return 413",
		);
	});

	it("Firestore collections use environment prefix", () => {
		const firestore = fs.readFileSync(path.join(DASHBOARD_DIR, "lib", "firestore.ts"), "utf-8");
		assert.ok(
			firestore.includes("getCollectionPrefix"),
			"firestore.ts must use getCollectionPrefix for environment isolation",
		);
		assert.ok(
			firestore.includes("prd_") && firestore.includes("stg_") && firestore.includes("local_"),
			"firestore.ts must define prd_, stg_, and local_ prefixes",
		);
	});
});

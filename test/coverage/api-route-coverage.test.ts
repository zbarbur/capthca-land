import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

function findApiRoutes(dir: string): string[] {
	const routes: string[] = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			routes.push(...findApiRoutes(fullPath));
		} else if (entry.name === "route.ts") {
			routes.push(fullPath);
		}
	}
	return routes;
}

function findTestFiles(dir: string): string[] {
	const tests: string[] = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			tests.push(...findTestFiles(fullPath));
		} else if (entry.name.endsWith(".test.ts")) {
			tests.push(fullPath);
		}
	}
	return tests;
}

const KNOWN_UNTESTED: string[] = [];

describe("API route coverage", () => {
	const apiDir = path.resolve("dashboard/app/api");
	const testDir = path.resolve("test");
	const routes = findApiRoutes(apiDir);
	const testFiles = findTestFiles(testDir);

	it("discovers all API routes", () => {
		assert.ok(routes.length >= 3, `Expected at least 3 API routes, found ${routes.length}`);
	});

	it("every API route has a corresponding test file", () => {
		const missing: string[] = [];
		for (const route of routes) {
			const routeName = path.basename(path.dirname(route));
			if (KNOWN_UNTESTED.includes(routeName)) continue;
			const hasTest = testFiles.some((t) => {
				const testContent = fs.readFileSync(t, "utf-8").toLowerCase();
				return (
					t.toLowerCase().includes(routeName) ||
					testContent.includes(routeName) ||
					testContent.includes(`/api/${routeName}`)
				);
			});
			if (!hasTest) missing.push(routeName);
		}
		assert.deepEqual(missing, [], `API routes missing test coverage: ${missing.join(", ")}`);
	});

	it("KNOWN_UNTESTED list is empty", () => {
		assert.equal(
			KNOWN_UNTESTED.length,
			0,
			"All API routes should have test coverage — no exceptions",
		);
	});
});

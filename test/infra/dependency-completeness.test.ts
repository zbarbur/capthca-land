import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

// ---------------------------------------------------------------------------
// Infrastructure test — verify package.json completeness
// Catches missing dependencies before they fail in CI/Docker.
// ---------------------------------------------------------------------------

describe("dependency completeness", () => {
	it("package.json should be valid JSON", () => {
		const raw = readFileSync(join(process.cwd(), "package.json"), "utf-8");
		const pkg = JSON.parse(raw);
		assert.ok(pkg.name, "package.json must have a name");
		assert.ok(pkg.scripts, "package.json must have scripts");
	});

	it("should have required devDependencies", () => {
		const raw = readFileSync(join(process.cwd(), "package.json"), "utf-8");
		const pkg = JSON.parse(raw);
		const devDeps = Object.keys(pkg.devDependencies ?? {});

		const required = ["@biomejs/biome", "typescript", "tsx", "husky"];
		for (const dep of required) {
			assert.ok(devDeps.includes(dep), `Missing devDependency: ${dep}`);
		}
	});

	it("tsconfig.json should be valid JSON", () => {
		const raw = readFileSync(join(process.cwd(), "tsconfig.json"), "utf-8");
		const config = JSON.parse(raw);
		assert.ok(config.compilerOptions, "tsconfig.json must have compilerOptions");
		assert.strictEqual(config.compilerOptions.strict, true, "strict mode must be enabled");
	});
});

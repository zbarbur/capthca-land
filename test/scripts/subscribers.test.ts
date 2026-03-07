import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

describe("subscriber management scripts", () => {
	it("scripts/subscribers.ts exists", () => {
		assert.ok(fs.existsSync(path.resolve("scripts/subscribers.ts")));
	});

	it("bin/subscribers.sh exists and is executable", () => {
		const shellPath = path.resolve("bin/subscribers.sh");
		assert.ok(fs.existsSync(shellPath));
		const stats = fs.statSync(shellPath);
		assert.ok(stats.mode & 0o111, "Should be executable");
	});

	it("script supports required subcommands", () => {
		const source = fs.readFileSync(path.resolve("scripts/subscribers.ts"), "utf-8");
		assert.ok(source.includes('"list"'), "Should support list command");
		assert.ok(source.includes('"count"'), "Should support count command");
		assert.ok(source.includes('"export"'), "Should support export command");
		assert.ok(source.includes('"delete"'), "Should support delete command");
	});

	it("delete command requires --confirm flag", () => {
		const source = fs.readFileSync(path.resolve("scripts/subscribers.ts"), "utf-8");
		assert.ok(source.includes("--confirm"), "Delete should require --confirm flag");
	});
});

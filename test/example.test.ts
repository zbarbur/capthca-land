import assert from "node:assert/strict";
import { describe, it } from "node:test";

// ---------------------------------------------------------------------------
// Example test file — Node.js built-in test runner
// Run: npm test
// ---------------------------------------------------------------------------

describe("example", () => {
	it("should pass a basic assertion", () => {
		assert.strictEqual(1 + 1, 2);
	});

	it("should handle async operations", async () => {
		const result = await Promise.resolve("hello");
		assert.strictEqual(result, "hello");
	});
});

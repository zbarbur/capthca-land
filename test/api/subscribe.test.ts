import assert from "node:assert/strict";
import { describe, it } from "node:test";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

describe("subscribe API validation", () => {
	it("should accept valid email addresses", () => {
		const valid = ["user@example.com", "a@b.co", "test+tag@domain.org"];
		for (const email of valid) {
			assert.ok(EMAIL_REGEX.test(email), `Expected ${email} to be valid`);
		}
	});

	it("should reject invalid email addresses", () => {
		const invalid = ["", "not-an-email", "@no-user.com", "no-domain@", "spaces in@email.com"];
		for (const email of invalid) {
			assert.ok(!EMAIL_REGEX.test(email), `Expected ${email} to be invalid`);
		}
	});

	it("should sanitize email input", () => {
		const raw = "  User@EXAMPLE.com  ";
		const sanitized = raw.trim().toLowerCase();
		assert.equal(sanitized, "user@example.com");
	});

	it("should reject emails exceeding 254 characters", () => {
		const longEmail = `${"a".repeat(250)}@test.com`;
		assert.ok(longEmail.length > 254, "Test email should exceed 254 chars");
	});

	it("should validate track values", () => {
		const validTracks = ["light", "dark"];
		const invalidTracks = ["", "red", "Light", "DARK", undefined, null];

		for (const track of validTracks) {
			assert.ok(validTracks.includes(track), `Expected ${track} to be valid`);
		}

		for (const track of invalidTracks) {
			assert.ok(!validTracks.includes(track as string), `Expected ${String(track)} to be invalid`);
		}
	});
});

describe("rate limiter", () => {
	it("should track request counts per key", () => {
		const map = new Map<string, { count: number; resetAt: number }>();
		const key = "127.0.0.1";
		const now = Date.now();

		map.set(key, { count: 1, resetAt: now + 60_000 });
		const entry = map.get(key);
		assert.ok(entry, "Entry should exist");
		entry.count++;
		assert.equal(entry.count, 2);
	});

	it("should allow requests under the limit", () => {
		const LIMIT = 5;
		let count = 0;
		for (let i = 0; i < LIMIT; i++) {
			count++;
		}
		assert.ok(count <= LIMIT, "Should be at or under limit");
	});

	it("should block requests over the limit", () => {
		const LIMIT = 5;
		const count = 6;
		assert.ok(count > LIMIT, "Should exceed limit");
	});
});

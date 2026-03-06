import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { logger } from "../../dashboard/lib/logger.ts";

describe("logger", () => {
	let captured: string[] = [];
	const originalLog = console.log;
	const originalWarn = console.warn;
	const originalError = console.error;

	beforeEach(() => {
		captured = [];
		console.log = (...args: unknown[]) => {
			captured.push(String(args[0]));
		};
		console.warn = (...args: unknown[]) => {
			captured.push(String(args[0]));
		};
		console.error = (...args: unknown[]) => {
			captured.push(String(args[0]));
		};
	});

	afterEach(() => {
		console.log = originalLog;
		console.warn = originalWarn;
		console.error = originalError;
	});

	it("outputs valid JSON", () => {
		logger.info("test message");
		assert.equal(captured.length, 1);
		const parsed = JSON.parse(captured[0]);
		assert.equal(typeof parsed, "object");
	});

	it("includes severity, message, and timestamp fields", () => {
		logger.info("hello");
		const entry = JSON.parse(captured[0]);
		assert.ok("severity" in entry, "missing severity field");
		assert.ok("message" in entry, "missing message field");
		assert.ok("timestamp" in entry, "missing timestamp field");
	});

	it("sets severity to INFO for info()", () => {
		logger.info("info message");
		const entry = JSON.parse(captured[0]);
		assert.equal(entry.severity, "INFO");
		assert.equal(entry.message, "info message");
	});

	it("sets severity to WARNING for warn()", () => {
		logger.warn("warn message");
		const entry = JSON.parse(captured[0]);
		assert.equal(entry.severity, "WARNING");
		assert.equal(entry.message, "warn message");
	});

	it("sets severity to ERROR for error()", () => {
		logger.error("error message");
		const entry = JSON.parse(captured[0]);
		assert.equal(entry.severity, "ERROR");
		assert.equal(entry.message, "error message");
	});

	it("produces a valid ISO8601 timestamp", () => {
		logger.info("timestamp check");
		const entry = JSON.parse(captured[0]);
		const date = new Date(entry.timestamp);
		assert.ok(!Number.isNaN(date.getTime()), "timestamp is not a valid date");
		assert.equal(entry.timestamp, date.toISOString());
	});

	it("merges metadata into the log entry", () => {
		logger.info("with meta", { requestId: "abc-123", status: 200 });
		const entry = JSON.parse(captured[0]);
		assert.equal(entry.requestId, "abc-123");
		assert.equal(entry.status, 200);
		assert.equal(entry.message, "with meta");
		assert.equal(entry.severity, "INFO");
	});

	it("works without metadata", () => {
		logger.error("bare error");
		const entry = JSON.parse(captured[0]);
		assert.equal(entry.severity, "ERROR");
		assert.equal(entry.message, "bare error");
		// Should only have severity, message, timestamp
		const keys = Object.keys(entry);
		assert.deepEqual(keys.sort(), ["message", "severity", "timestamp"]);
	});
});

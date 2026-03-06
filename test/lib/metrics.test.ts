import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { metrics } from "../../dashboard/lib/metrics.ts";

describe("metrics", () => {
	let captured: string[] = [];
	const originalLog = console.log;

	beforeEach(() => {
		captured = [];
		console.log = (...args: unknown[]) => {
			captured.push(String(args[0]));
		};
	});

	afterEach(() => {
		console.log = originalLog;
	});

	it("increment emits valid JSON", () => {
		metrics.increment("test.metric");
		assert.equal(captured.length, 1);
		const parsed = JSON.parse(captured[0]);
		assert.equal(typeof parsed, "object");
	});

	it("includes type, metric name, value, labels, and timestamp", () => {
		metrics.increment("subscribe.success", { track: "dark" });
		const entry = JSON.parse(captured[0]);
		assert.equal(entry.type, "metric");
		assert.equal(entry.metric, "subscribe.success");
		assert.equal(entry.value, 1);
		assert.deepEqual(entry.labels, { track: "dark" });
		assert.ok(entry.timestamp, "missing timestamp");
		const date = new Date(entry.timestamp);
		assert.ok(!Number.isNaN(date.getTime()), "timestamp is not a valid date");
	});

	it("works with empty labels", () => {
		metrics.increment("subscribe.error");
		const entry = JSON.parse(captured[0]);
		assert.equal(entry.metric, "subscribe.error");
		assert.deepEqual(entry.labels, {});
	});

	it("works with multiple labels", () => {
		metrics.increment("subscribe.success", { track: "light", source: "homepage" });
		const entry = JSON.parse(captured[0]);
		assert.deepEqual(entry.labels, { track: "light", source: "homepage" });
	});

	it("metric name is included correctly", () => {
		metrics.increment("subscribe.rate_limited");
		const entry = JSON.parse(captured[0]);
		assert.equal(entry.metric, "subscribe.rate_limited");
		assert.equal(entry.severity, "INFO");
	});
});

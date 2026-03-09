import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { analytics, trackEvent } from "../../dashboard/lib/analytics.ts";

describe("analytics", () => {
	let captured: unknown[][] = [];
	const originalLog = console.log;
	const originalEnv = process.env.NODE_ENV;

	beforeEach(() => {
		captured = [];
		console.log = (...args: unknown[]) => {
			captured.push(args);
		};
		// Force development mode so track() logs to console
		process.env.NODE_ENV = "development";
	});

	afterEach(() => {
		console.log = originalLog;
		process.env.NODE_ENV = originalEnv;
	});

	it("track method exists and is a function", () => {
		assert.equal(typeof analytics.track, "function");
	});

	it("event name must be a string", () => {
		analytics.track("slider.view");
		assert.equal(captured.length, 1);
		const payload = captured[0][1] as {
			event: string;
			timestamp: string;
			properties?: Record<string, unknown>;
		};
		assert.equal(typeof payload.event, "string");
		assert.equal(payload.event, "slider.view");
	});

	it("properties is included when provided", () => {
		analytics.track("slider.choose", { track: "dark" });
		const payload = captured[0][1] as {
			event: string;
			properties: Record<string, unknown>;
		};
		assert.equal(typeof payload.properties, "object");
		assert.deepEqual(payload.properties, { track: "dark" });
	});

	it("properties is undefined when not provided", () => {
		analytics.track("slider.view");
		const payload = captured[0][1] as {
			event: string;
			properties?: Record<string, unknown>;
		};
		assert.equal(payload.properties, undefined);
	});

	it("timestamp is included and is a valid ISO date", () => {
		analytics.track("slider.drag");
		const payload = captured[0][1] as {
			event: string;
			timestamp: string;
		};
		assert.ok(payload.timestamp, "missing timestamp");
		const date = new Date(payload.timestamp);
		assert.ok(!Number.isNaN(date.getTime()), "timestamp is not a valid date");
	});

	it("dev mode logs to console with [analytics] prefix", () => {
		analytics.track("slider.hover", { side: "light" });
		assert.equal(captured.length, 1);
		assert.equal(captured[0][0], "[analytics]");
	});
});

describe("trackEvent (GA4)", () => {
	it("trackEvent is exported and is a function", () => {
		assert.equal(typeof trackEvent, "function");
	});

	it("trackEvent is a no-op when NEXT_PUBLIC_GA4_MEASUREMENT_ID is not set", () => {
		// The env var is not set in test environment, so this should not throw
		assert.doesNotThrow(() => {
			trackEvent({ event: "test_event", category: "test" });
		});
	});

	it("trackEvent accepts optional label and value", () => {
		assert.doesNotThrow(() => {
			trackEvent({
				event: "test_event",
				category: "test",
				label: "some_label",
				value: 42,
			});
		});
	});
});

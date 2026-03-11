import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const middlewarePath = path.join(process.cwd(), "dashboard", "middleware.ts");
const middlewareSrc = fs.readFileSync(middlewarePath, "utf-8");

describe("CSP headers include GA4 domains", () => {
	it("script-src includes *.googletagmanager.com", () => {
		assert.ok(
			middlewareSrc.includes("https://*.googletagmanager.com"),
			"script-src should allow googletagmanager.com",
		);
	});

	it("script-src includes *.google-analytics.com", () => {
		assert.ok(
			middlewareSrc.includes("https://*.google-analytics.com"),
			"script-src should allow google-analytics.com",
		);
	});

	it("connect-src includes *.google-analytics.com", () => {
		// Find the connect-src line specifically
		const connectLine = middlewareSrc.split("\n").find((line) => line.includes("connect-src"));
		assert.ok(connectLine, "connect-src directive should exist");
		assert.ok(
			connectLine.includes("https://*.google-analytics.com"),
			"connect-src should allow google-analytics.com",
		);
	});

	it("connect-src includes *.googletagmanager.com", () => {
		const connectLine = middlewareSrc.split("\n").find((line) => line.includes("connect-src"));
		assert.ok(connectLine, "connect-src directive should exist");
		assert.ok(
			connectLine.includes("https://*.googletagmanager.com"),
			"connect-src should allow googletagmanager.com",
		);
	});
});

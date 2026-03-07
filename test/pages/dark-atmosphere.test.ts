import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";

describe("dark atmosphere", () => {
	it("inner page route imports MatrixRain", () => {
		const route = fs.readFileSync("dashboard/app/[track]/[slug]/page.tsx", "utf-8");
		assert.ok(route.includes("MatrixRain"), "Should import MatrixRain");
	});

	it("inner page route has CRT overlay for dark track", () => {
		const route = fs.readFileSync("dashboard/app/[track]/[slug]/page.tsx", "utf-8");
		assert.ok(route.includes("crt-flicker"), "Should have CRT overlay");
	});

	it("inner page route renders MatrixRain directly (component has built-in opacity)", () => {
		const route = fs.readFileSync("dashboard/app/[track]/[slug]/page.tsx", "utf-8");
		assert.ok(route.includes("<MatrixRain"), "MatrixRain should render directly");
	});

	it("per-page CSS classes exist for all dark slugs", () => {
		const css = fs.readFileSync("dashboard/app/globals.css", "utf-8");
		const slugs = [
			"about",
			"faq",
			"how-it-works",
			"philosophy",
			"human-vs-machine",
			"use-cases",
			"whitepaper",
		];
		for (const slug of slugs) {
			assert.ok(css.includes(`.page-${slug}`), `Missing CSS for page-${slug}`);
		}
	});

	it("section-prefix CSS class exists", () => {
		const css = fs.readFileSync("dashboard/app/globals.css", "utf-8");
		assert.ok(css.includes(".section-prefix"), "Should have section-prefix styling");
	});
});

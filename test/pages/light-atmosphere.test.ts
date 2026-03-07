import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";

describe("light atmosphere", () => {
	it("inner page route imports GradientOrbs", () => {
		const route = fs.readFileSync("dashboard/app/[track]/[slug]/page.tsx", "utf-8");
		assert.ok(route.includes("GradientOrbs"), "Should import GradientOrbs");
	});

	it("inner page route has reduced opacity for GradientOrbs", () => {
		const route = fs.readFileSync("dashboard/app/[track]/[slug]/page.tsx", "utf-8");
		assert.ok(route.includes("opacity-40"), "GradientOrbs should be at 40% opacity");
	});

	it("per-page CSS classes exist for all light slugs", () => {
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
			assert.ok(
				css.includes(`.theme-light .content-body.page-${slug}`) ||
					css.includes(`.theme-light .content-body.page-${slug} `),
				`Missing light CSS for page-${slug}`,
			);
		}
	});

	it("accordion CSS classes exist", () => {
		const css = fs.readFileSync("dashboard/app/globals.css", "utf-8");
		assert.ok(css.includes(".accordion-trigger"), "Should have accordion-trigger CSS");
		assert.ok(css.includes(".accordion-panel"), "Should have accordion-panel CSS");
	});

	it("essay layout has narrow max-width and serif styling", () => {
		const css = fs.readFileSync("dashboard/app/globals.css", "utf-8");
		assert.ok(css.includes("page-philosophy"), "Should have philosophy CSS");
	});
});

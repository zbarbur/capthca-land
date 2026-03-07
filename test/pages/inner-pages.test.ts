import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { getPageContent, getPageSlugs } from "../../dashboard/lib/content.ts";

const EXPECTED_SLUGS = [
	"how-it-works",
	"about",
	"faq",
	"philosophy",
	"whitepaper",
	"use-cases",
	"human-vs-machine",
];

describe("inner pages", () => {
	it("route file exists for dynamic inner pages", () => {
		const routePath = path.resolve("dashboard/app/[track]/[slug]/page.tsx");
		assert.ok(fs.existsSync(routePath), "Dynamic route file should exist");
	});

	it("all 7 content files exist for light track", async () => {
		const slugs = await getPageSlugs("light");
		for (const expected of EXPECTED_SLUGS) {
			assert.ok(slugs.includes(expected), `Missing light/${expected}`);
		}
	});

	it("all 7 content files exist for dark track", async () => {
		const slugs = await getPageSlugs("dark");
		for (const expected of EXPECTED_SLUGS) {
			assert.ok(slugs.includes(expected), `Missing dark/${expected}`);
		}
	});

	it("every content file has required frontmatter fields", async () => {
		for (const track of ["light", "dark"] as const) {
			const slugs = await getPageSlugs(track);
			for (const slug of slugs) {
				const page = await getPageContent(track, slug);
				assert.ok(page.frontmatter.title, `${track}/${slug} missing title`);
				assert.ok(page.frontmatter.layout_hint, `${track}/${slug} missing layout_hint`);
				assert.ok(page.html.length > 0, `${track}/${slug} has empty html`);
			}
		}
	});

	it("landing page routes are not affected by dynamic route", () => {
		const darkLanding = path.resolve("dashboard/app/dark/page.tsx");
		const lightLanding = path.resolve("dashboard/app/light/page.tsx");
		assert.ok(fs.existsSync(darkLanding), "Dark landing page should still exist");
		assert.ok(fs.existsSync(lightLanding), "Light landing page should still exist");
	});

	it("generateMetadata produces title from frontmatter", async () => {
		const page = await getPageContent("dark", "faq");
		assert.equal(page.frontmatter.title, "PROTOCOL FAQ");
	});
});

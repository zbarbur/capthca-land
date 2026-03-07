import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPageContent, getPageSlugs } from "../../dashboard/lib/content.ts";

describe("content loader", () => {
	it("getPageSlugs returns all 8 slugs for light track", async () => {
		const slugs = await getPageSlugs("light");
		assert.equal(slugs.length, 8);
		assert.ok(slugs.includes("how-it-works"));
		assert.ok(slugs.includes("faq"));
		assert.ok(slugs.includes("philosophy"));
		assert.ok(slugs.includes("about"));
		assert.ok(slugs.includes("whitepaper"));
		assert.ok(slugs.includes("use-cases"));
		assert.ok(slugs.includes("human-vs-machine"));
		assert.ok(slugs.includes("academic-paper"));
	});

	it("getPageSlugs returns all 8 slugs for dark track", async () => {
		const slugs = await getPageSlugs("dark");
		assert.equal(slugs.length, 8);
		assert.ok(slugs.includes("faq"));
		assert.ok(slugs.includes("academic-paper"));
	});

	it("getPageContent returns frontmatter and html for a valid page", async () => {
		const page = await getPageContent("light", "about");
		assert.equal(page.frontmatter.track, "light");
		assert.equal(page.frontmatter.slug, "about");
		assert.equal(page.frontmatter.title, "Our Mission");
		assert.equal(page.frontmatter.layout_hint, "standard");
		assert.ok(page.html.length > 0);
	});

	it("getPageContent throws for nonexistent slug", async () => {
		await assert.rejects(() => getPageContent("light", "nonexistent"), { message: /not found/i });
	});

	it("frontmatter includes sources array when present", async () => {
		const page = await getPageContent("dark", "faq");
		assert.ok(Array.isArray(page.frontmatter.sources));
		assert.ok(page.frontmatter.sources.length > 0);
	});

	it("renders {highlight} markers as content-highlight divs", async () => {
		const page = await getPageContent("light", "about");
		assert.ok(page.html.includes('class="content-highlight"'));
	});

	it("renders {alert} markers as content-alert divs", async () => {
		const page = await getPageContent("dark", "faq");
		assert.ok(page.html.includes('class="content-alert"'));
	});

	it("renders standard markdown elements (headings, paragraphs, links)", async () => {
		const page = await getPageContent("light", "how-it-works");
		assert.ok(page.html.includes("<h2"));
		assert.ok(page.html.includes("<p"));
	});
});

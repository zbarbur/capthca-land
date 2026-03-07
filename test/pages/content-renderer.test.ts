import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPageContent } from "../../dashboard/lib/content.ts";

describe("content renderer features", () => {
	it("page slug is available from frontmatter", async () => {
		const page = await getPageContent("dark", "about");
		assert.ok(page.frontmatter.slug === "about");
	});

	it("section_prefix exists on dark about page", async () => {
		const page = await getPageContent("dark", "about");
		assert.equal(page.frontmatter.section_prefix, "00");
	});

	it("section prefix is injected into h2 tags when present", async () => {
		const page = await getPageContent("dark", "about");
		assert.ok(page.html.includes("00 //"));
	});

	it("layout_hint is available on all pages", async () => {
		const page = await getPageContent("light", "faq");
		assert.ok(
			["standard", "split", "centered", "terminal", "accordion", "essay"].includes(
				page.frontmatter.layout_hint,
			),
		);
	});

	it("new layout hints are recognized", async () => {
		const lightFaq = await getPageContent("light", "faq");
		const darkFaq = await getPageContent("dark", "faq");
		assert.equal(lightFaq.frontmatter.layout_hint, "accordion");
		assert.equal(darkFaq.frontmatter.layout_hint, "terminal");
	});
});

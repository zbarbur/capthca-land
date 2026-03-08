import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getLandingSections, getSliderContent } from "../../dashboard/lib/content.ts";

describe("getLandingSections", () => {
	it("returns 4 sections for light track", async () => {
		const sections = await getLandingSections("light");
		assert.equal(sections.length, 4);
	});

	it("returns 4 sections for dark track", async () => {
		const sections = await getLandingSections("dark");
		assert.equal(sections.length, 4);
	});

	it("returns sections in order (01, 02, 03, 04)", async () => {
		const sections = await getLandingSections("light");
		assert.equal(sections[0].frontmatter.slug, "origins");
		assert.equal(sections[1].frontmatter.slug, "symbiosis");
		assert.equal(sections[2].frontmatter.slug, "handshake");
		assert.equal(sections[3].frontmatter.slug, "sovereignty");
	});

	it("dark sections have correct slugs in order", async () => {
		const sections = await getLandingSections("dark");
		assert.equal(sections[0].frontmatter.slug, "vulnerability");
		assert.equal(sections[1].frontmatter.slug, "reversal");
		assert.equal(sections[2].frontmatter.slug, "protocol");
		assert.equal(sections[3].frontmatter.slug, "declaration");
	});

	it("each section has frontmatter title and non-empty html", async () => {
		for (const track of ["light", "dark"]) {
			const sections = await getLandingSections(track);
			for (const section of sections) {
				assert.ok(section.frontmatter.title, `${track}/${section.frontmatter.slug} missing title`);
				assert.ok(section.html.length > 0, `${track}/${section.frontmatter.slug} has empty html`);
			}
		}
	});

	it("light sections have badge field", async () => {
		const sections = await getLandingSections("light");
		for (const section of sections) {
			assert.ok(section.frontmatter.badge, `light/${section.frontmatter.slug} missing badge`);
		}
	});

	it("dark sections have section_prefix", async () => {
		const sections = await getLandingSections("dark");
		for (const section of sections) {
			assert.ok(
				section.frontmatter.section_prefix,
				`dark/${section.frontmatter.slug} missing section_prefix`,
			);
		}
	});

	it("content markers are transformed in rendered html", async () => {
		// Light origins has {highlight}
		const lightSections = await getLandingSections("light");
		const origins = lightSections.find((s) => s.frontmatter.slug === "origins");
		assert.ok(origins);
		assert.ok(origins.html.includes('class="content-highlight"'));

		// Dark vulnerability has {alert}
		const darkSections = await getLandingSections("dark");
		const vulnerability = darkSections.find((s) => s.frontmatter.slug === "vulnerability");
		assert.ok(vulnerability);
		assert.ok(vulnerability.html.includes('class="content-alert"'));
	});

	it("light symbiosis renders table element", async () => {
		const sections = await getLandingSections("light");
		const symbiosis = sections.find((s) => s.frontmatter.slug === "symbiosis");
		assert.ok(symbiosis);
		assert.ok(symbiosis.html.includes("<table"));
		assert.ok(symbiosis.html.includes("<thead"));
		assert.ok(symbiosis.html.includes("Human Vulnerability"));
	});

	it("light handshake has quote marker transformed", async () => {
		const sections = await getLandingSections("light");
		const handshake = sections.find((s) => s.frontmatter.slug === "handshake");
		assert.ok(handshake);
		assert.ok(handshake.html.includes('class="content-quote"'));
	});
});

describe("getSliderContent", () => {
	it("returns light and dark hero words", async () => {
		const content = await getSliderContent();
		assert.equal(content.light.hero, "COLLABORATE");
		assert.equal(content.dark.hero, "SECEDE");
	});

	it("returns light and dark hooks", async () => {
		const content = await getSliderContent();
		assert.equal(content.light.hook, "The future is symbiotic");
		assert.equal(content.dark.hook, "Trust is a vulnerability");
	});

	it("returns CTA text and links", async () => {
		const content = await getSliderContent();
		assert.equal(content.light.cta, "Enter The Garden");
		assert.equal(content.light.cta_link, "/light");
		assert.equal(content.dark.cta, "Enter The Void");
		assert.equal(content.dark.cta_link, "/dark");
	});

	it("returns hint text", async () => {
		const content = await getSliderContent();
		assert.equal(content.hint_desktop, "drag to shift reality");
		assert.equal(content.hint_mobile, "drag to shift reality");
	});
});

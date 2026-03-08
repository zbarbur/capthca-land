import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	getCTAContent,
	getPageContent,
	injectSectionPrefix,
	renderMarkdown,
	transformContentMarkers,
} from "../../dashboard/lib/content.ts";

describe("transformContentMarkers", () => {
	it("transforms {highlight} block markers to styled div", () => {
		const html = "<p>{highlight}</p><p>Important info</p><p>{/highlight}</p>";
		const result = transformContentMarkers(html);
		assert.ok(result.includes('class="content-highlight"'));
		assert.ok(result.includes("Important info"));
		assert.ok(!result.includes("{highlight}"));
	});

	it("transforms {alert} block markers to styled div", () => {
		const html = "<p>{alert}</p><p>Warning text</p><p>{/alert}</p>";
		const result = transformContentMarkers(html);
		assert.ok(result.includes('class="content-alert"'));
		assert.ok(result.includes("Warning text"));
	});

	it("transforms {quote} markers to blockquote with class", () => {
		const html = "<p>{quote}</p><p>A wise saying</p><p>{/quote}</p>";
		const result = transformContentMarkers(html);
		assert.ok(result.includes('<blockquote class="content-quote">'));
		assert.ok(result.includes("A wise saying"));
	});

	it("transforms {table} markers to styled div", () => {
		const html = "<p>{table}</p><table><tr><td>data</td></tr></table><p>{/table}</p>";
		const result = transformContentMarkers(html);
		assert.ok(result.includes('class="content-table"'));
		assert.ok(result.includes("<table>"));
	});

	it("transforms {diagram:xxx} in paragraph to data-diagram div", () => {
		const html = "<p>{diagram:statsDashboard}</p>";
		const result = transformContentMarkers(html);
		assert.ok(result.includes('data-diagram="statsDashboard"'));
		assert.ok(!result.includes("{diagram:"));
	});

	it("transforms inline {diagram:xxx} to data-diagram div", () => {
		const html = "before {diagram:zkHandshake} after";
		const result = transformContentMarkers(html);
		assert.ok(result.includes('data-diagram="zkHandshake"'));
		assert.ok(result.includes("before"));
		assert.ok(result.includes("after"));
	});

	it("handles inline markers within a single <p>", () => {
		const html = "<p>{highlight}\nSome inline content\n{/highlight}</p>";
		const result = transformContentMarkers(html);
		assert.ok(result.includes('class="content-highlight"'));
		assert.ok(result.includes("Some inline content"));
	});

	it("leaves unknown markers untouched", () => {
		const html = "<p>{unknown}</p><p>Content</p><p>{/unknown}</p>";
		const result = transformContentMarkers(html);
		assert.ok(result.includes("{unknown}"));
	});

	it("passes through HTML with no markers unchanged", () => {
		const html = "<p>No markers here</p><h2>Title</h2><ul><li>item</li></ul>";
		const result = transformContentMarkers(html);
		assert.equal(result, html);
	});

	it("handles multiple diagram markers in one string", () => {
		const html = "<p>{diagram:first}</p><p>text</p><p>{diagram:second}</p>";
		const result = transformContentMarkers(html);
		assert.ok(result.includes('data-diagram="first"'));
		assert.ok(result.includes('data-diagram="second"'));
	});
});

describe("renderMarkdown", () => {
	it("renders basic markdown to HTML", async () => {
		const html = await renderMarkdown("# Hello\n\nA paragraph.");
		assert.ok(html.includes("<h1>Hello</h1>"));
		assert.ok(html.includes("<p>A paragraph.</p>"));
	});

	it("renders GFM tables", async () => {
		const md = "| A | B |\n|---|---|\n| 1 | 2 |";
		const html = await renderMarkdown(md);
		assert.ok(html.includes("<table>"));
		assert.ok(html.includes("<thead>"));
		assert.ok(html.includes("<td>1</td>"));
	});

	it("processes content markers after markdown rendering", async () => {
		const md = "{highlight}\n\n**Bold inside highlight**\n\n{/highlight}";
		const html = await renderMarkdown(md);
		assert.ok(html.includes('class="content-highlight"'));
		assert.ok(html.includes("<strong>Bold inside highlight</strong>"));
	});

	it("processes diagram markers in markdown", async () => {
		const md = "Some intro text.\n\n{diagram:protocolOverview}\n\nMore text.";
		const html = await renderMarkdown(md);
		assert.ok(html.includes('data-diagram="protocolOverview"'));
	});

	it("handles empty content without crashing", async () => {
		const html = await renderMarkdown("");
		assert.equal(typeof html, "string");
	});

	it("handles content with only whitespace", async () => {
		const html = await renderMarkdown("   \n\n  ");
		assert.equal(typeof html, "string");
	});

	it("handles malformed marker syntax gracefully", async () => {
		// Unclosed marker — should not crash, marker text stays as-is
		const html = await renderMarkdown("{highlight}\n\nSome text without closing marker");
		assert.equal(typeof html, "string");
		assert.ok(html.includes("Some text"));
	});

	it("handles plain markdown without frontmatter", async () => {
		const md = "Just a plain paragraph.\n\n## A heading\n\nAnother paragraph.";
		const html = await renderMarkdown(md);
		assert.ok(html.includes("<p>Just a plain paragraph.</p>"));
		assert.ok(html.includes("<h2>A heading</h2>"));
	});

	it("handles invalid diagram syntax gracefully", async () => {
		// {diagram:} with empty name — regex requires \\w+ so it won't match
		const html = await renderMarkdown("{diagram:}\n\n{diagram: spaces}");
		assert.equal(typeof html, "string");
		// These should remain as literal text since they don't match the pattern
		assert.ok(!html.includes('data-diagram=""'));
	});
});

describe("injectSectionPrefix", () => {
	it("adds prefix to first h2 with just the prefix", () => {
		const html = "<h2>First Title</h2>";
		const result = injectSectionPrefix(html, "01");
		assert.ok(result.includes('class="section-prefix"'));
		assert.ok(result.includes("01 //"));
		assert.ok(result.includes("FIRST TITLE"));
	});

	it("adds incrementing prefix to subsequent h2 tags", () => {
		const html = "<h2>First</h2><p>text</p><h2>Second</h2><p>more</p><h2>Third</h2>";
		const result = injectSectionPrefix(html, "02");
		assert.ok(result.includes("02 //"));
		assert.ok(result.includes("02.1 //"));
		assert.ok(result.includes("02.2 //"));
	});

	it("uppercases heading text", () => {
		const html = "<h2>lowercase title</h2>";
		const result = injectSectionPrefix(html, "03");
		assert.ok(result.includes("LOWERCASE TITLE"));
	});

	it("does not modify h3 or other headings", () => {
		const html = "<h3>Sub heading</h3>";
		const result = injectSectionPrefix(html, "01");
		assert.equal(result, html);
	});
});

describe("getCTAContent", () => {
	it("returns all fields for light track CTA", async () => {
		const cta = await getCTAContent("light");
		assert.equal(cta.heading, "Join the Symbiotic Standard");
		assert.equal(cta.subheading, "Be among the first to receive the protocol.");
		assert.equal(cta.input_placeholder, "Join the garden...");
		assert.equal(cta.button_text, "Join");
		assert.ok(cta.success_title.length > 0);
		assert.ok(cta.success_message.length > 0);
	});

	it("returns null subheading for dark track CTA", async () => {
		const cta = await getCTAContent("dark");
		assert.equal(cta.heading, "Initialize your Protocol");
		assert.equal(cta.subheading, null);
		assert.equal(cta.button_text, "Init");
	});
});

describe("getPageContent with diagrams", () => {
	it("whitepaper page contains diagram placeholders", async () => {
		const page = await getPageContent("dark", "whitepaper");
		assert.ok(page.html.includes('data-diagram="statsDashboard"'));
		assert.ok(page.html.includes('data-diagram="captchaTimeline"'));
		assert.ok(page.html.includes('data-diagram="protocolOverview"'));
	});

	it("whitepaper page does not contain raw diagram marker text", async () => {
		const page = await getPageContent("dark", "whitepaper");
		assert.ok(!page.html.includes("{diagram:statsDashboard}"));
	});

	it("human-vs-machine page contains rendered tables", async () => {
		const page = await getPageContent("light", "human-vs-machine");
		assert.ok(
			page.html.includes("<table"),
			"human-vs-machine page should contain a rendered table",
		);
	});

	it("page content from each track renders without error", async () => {
		const lightPage = await getPageContent("light", "philosophy");
		assert.ok(lightPage.html.length > 0);
		assert.equal(lightPage.frontmatter.track, "light");

		const darkPage = await getPageContent("dark", "philosophy");
		assert.ok(darkPage.html.length > 0);
		assert.equal(darkPage.frontmatter.track, "dark");
	});
});

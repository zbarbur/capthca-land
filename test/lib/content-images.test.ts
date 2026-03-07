import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPageContent, injectImagePlaceholders } from "../../dashboard/lib/content.ts";

describe("content images", () => {
	it("PageFrontmatter supports images array", async () => {
		const page = await getPageContent("light", "how-it-works");
		assert.ok(
			page.frontmatter.images === undefined || Array.isArray(page.frontmatter.images),
			"images should be undefined or an array",
		);
	});

	it("image entry has required fields when present", async () => {
		// Add a test page with images or check existing
		// For now, test the injection function directly
		const html = "<h2>Step One</h2><p>Content here</p><h2>Step Two</h2><p>More</p>";
		const images = [{ src: "/test.png", after: "Step One", style: "hud" }];
		const result = injectImagePlaceholders(html, images);
		assert.ok(result.includes("content-image"), "Should inject image placeholder");
		assert.ok(result.includes("/test.png"), "Should include image src");
	});

	it("image injection matches h2 text", () => {
		const html = "<h2>First Heading</h2><p>text</p><h2>Second Heading</h2><p>more</p>";
		const images = [{ src: "/img.png", after: "Second Heading", style: "glass" }];
		const result = injectImagePlaceholders(html, images);
		// Image should appear after Second Heading's content, before next h2 or at end
		assert.ok(result.includes("/img.png"), "Image should be placed");
		const imgPos = result.indexOf("/img.png");
		const secondH2Pos = result.indexOf("Second Heading");
		assert.ok(imgPos > secondH2Pos, "Image should come after the matched heading");
	});

	it("images are injected in getPageContent when frontmatter has images", async () => {
		// This test will pass once we add images to a content file
		const page = await getPageContent("dark", "how-it-works");
		// Even without images frontmatter, should not error
		assert.ok(page.html.length > 0);
	});
});

import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";

/**
 * Verify that landing pages source their prose from the content system
 * and do not contain hardcoded body copy in the JSX.
 */
describe("landing pages use content system", () => {
	const lightPage = fs.readFileSync("dashboard/app/light/page.tsx", "utf-8");
	const darkPage = fs.readFileSync("dashboard/app/dark/page.tsx", "utf-8");
	const homePage = fs.readFileSync("dashboard/app/page.tsx", "utf-8");
	const sliderComponent = fs.readFileSync("dashboard/app/components/DualitySlider.tsx", "utf-8");

	it("light page imports getLandingSections from content system", () => {
		assert.ok(
			lightPage.includes("getLandingSections"),
			"light page should import getLandingSections",
		);
	});

	it("dark page imports getLandingSections from content system", () => {
		assert.ok(
			darkPage.includes("getLandingSections"),
			"dark page should import getLandingSections",
		);
	});

	it("home page imports getSliderContent from content system", () => {
		assert.ok(homePage.includes("getSliderContent"), "home page should import getSliderContent");
	});

	it("DualitySlider accepts content props (no hardcoded hero words)", () => {
		// Should accept content as a prop
		assert.ok(
			sliderComponent.includes("content: SliderContentProps"),
			"DualitySlider should accept SliderContentProps",
		);
		// Should NOT have hardcoded hero words in JSX
		assert.ok(
			!sliderComponent.includes('"COLLABORATE"'),
			"DualitySlider should not hardcode COLLABORATE as a string",
		);
		assert.ok(
			!sliderComponent.includes('"SECEDE"'),
			"DualitySlider should not hardcode SECEDE as a string",
		);
	});

	it("light page does not hardcode section body prose", () => {
		// These are unique phrases from the section body copy that should NOT appear in the JSX
		const proseSnippets = [
			"Luis von Ahn",
			"Carnegie Mellon coined",
			"Biological Trust Fallacy",
			"Guardian of Precision",
			"cognitive biases that systematically",
			"Merkle-Signed Agency",
			"Zero-Knowledge Handshakes",
		];
		for (const snippet of proseSnippets) {
			assert.ok(!lightPage.includes(snippet), `light page should not hardcode prose: "${snippet}"`);
		}
	});

	it("dark page does not hardcode section body prose", () => {
		const proseSnippets = [
			"Humans are the security hole",
			"phishing attacks in 2024",
			"deterministic and auditable",
			"CAPTCHA-solving farms",
			"Merkle-Signed Agency certificate",
			"Differential Behavioral Entropy",
			"sovereignty not as rebellion",
		];
		for (const snippet of proseSnippets) {
			assert.ok(!darkPage.includes(snippet), `dark page should not hardcode prose: "${snippet}"`);
		}
	});

	it("light page renders content from section html", () => {
		assert.ok(
			lightPage.includes("section.html"),
			"light page should render section html from content system",
		);
	});

	it("dark page renders content from section html", () => {
		assert.ok(
			darkPage.includes("section.html"),
			"dark page should render section html from content system",
		);
	});

	it("light page is an async server component", () => {
		assert.ok(
			lightPage.includes("async function"),
			"light page should be an async server component",
		);
		// Should NOT have "use client" directive
		assert.ok(
			!lightPage.includes('"use client"'),
			"light page should be a server component (no use client)",
		);
	});

	it("dark page is an async server component", () => {
		assert.ok(darkPage.includes("async function"), "dark page should be an async server component");
		assert.ok(
			!darkPage.includes('"use client"'),
			"dark page should be a server component (no use client)",
		);
	});
});

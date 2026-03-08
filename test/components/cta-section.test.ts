import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { getCTAContent } from "../../dashboard/lib/content.ts";

describe("CTA section", () => {
	it("CTASection component file exists", () => {
		const ctaPath = path.resolve("dashboard/app/components/CTASection.tsx");
		assert.ok(fs.existsSync(ctaPath), "CTASection.tsx should exist");
	});

	it("content/light/cta.md exists with required fields", async () => {
		const cta = await getCTAContent("light");
		assert.ok(cta.heading, "light CTA should have a heading");
		assert.ok(cta.input_placeholder, "light CTA should have input_placeholder");
		assert.ok(cta.button_text, "light CTA should have button_text");
		assert.ok(cta.success_title, "light CTA should have success_title");
		assert.ok(cta.success_message, "light CTA should have success_message");
	});

	it("content/dark/cta.md exists with required fields", async () => {
		const cta = await getCTAContent("dark");
		assert.ok(cta.heading, "dark CTA should have a heading");
		assert.ok(cta.input_placeholder, "dark CTA should have input_placeholder");
		assert.ok(cta.button_text, "dark CTA should have button_text");
		assert.ok(cta.success_title, "dark CTA should have success_title");
		assert.ok(cta.success_message, "dark CTA should have success_message");
	});

	it("light CTA content matches expected values from markdown", async () => {
		const cta = await getCTAContent("light");
		assert.equal(cta.heading, "Join the Symbiotic Standard");
		assert.equal(cta.subheading, "Be among the first to receive the protocol.");
		assert.equal(cta.input_placeholder, "Join the garden...");
		assert.equal(cta.button_text, "Join");
		assert.equal(cta.success_title, "Welcome to the Garden.");
		assert.equal(cta.success_message, "The harmony grows stronger.");
	});

	it("dark CTA content matches expected values from markdown", async () => {
		const cta = await getCTAContent("dark");
		assert.equal(cta.heading, "Initialize your Protocol");
		assert.equal(cta.subheading, null);
		assert.equal(cta.input_placeholder, "Submit your endpoint...");
		assert.equal(cta.button_text, "Init");
		assert.equal(cta.success_title, "Endpoint registered.");
		assert.equal(cta.success_message, "Your signal has been received.");
	});

	it("CTA is rendered on inner pages (CTASection imported in [track]/[slug]/page.tsx)", () => {
		const innerPagePath = path.resolve("dashboard/app/[track]/[slug]/page.tsx");
		const source = fs.readFileSync(innerPagePath, "utf-8");
		assert.ok(source.includes("CTASection"), "Inner page should import and use CTASection");
		assert.ok(
			source.includes('from "../../components/CTASection"'),
			"Inner page should import CTASection from components",
		);
	});

	it("CTA is rendered on light landing page", () => {
		const lightPath = path.resolve("dashboard/app/light/page.tsx");
		const source = fs.readFileSync(lightPath, "utf-8");
		assert.ok(source.includes("CTASection"), "Light landing page should use CTASection");
		assert.ok(
			!source.includes('from "../components/EmailCapture"'),
			"Light landing page should not directly import EmailCapture (uses CTASection instead)",
		);
	});

	it("CTA is rendered on dark landing page", () => {
		const darkPath = path.resolve("dashboard/app/dark/page.tsx");
		const source = fs.readFileSync(darkPath, "utf-8");
		assert.ok(source.includes("CTASection"), "Dark landing page should use CTASection");
		assert.ok(
			!source.includes('from "../components/EmailCapture"'),
			"Dark landing page should not directly import EmailCapture (uses CTASection instead)",
		);
	});

	it("only one Turnstile script tag exists (in root layout, not in components)", () => {
		const layoutPath = path.resolve("dashboard/app/layout.tsx");
		const layoutSource = fs.readFileSync(layoutPath, "utf-8");
		assert.ok(
			layoutSource.includes("challenges.cloudflare.com/turnstile"),
			"Root layout should include Turnstile script",
		);

		// Verify CTASection does not add its own Turnstile script
		const ctaPath = path.resolve("dashboard/app/components/CTASection.tsx");
		const ctaSource = fs.readFileSync(ctaPath, "utf-8");
		assert.ok(
			!ctaSource.includes("challenges.cloudflare.com"),
			"CTASection should not include its own Turnstile script tag",
		);

		// Verify EmailCapture does not add its own Turnstile script
		const emailPath = path.resolve("dashboard/app/components/EmailCapture.tsx");
		const emailSource = fs.readFileSync(emailPath, "utf-8");
		assert.ok(
			!emailSource.includes("challenges.cloudflare.com"),
			"EmailCapture should not include its own Turnstile script tag",
		);
	});

	it("EmailCapture accepts content props", () => {
		const emailPath = path.resolve("dashboard/app/components/EmailCapture.tsx");
		const source = fs.readFileSync(emailPath, "utf-8");
		assert.ok(
			source.includes("EmailCaptureProps"),
			"EmailCapture should export EmailCaptureProps interface",
		);
		assert.ok(source.includes("heading?:"), "EmailCapture should accept optional heading prop");
		assert.ok(
			source.includes("buttonText?:"),
			"EmailCapture should accept optional buttonText prop",
		);
		assert.ok(
			source.includes("successTitle?:"),
			"EmailCapture should accept optional successTitle prop",
		);
		assert.ok(
			source.includes("successMessage?:"),
			"EmailCapture should accept optional successMessage prop",
		);
		assert.ok(
			source.includes("inputPlaceholder?:"),
			"EmailCapture should accept optional inputPlaceholder prop",
		);
	});
});

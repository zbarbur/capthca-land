import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";

describe("mobile home layout", () => {
	const sliderSource = fs.readFileSync("dashboard/app/components/DualitySlider.tsx", "utf-8");

	it("has mobile breakpoint detection at 768px", () => {
		assert.ok(
			sliderSource.includes("window.innerWidth < 768"),
			"Should detect mobile breakpoint at 768px",
		);
	});

	it("renders dedicated mobile layout when isMobile is true", () => {
		assert.ok(sliderSource.includes("if (isMobile)"), "Should have isMobile conditional rendering");
	});

	it("mobile layout has data-testid for mobile home", () => {
		assert.ok(
			sliderSource.includes('data-testid="mobile-home"'),
			"Mobile layout should have mobile-home testid",
		);
	});

	it("both track CTAs render on mobile", () => {
		assert.ok(
			sliderSource.includes('data-testid="mobile-light-cta"'),
			"Should have light CTA on mobile",
		);
		assert.ok(
			sliderSource.includes('data-testid="mobile-dark-cta"'),
			"Should have dark CTA on mobile",
		);
	});

	it("mobile CTAs link to tracks via content props", () => {
		assert.ok(
			sliderSource.includes("content.light.cta_link"),
			"Light CTA should use content prop for link",
		);
		assert.ok(
			sliderSource.includes("content.dark.cta_link"),
			"Dark CTA should use content prop for link",
		);
	});

	it("mobile layout renders hero text from content props", () => {
		assert.ok(
			sliderSource.includes("content.light.hero"),
			"Should render light hero word from content",
		);
		assert.ok(
			sliderSource.includes("content.dark.hero"),
			"Should render dark hero word from content",
		);
	});

	it("mobile CTA buttons have min-h-[44px] touch target", () => {
		// Both CTA buttons in mobile layout should have minimum 44px height
		assert.ok(
			sliderSource.includes("min-h-[44px]"),
			"CTA buttons should have 44px minimum touch target",
		);
	});

	it("mobile layout uses dvh units for viewport height", () => {
		assert.ok(sliderSource.includes("50dvh"), "Should use dvh units for mobile viewport height");
	});

	it("mobile layout reduces LightMotes particle count", () => {
		assert.ok(
			sliderSource.includes("isMobile ? 8 : 16"),
			"Should reduce mote count on mobile for performance",
		);
	});
});

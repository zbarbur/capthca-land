import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";

describe("mobile responsive — diagrams", () => {
	const diagramFiles = [
		"AgentGovernanceChart",
		"BeforeAfterComparison",
		"BreachDonutChart",
		"CaptchaTimeline",
		"ConfidentialComputingChart",
		"CredentialLifecycle",
		"PhishingBarChart",
		"ProofSystemComparison",
		"ProtocolOverview",
		"RoadmapTimeline",
		"SparseMerkleTree",
		"StatsDashboard",
		"ZKHandshake",
	];

	it("all 13 diagram components exist", () => {
		for (const name of diagramFiles) {
			const filePath = `dashboard/components/diagrams/${name}.tsx`;
			assert.ok(fs.existsSync(filePath), `Diagram file should exist: ${filePath}`);
		}
	});

	it("Recharts diagrams use ResponsiveContainer (no fixed widths)", () => {
		const rechartsFiles = [
			"AgentGovernanceChart",
			"BreachDonutChart",
			"ConfidentialComputingChart",
			"PhishingBarChart",
		];
		for (const name of rechartsFiles) {
			const src = fs.readFileSync(`dashboard/components/diagrams/${name}.tsx`, "utf-8");
			assert.ok(
				src.includes("ResponsiveContainer"),
				`${name} should use ResponsiveContainer for responsive charts`,
			);
			assert.ok(
				src.includes('width="100%"'),
				`${name} ResponsiveContainer should have width="100%"`,
			);
		}
	});

	it("diagram components use DiagramWrapper for overflow handling", () => {
		const diagrams = [
			"SparseMerkleTree",
			"ProofSystemComparison",
			"ZKHandshake",
			"CredentialLifecycle",
			"CaptchaTimeline",
		];
		for (const name of diagrams) {
			const src = fs.readFileSync(`dashboard/components/diagrams/${name}.tsx`, "utf-8");
			assert.ok(
				src.includes("DiagramWrapper"),
				`${name} should use DiagramWrapper for overflow handling`,
			);
		}
		// DiagramWrapper itself provides overflow-x-auto
		const wrapper = fs.readFileSync("dashboard/components/diagrams/DiagramWrapper.tsx", "utf-8");
		assert.ok(
			wrapper.includes("overflow-x-auto"),
			"DiagramWrapper should provide overflow-x-auto",
		);
	});

	it("BeforeAfterComparison uses flexWrap for mobile stacking", () => {
		const src = fs.readFileSync("dashboard/components/diagrams/BeforeAfterComparison.tsx", "utf-8");
		assert.ok(
			src.includes("flexWrap"),
			"BeforeAfterComparison should use flexWrap for responsive stacking",
		);
		// Should not have a large minWidth that prevents wrapping on 375px
		assert.ok(
			!src.includes("minWidth: 280"),
			"BeforeAfterComparison columns should not have minWidth >= 280px (too wide for 375px)",
		);
	});

	it("RoadmapTimeline has responsive layout (vertical mobile, horizontal desktop)", () => {
		const src = fs.readFileSync("dashboard/components/diagrams/RoadmapTimeline.tsx", "utf-8");
		assert.ok(
			src.includes("data-roadmap-container"),
			"Should have responsive container data attributes",
		);
		assert.ok(
			src.includes("@media (min-width: 768px)"),
			"Should have desktop media query for horizontal layout",
		);
	});

	it("StatsDashboard uses responsive grid (2-col mobile, 4-col desktop)", () => {
		const src = fs.readFileSync("dashboard/components/diagrams/StatsDashboard.tsx", "utf-8");
		assert.ok(src.includes("repeat(2, 1fr)"), "Should have 2-column grid for mobile");
		assert.ok(src.includes("repeat(4, 1fr)"), "Should have 4-column grid for desktop");
	});

	it("DiagramRenderer wraps diagrams with responsive class", () => {
		const src = fs.readFileSync("dashboard/components/DiagramRenderer.tsx", "utf-8");
		assert.ok(
			src.includes("diagram-responsive"),
			"Diagram wrapper should have diagram-responsive class",
		);
	});
});

describe("mobile responsive — navigation", () => {
	const navSource = fs.readFileSync("dashboard/app/components/TrackLayout.tsx", "utf-8");

	it("TrackLayout has mobile hamburger menu", () => {
		assert.ok(navSource.includes("mobileMenuOpen"), "Should have mobileMenuOpen state");
	});

	it("mobile menu toggle has 44px minimum touch target", () => {
		assert.ok(
			navSource.includes("min-h-[44px]") && navSource.includes("min-w-[44px]"),
			"Mobile menu button should have 44px minimum dimensions",
		);
	});

	it("mobile nav links have 44px touch targets", () => {
		// Mobile dropdown links should have min-h-[44px]
		const mobileLinks = navSource.includes("py-3") && navSource.includes("min-h-[44px]");
		assert.ok(mobileLinks, "Mobile nav links should have adequate touch targets");
	});

	it("desktop nav hidden on mobile, mobile menu hidden on desktop", () => {
		assert.ok(navSource.includes("hidden md:flex"), "Desktop nav should be hidden on mobile");
		assert.ok(navSource.includes("md:hidden"), "Mobile menu button should be hidden on desktop");
	});

	it("back link has min-h-[44px] touch target", () => {
		assert.ok(
			navSource.includes("min-h-[44px] flex items-center"),
			"Back link should have 44px minimum height",
		);
	});
});

describe("mobile responsive — content and landing pages", () => {
	it("ContentRenderer has responsive padding (px-4 mobile, px-10 desktop)", () => {
		const src = fs.readFileSync("dashboard/components/ContentRenderer.tsx", "utf-8");
		assert.ok(src.includes("px-4 md:px-10"), "ContentRenderer should have mobile-first padding");
	});

	it("ContentRenderer has responsive title size (text-3xl mobile, text-5xl desktop)", () => {
		const src = fs.readFileSync("dashboard/components/ContentRenderer.tsx", "utf-8");
		assert.ok(
			src.includes("text-3xl") && src.includes("md:text-5xl"),
			"Title should scale down on mobile",
		);
	});

	it("dark landing page has responsive padding", () => {
		const src = fs.readFileSync("dashboard/app/dark/page.tsx", "utf-8");
		assert.ok(src.includes("px-4 md:px-10"), "Dark landing should have mobile-first padding");
	});

	it("light landing page has responsive padding", () => {
		const src = fs.readFileSync("dashboard/app/light/page.tsx", "utf-8");
		assert.ok(src.includes("px-4 md:px-[60px]"), "Light landing should have mobile-first padding");
	});

	it("globals.css has mobile responsive styles", () => {
		const css = fs.readFileSync("dashboard/app/globals.css", "utf-8");
		assert.ok(css.includes("@media (max-width: 767px)"), "Should have mobile breakpoint styles");
		assert.ok(css.includes("diagram-responsive"), "Should have diagram-responsive class");
	});

	it("DNAHelix is hidden on mobile", () => {
		const src = fs.readFileSync("dashboard/app/components/DNAHelix.tsx", "utf-8");
		assert.ok(
			src.includes("hidden md:block"),
			"DNAHelix canvas should be hidden on mobile for performance",
		);
	});

	it("MatrixRain reduces density on mobile", () => {
		const src = fs.readFileSync("dashboard/app/components/MatrixRain.tsx", "utf-8");
		assert.ok(src.includes("isMobile ? 30 : 60"), "MatrixRain should target 30fps on mobile");
		assert.ok(src.includes("fontSize * 2.5"), "MatrixRain should increase column gap on mobile");
	});
});

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const DIAGRAMS_DIR = path.resolve("dashboard/components/diagrams");
const GLOBALS_CSS = path.resolve("dashboard/app/globals.css");

const DIAGRAM_FILES = [
	"AgentGovernanceChart.tsx",
	"BeforeAfterComparison.tsx",
	"BreachDonutChart.tsx",
	"CaptchaTimeline.tsx",
	"ConfidentialComputingChart.tsx",
	"CredentialLifecycle.tsx",
	"PhishingBarChart.tsx",
	"ProofSystemComparison.tsx",
	"ProtocolOverview.tsx",
	"RoadmapTimeline.tsx",
	"SparseMerkleTree.tsx",
	"StatsDashboard.tsx",
	"ZKHandshake.tsx",
];

const RECHARTS_DIAGRAMS = [
	"AgentGovernanceChart.tsx",
	"BreachDonutChart.tsx",
	"ConfidentialComputingChart.tsx",
	"PhishingBarChart.tsx",
];

describe("Diagram polish", () => {
	it("DiagramWrapper component exists", () => {
		const wrapperPath = path.join(DIAGRAMS_DIR, "DiagramWrapper.tsx");
		assert.ok(fs.existsSync(wrapperPath), "DiagramWrapper.tsx should exist");
	});

	it("DiagramWrapper has overflow-x-auto class", () => {
		const source = fs.readFileSync(path.join(DIAGRAMS_DIR, "DiagramWrapper.tsx"), "utf-8");
		assert.ok(source.includes("overflow-x-auto"), "DiagramWrapper should use overflow-x-auto");
	});

	it("DiagramWrapper has padding classes (p-4 md:p-6)", () => {
		const source = fs.readFileSync(path.join(DIAGRAMS_DIR, "DiagramWrapper.tsx"), "utf-8");
		assert.ok(source.includes("p-4"), "DiagramWrapper should have p-4 padding");
		assert.ok(source.includes("md:p-6"), "DiagramWrapper should have md:p-6 padding");
	});

	it("DiagramWrapper uses IntersectionObserver for scroll animation", () => {
		const source = fs.readFileSync(path.join(DIAGRAMS_DIR, "DiagramWrapper.tsx"), "utf-8");
		assert.ok(
			source.includes("IntersectionObserver"),
			"DiagramWrapper should use IntersectionObserver",
		);
		assert.ok(source.includes("useEffect"), "DiagramWrapper should use useEffect");
		assert.ok(source.includes("useRef"), "DiagramWrapper should use useRef");
	});

	it("All 13 diagram components import DiagramWrapper", () => {
		for (const file of DIAGRAM_FILES) {
			const source = fs.readFileSync(path.join(DIAGRAMS_DIR, file), "utf-8");
			assert.ok(source.includes('from "./DiagramWrapper"'), `${file} should import DiagramWrapper`);
			assert.ok(source.includes("<DiagramWrapper"), `${file} should use <DiagramWrapper>`);
		}
	});

	it("Recharts diagrams use ResponsiveContainer with width 100%", () => {
		for (const file of RECHARTS_DIAGRAMS) {
			const source = fs.readFileSync(path.join(DIAGRAMS_DIR, file), "utf-8");
			assert.ok(source.includes("ResponsiveContainer"), `${file} should use ResponsiveContainer`);
			assert.ok(
				source.includes('width="100%"'),
				`${file} should use width="100%" on ResponsiveContainer`,
			);
		}
	});

	it("No fixed pixel widths on Recharts ResponsiveContainer", () => {
		for (const file of RECHARTS_DIAGRAMS) {
			const source = fs.readFileSync(path.join(DIAGRAMS_DIR, file), "utf-8");
			// Extract ResponsiveContainer props — ensure no fixed pixel width
			const match = source.match(/ResponsiveContainer\s+width=\{(\d+)\}/);
			assert.equal(match, null, `${file} should not use fixed pixel width on ResponsiveContainer`);
		}
	});

	it("globals.css contains .diagram-wrapper with reduced-motion support", () => {
		const css = fs.readFileSync(GLOBALS_CSS, "utf-8");
		assert.ok(
			css.includes(".diagram-wrapper"),
			"globals.css should define .diagram-wrapper styles",
		);
		assert.ok(
			css.includes("prefers-reduced-motion"),
			"globals.css should respect prefers-reduced-motion",
		);
	});

	it("No font sizes below 12px (fontSize: 10 or 11) in diagram components", () => {
		for (const file of DIAGRAM_FILES) {
			const source = fs.readFileSync(path.join(DIAGRAMS_DIR, file), "utf-8");
			const hasTiny = /fontSize:\s*(10|11)[,\s}]/.test(source);
			assert.ok(!hasTiny, `${file} should not have font sizes below 12px`);
		}
	});
});

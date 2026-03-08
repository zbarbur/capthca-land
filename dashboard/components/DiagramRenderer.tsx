"use client";

import dynamic from "next/dynamic";
import type { JSX } from "react";

const diagramComponents: Record<string, React.ComponentType<{ track: "light" | "dark" }>> = {
	statsDashboard: dynamic(() => import("./diagrams/StatsDashboard").then((m) => m.StatsDashboard)),
	captchaTimeline: dynamic(() =>
		import("./diagrams/CaptchaTimeline").then((m) => m.CaptchaTimeline),
	),
	protocolOverview: dynamic(() =>
		import("./diagrams/ProtocolOverview").then((m) => m.ProtocolOverview),
	),
	zkHandshake: dynamic(() => import("./diagrams/ZKHandshake").then((m) => m.ZKHandshake)),
	beforeAfterComparison: dynamic(() =>
		import("./diagrams/BeforeAfterComparison").then((m) => m.BeforeAfterComparison),
	),
	breachDonutChart: dynamic(() =>
		import("./diagrams/BreachDonutChart").then((m) => m.BreachDonutChart),
	),
	phishingBarChart: dynamic(() =>
		import("./diagrams/PhishingBarChart").then((m) => m.PhishingBarChart),
	),
	sparseMerkleTree: dynamic(() =>
		import("./diagrams/SparseMerkleTree").then((m) => m.SparseMerkleTree),
	),
	proofSystemComparison: dynamic(() =>
		import("./diagrams/ProofSystemComparison").then((m) => m.ProofSystemComparison),
	),
	confidentialComputingChart: dynamic(() =>
		import("./diagrams/ConfidentialComputingChart").then((m) => m.ConfidentialComputingChart),
	),
	agentGovernanceChart: dynamic(() =>
		import("./diagrams/AgentGovernanceChart").then((m) => m.AgentGovernanceChart),
	),
	credentialLifecycle: dynamic(() =>
		import("./diagrams/CredentialLifecycle").then((m) => m.CredentialLifecycle),
	),
	roadmapTimeline: dynamic(() =>
		import("./diagrams/RoadmapTimeline").then((m) => m.RoadmapTimeline),
	),
};

interface DiagramRendererProps {
	html: string;
	track: "light" | "dark";
	className?: string;
}

/**
 * Splits HTML at `<div data-diagram="xxx"></div>` markers and renders
 * React diagram components inline between HTML chunks.
 */
export function DiagramRenderer({ html, track, className }: DiagramRendererProps) {
	const MARKER_RE = /<div data-diagram="(\w+)"><\/div>/g;
	const segments: JSX.Element[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	let key = 0;

	match = MARKER_RE.exec(html);
	while (match !== null) {
		if (match.index > lastIndex) {
			segments.push(
				<div
					key={`html-${key++}`}
					// biome-ignore lint/security/noDangerouslySetInnerHtml: pre-sanitized by rehype-sanitize
					dangerouslySetInnerHTML={{ __html: html.slice(lastIndex, match.index) }}
				/>,
			);
		}

		const diagramName = match[1];
		const Component = diagramComponents[diagramName];
		if (Component) {
			segments.push(
				<div key={`diagram-${key++}`} className="my-12 diagram-responsive">
					<Component track={track} />
				</div>,
			);
		}

		lastIndex = match.index + match[0].length;
		match = MARKER_RE.exec(html);
	}

	if (lastIndex < html.length) {
		segments.push(
			<div
				key={`html-${key++}`}
				// biome-ignore lint/security/noDangerouslySetInnerHtml: pre-sanitized by rehype-sanitize
				dangerouslySetInnerHTML={{ __html: html.slice(lastIndex) }}
			/>,
		);
	}

	return <div className={className}>{segments}</div>;
}

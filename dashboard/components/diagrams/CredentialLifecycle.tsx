"use client";

import { DiagramWrapper } from "./DiagramWrapper";
import { getTheme } from "./theme";

interface FlowNode {
	id: string;
	label: string;
	type: "entity" | "process" | "decision" | "outcome";
	highlight?: "issuer" | "revocation";
}

interface FlowEdge {
	label: string;
	style?: "solid" | "dotted";
}

const NODES: FlowNode[] = [
	{ id: "issuer", label: "Issuer", type: "entity", highlight: "issuer" },
	{ id: "credential", label: "Credential (Merkle Tree)", type: "process" },
	{ id: "agent", label: "Agent", type: "entity" },
	{ id: "disclosure", label: "Selective Disclosure", type: "process" },
	{ id: "proof", label: "ZK Proof", type: "process" },
	{ id: "verifier", label: "Verifier", type: "entity" },
	{ id: "decision", label: "Valid?", type: "decision" },
];

const EDGES: FlowEdge[] = [
	{ label: "Creates credential" },
	{ label: "Issues to" },
	{ label: "Selects attributes" },
	{ label: "Generates" },
	{ label: "Sends to" },
	{ label: "Checks proof" },
];

const OUTCOMES = [
	{ label: "Authorized", positive: true },
	{ label: "Denied", positive: false },
];

export function CredentialLifecycle({ track }: { track: "light" | "dark" }) {
	const theme = getTheme(track);

	const isLight = track === "light";

	const cardRadius = isLight ? 10 : 1;

	const nodeStyle = (node: FlowNode): React.CSSProperties => {
		const isIssuer = node.highlight === "issuer";
		const base: React.CSSProperties = {
			padding: "14px 24px",
			background: theme.cardBg,
			border: `1.5px solid ${theme.border}`,
			borderRadius: node.type === "decision" ? 0 : cardRadius,
			color: theme.text,
			fontWeight: node.type === "entity" ? 700 : 500,
			fontSize: node.type === "entity" ? 15 : 13,
			textAlign: "center",
			position: "relative",
			minWidth: 180,
			maxWidth: 260,
		};
		if (isIssuer) {
			base.borderColor = isLight ? theme.secondary : theme.secondary;
			base.background = isLight ? "rgba(255, 215, 0, 0.08)" : "rgba(255, 0, 60, 0.08)";
		}
		if (node.type === "decision") {
			base.transform = "rotate(45deg)";
			base.width = 80;
			base.height = 80;
			base.padding = "0";
			base.display = "flex";
			base.alignItems = "center";
			base.justifyContent = "center";
			base.borderColor = theme.accent;
		}
		return base;
	};

	const arrowColor = theme.accent;
	const revokeColor = isLight ? theme.muted : theme.secondary;

	const edgeLabelStyle: React.CSSProperties = {
		fontSize: 12,
		color: theme.muted,
		textAlign: "center",
		lineHeight: 1.3,
	};

	const downArrow = (color: string, dashed = false) => (
		<svg width="24" height="28" viewBox="0 0 24 28" style={{ display: "block", margin: "0 auto" }}>
			<line
				x1={12}
				y1={0}
				x2={12}
				y2={22}
				stroke={color}
				strokeWidth={2}
				strokeDasharray={dashed ? "4 3" : "none"}
			/>
			<polygon points="6,20 12,28 18,20" fill={color} />
		</svg>
	);

	return (
		<DiagramWrapper>
			<div
				style={{
					width: "100%",
					display: "flex",
					justifyContent: "center",
					overflowX: "auto",
					WebkitOverflowScrolling: "touch",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 0,
						position: "relative",
					}}
				>
					{/* Main vertical flow */}
					{NODES.map((node, i) => (
						<div
							key={node.id}
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
							}}
						>
							{/* Node */}
							{node.type === "decision" ? (
								<div
									style={{
										position: "relative",
										width: 90,
										height: 90,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<div style={nodeStyle(node)}>
										<span
											style={{
												transform: "rotate(-45deg)",
												display: "block",
												fontSize: 14,
												fontWeight: 700,
											}}
										>
											{node.label}
										</span>
									</div>
								</div>
							) : (
								<div style={{ position: "relative" }}>
									<div style={nodeStyle(node)}>{node.label}</div>
									{/* Side branch from Issuer */}
									{node.id === "issuer" && (
										<div
											style={{
												position: "absolute",
												top: "50%",
												right: -160,
												transform: "translateY(-50%)",
												display: "flex",
												alignItems: "center",
												gap: 8,
											}}
										>
											{/* Dotted horizontal line */}
											<svg width="40" height="2" style={{ display: "block" }}>
												<line
													x1={0}
													y1={1}
													x2={40}
													y2={1}
													stroke={revokeColor}
													strokeWidth={1.5}
													strokeDasharray="4 3"
												/>
											</svg>
											<div
												style={{
													fontSize: 12,
													color: revokeColor,
													whiteSpace: "nowrap",
												}}
											>
												Can revoke
											</div>
											<svg width="20" height="2" style={{ display: "block" }}>
												<line
													x1={0}
													y1={1}
													x2={20}
													y2={1}
													stroke={revokeColor}
													strokeWidth={1.5}
													strokeDasharray="4 3"
												/>
											</svg>
										</div>
									)}
								</div>
							)}

							{/* Edge arrow + label to next node */}
							{i < NODES.length - 1 && (
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										padding: "4px 0",
									}}
								>
									{downArrow(arrowColor)}
									{EDGES[i] && <div style={edgeLabelStyle}>{EDGES[i].label}</div>}
								</div>
							)}
						</div>
					))}

					{/* Decision outcomes */}
					<div
						style={{
							display: "flex",
							gap: 32,
							marginTop: 4,
							justifyContent: "center",
							width: "100%",
						}}
					>
						{OUTCOMES.map((outcome) => (
							<div
								key={outcome.label}
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									gap: 4,
								}}
							>
								{downArrow(
									outcome.positive
										? (theme.success ?? theme.accent)
										: (theme.danger ?? theme.secondary),
								)}
								<div
									style={{
										fontSize: 12,
										color: theme.muted,
										marginBottom: 4,
									}}
								>
									{outcome.positive ? "Yes" : "No"}
								</div>
								<div
									style={{
										padding: "10px 20px",
										background: outcome.positive
											? isLight
												? "rgba(76, 175, 80, 0.1)"
												: "rgba(57, 255, 20, 0.1)"
											: isLight
												? "rgba(244, 67, 54, 0.1)"
												: "rgba(255, 0, 60, 0.1)",
										border: `1.5px solid ${
											outcome.positive
												? (theme.success ?? theme.accent)
												: (theme.danger ?? theme.secondary)
										}`,
										borderRadius: cardRadius,
										fontWeight: 700,
										fontSize: 14,
										color: outcome.positive
											? (theme.success ?? theme.accent)
											: (theme.danger ?? theme.secondary),
										textAlign: "center",
									}}
								>
									{outcome.label}
								</div>
							</div>
						))}
					</div>

					{/* Revocation Registry — positioned to the right */}
					<div
						style={{
							position: "absolute",
							top: 0,
							right: -180,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 4,
						}}
					>
						<div style={{ height: 18 }} />
						<div
							style={{
								padding: "10px 14px",
								background: isLight ? "rgba(176, 190, 197, 0.12)" : "rgba(255, 0, 60, 0.06)",
								border: `1.5px dashed ${revokeColor}`,
								borderRadius: cardRadius,
								fontSize: 12,
								color: revokeColor,
								fontWeight: 600,
								textAlign: "center",
								lineHeight: 1.3,
							}}
						>
							Revocation
							<br />
							Registry
						</div>
						{/* Dotted line down to Verifier level — approximate */}
						<svg width="2" height="80" style={{ display: "block" }}>
							<line
								x1={1}
								y1={0}
								x2={1}
								y2={80}
								stroke={revokeColor}
								strokeWidth={1.5}
								strokeDasharray="4 3"
							/>
						</svg>
						<div
							style={{
								fontSize: 12,
								color: revokeColor,
								fontStyle: "italic",
							}}
						>
							notifies Verifier
						</div>
					</div>
				</div>
			</div>
		</DiagramWrapper>
	);
}

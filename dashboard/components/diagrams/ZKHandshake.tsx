"use client";

import { DiagramWrapper } from "./DiagramWrapper";
import { getTheme } from "./theme";

interface Step {
	from: "agent" | "verifier";
	to: "agent" | "verifier";
	label: string;
	type: "message" | "note";
	side?: "agent" | "verifier";
}

const STEPS: Step[] = [
	{
		from: "agent",
		to: "verifier",
		label: "I want to prove capability X",
		type: "message",
	},
	{
		from: "agent",
		to: "agent",
		label: "Generates ZK proof from credential Merkle tree",
		type: "note",
		side: "agent",
	},
	{
		from: "agent",
		to: "verifier",
		label: "ZK Proof (88 bytes)",
		type: "message",
	},
	{
		from: "verifier",
		to: "verifier",
		label: "Verifies proof (3ms, stateless)",
		type: "note",
		side: "verifier",
	},
	{
		from: "verifier",
		to: "agent",
		label: "Authorized",
		type: "message",
	},
];

const LEARNS: { text: string; revealed: boolean }[] = [
	{ text: "Agent has capability X", revealed: true },
	{ text: "Agent identity", revealed: false },
	{ text: "Other capabilities", revealed: false },
	{ text: "Issuer identity", revealed: false },
	{ text: "Agent logic/intent", revealed: false },
];

export function ZKHandshake({ track }: { track: "light" | "dark" }) {
	const theme = getTheme(track);

	const agentColor = track === "light" ? theme.accent : theme.accent;
	const verifierColor = track === "light" ? theme.secondary : theme.secondary;

	const headerStyle = (color: string): React.CSSProperties => ({
		padding: "10px 16px",
		fontWeight: 700,
		fontSize: 14,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		color: theme.bg,
		background: color,
		textAlign: "center",
		borderRadius: track === "light" ? "8px 8px 0 0" : "1px 1px 0 0",
	});

	const colStyle: React.CSSProperties = {
		flex: 1,
		minWidth: 0,
	};

	const rowHeight = 52;

	return (
		<DiagramWrapper>
			<div style={{ width: "100%" }}>
				{/* Sequence diagram */}
				<div
					style={{
						display: "flex",
						gap: 0,
						width: "100%",
						minWidth: 380,
					}}
				>
					{/* Agent column */}
					<div style={colStyle}>
						<div style={headerStyle(agentColor)}>Agent</div>
						<div
							style={{
								borderLeft: `1px solid ${theme.border}`,
								borderRight: `1px solid ${theme.border}`,
								borderBottom: `1px solid ${theme.border}`,
								background: theme.cardBg,
								borderRadius: track === "light" ? "0 0 8px 8px" : "0 0 1px 1px",
							}}
						>
							{STEPS.map((step, i) => (
								<div
									key={i}
									style={{
										height: rowHeight,
										display: "flex",
										alignItems: "center",
										justifyContent:
											step.type === "note" && step.side === "agent" ? "center" : "flex-end",
										padding: "0 12px",
										borderBottom: i < STEPS.length - 1 ? `1px solid ${theme.border}` : "none",
									}}
								>
									{step.type === "note" && step.side === "agent" && (
										<div
											style={{
												fontSize: 12,
												color: theme.muted,
												fontStyle: "italic",
												textAlign: "center",
												lineHeight: 1.3,
											}}
										>
											{step.label}
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Center timeline with arrows */}
					<div
						style={{
							width: 120,
							flexShrink: 0,
							display: "flex",
							flexDirection: "column",
						}}
					>
						<div
							style={{
								height: 37,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<div
								style={{
									width: 2,
									height: "100%",
									background: "transparent",
								}}
							/>
						</div>
						<div style={{ flex: 1, position: "relative" }}>
							{STEPS.map((step, i) => {
								const top = i * rowHeight + rowHeight / 2;
								if (step.type === "note") {
									return (
										<div
											key={i}
											style={{
												position: "absolute",
												top: top - 1,
												left: 0,
												right: 0,
												height: 2,
												borderTop: `1px dashed ${theme.muted}`,
											}}
										/>
									);
								}
								const goesRight = step.from === "agent" && step.to === "verifier";
								return (
									<div
										key={i}
										style={{
											position: "absolute",
											top: top - 12,
											left: 0,
											right: 0,
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
										}}
									>
										<div
											style={{
												fontSize: 12,
												color: theme.text,
												marginBottom: 2,
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis",
												maxWidth: "100%",
												textAlign: "center",
											}}
										>
											{step.label}
										</div>
										<svg width="100%" height="12" viewBox="0 0 120 12" style={{ display: "block" }}>
											<line
												x1={goesRight ? 4 : 116}
												y1={6}
												x2={goesRight ? 116 : 4}
												y2={6}
												stroke={theme.accent}
												strokeWidth={2}
											/>
											{goesRight ? (
												<polygon points="110,2 118,6 110,10" fill={theme.accent} />
											) : (
												<polygon points="10,2 2,6 10,10" fill={theme.accent} />
											)}
										</svg>
									</div>
								);
							})}
						</div>
					</div>

					{/* Verifier column */}
					<div style={colStyle}>
						<div style={headerStyle(verifierColor)}>Verifier</div>
						<div
							style={{
								borderLeft: `1px solid ${theme.border}`,
								borderRight: `1px solid ${theme.border}`,
								borderBottom: `1px solid ${theme.border}`,
								background: theme.cardBg,
								borderRadius: track === "light" ? "0 0 8px 8px" : "0 0 1px 1px",
							}}
						>
							{STEPS.map((step, i) => (
								<div
									key={i}
									style={{
										height: rowHeight,
										display: "flex",
										alignItems: "center",
										justifyContent:
											step.type === "note" && step.side === "verifier" ? "center" : "flex-start",
										padding: "0 12px",
										borderBottom: i < STEPS.length - 1 ? `1px solid ${theme.border}` : "none",
									}}
								>
									{step.type === "note" && step.side === "verifier" && (
										<div
											style={{
												fontSize: 12,
												color: theme.muted,
												fontStyle: "italic",
												textAlign: "center",
												lineHeight: 1.3,
											}}
										>
											{step.label}
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>

				{/* What Verifier Learns box */}
				<div
					style={{
						marginTop: 24,
						padding: "20px 24px",
						background: track === "light" ? "rgba(2, 136, 209, 0.07)" : "rgba(57, 255, 20, 0.05)",
						border: `2px solid ${theme.accent}`,
						borderRadius: track === "light" ? 12 : 2,
						width: "100%",
					}}
				>
					<div
						style={{
							fontWeight: 700,
							fontSize: 15,
							color: theme.text,
							marginBottom: 12,
							textTransform: "uppercase",
							letterSpacing: "0.04em",
						}}
					>
						What Verifier Learns
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 6,
						}}
					>
						{LEARNS.map((item) => (
							<div
								key={item.text}
								style={{
									display: "flex",
									alignItems: "center",
									gap: 8,
									fontSize: 14,
									color: item.revealed ? theme.accent : theme.muted,
									fontWeight: item.revealed ? 700 : 400,
									textDecoration: !item.revealed && track === "dark" ? "line-through" : "none",
								}}
							>
								<span
									style={{
										fontSize: 16,
										width: 20,
										textAlign: "center",
										flexShrink: 0,
									}}
								>
									{item.revealed ? "\u2713" : "\u2717"}
								</span>
								{item.text}
							</div>
						))}
					</div>
				</div>
			</div>
		</DiagramWrapper>
	);
}

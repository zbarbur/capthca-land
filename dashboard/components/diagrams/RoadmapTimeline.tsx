"use client";

import { DiagramWrapper } from "./DiagramWrapper";
import { getTheme } from "./theme";

const PHASES = [
	{
		phase: 1,
		title: "Protocol Specification",
		status: "complete",
		date: "Q1 2026",
	},
	{
		phase: 2,
		title: "Reference Implementation",
		status: "in-progress",
		date: "Q2 2026",
	},
	{ phase: 3, title: "Testnet", status: "upcoming", date: "Q3 2026" },
	{ phase: 4, title: "Mainnet", status: "planned", date: "Q1 2027" },
	{ phase: 5, title: "Ecosystem", status: "planned", date: "Q3 2027" },
] as const;

type Status = (typeof PHASES)[number]["status"];

export function RoadmapTimeline({ track }: { track: "light" | "dark" }) {
	const theme = getTheme(track);
	const isLight = track === "light";

	function getCircleStyle(status: Status): React.CSSProperties {
		const base: React.CSSProperties = {
			width: 40,
			height: 40,
			borderRadius: "50%",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontSize: 16,
			fontWeight: 700,
			flexShrink: 0,
			position: "relative",
			zIndex: 1,
		};

		switch (status) {
			case "complete":
				return {
					...base,
					backgroundColor: isLight ? theme.secondary : theme.accent,
					color: isLight ? "#263238" : "#050505",
				};
			case "in-progress":
				return {
					...base,
					backgroundColor: isLight ? theme.accent : theme.secondary,
					color: "#ffffff",
					animation: "roadmap-pulse 2s ease-in-out infinite",
				};
			case "upcoming":
			case "planned":
				return {
					...base,
					backgroundColor: "transparent",
					border: `2px solid ${theme.muted}`,
					color: theme.muted,
				};
		}
	}

	function getLineColor(index: number): string {
		const currentStatus = PHASES[index].status;
		if (currentStatus === "complete") {
			return isLight ? theme.secondary : theme.accent;
		}
		return theme.muted;
	}

	const pulseColor = isLight ? theme.accent : theme.secondary;

	return (
		<DiagramWrapper>
			<div style={{ width: "100%" }}>
				<style>{`
				@keyframes roadmap-pulse {
					0%, 100% { box-shadow: 0 0 0 0 ${pulseColor}60; }
					50% { box-shadow: 0 0 0 8px ${pulseColor}00; }
				}
				@media (min-width: 768px) {
					[data-roadmap-container] {
						flex-direction: row !important;
						align-items: flex-start !important;
					}
					[data-roadmap-phase] {
						flex-direction: column !important;
						align-items: center !important;
						flex: 1 !important;
					}
					[data-roadmap-line-h] {
						display: block !important;
					}
					[data-roadmap-line-v] {
						display: none !important;
					}
					[data-roadmap-text] {
						text-align: center !important;
						margin-left: 0 !important;
						margin-top: 12px !important;
					}
				}
			`}</style>

				<div
					data-roadmap-container=""
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "flex-start",
						gap: 0,
						padding: "16px 0",
					}}
				>
					{PHASES.map((item, index) => (
						<div key={item.phase}>
							<div
								data-roadmap-phase=""
								style={{
									display: "flex",
									flexDirection: "row",
									alignItems: "center",
								}}
							>
								{/* Date — shown above circle on desktop, hidden on mobile (shown in text block instead) */}
								<div
									style={{
										display: "none",
									}}
									data-roadmap-date=""
								/>

								{/* Circle */}
								<div style={getCircleStyle(item.status)}>{item.phase}</div>

								{/* Text block (mobile: to the right; desktop: below) */}
								<div
									data-roadmap-text=""
									style={{
										marginLeft: 16,
										marginTop: 0,
									}}
								>
									<div
										style={{
											fontSize: 12,
											color: theme.muted,
											fontWeight: 500,
											letterSpacing: "0.04em",
											textTransform: "uppercase",
										}}
									>
										{item.date}
									</div>
									<div
										style={{
											fontSize: 14,
											fontWeight: 600,
											color:
												item.status === "complete" || item.status === "in-progress"
													? theme.text
													: theme.muted,
											marginTop: 2,
										}}
									>
										{item.title}
									</div>
									<div
										style={{
											fontSize: 12,
											color:
												item.status === "complete"
													? isLight
														? theme.secondary
														: theme.accent
													: item.status === "in-progress"
														? isLight
															? theme.accent
															: theme.secondary
														: theme.muted,
											fontWeight: 600,
											textTransform: "uppercase",
											letterSpacing: "0.05em",
											marginTop: 2,
										}}
									>
										{item.status.replace("-", " ")}
									</div>
								</div>
							</div>

							{/* Vertical connecting line (mobile) */}
							{index < PHASES.length - 1 && (
								<div
									data-roadmap-line-v=""
									style={{
										display: "block",
										width: 2,
										height: 32,
										backgroundColor: getLineColor(index),
										marginLeft: 19,
									}}
								/>
							)}

							{/* Horizontal connecting line (desktop) — rendered via CSS positioning */}
						</div>
					))}
				</div>

				{/* Desktop horizontal lines overlay */}
				<style>{`
				@media (min-width: 768px) {
					[data-roadmap-container] {
						position: relative;
					}
					[data-roadmap-container]::before {
						content: '';
						position: absolute;
						top: 36px;
						left: 10%;
						right: 10%;
						height: 2px;
						background: linear-gradient(
							to right,
							${isLight ? theme.secondary : theme.accent} 0%,
							${isLight ? theme.secondary : theme.accent} 25%,
							${theme.muted} 25%,
							${theme.muted} 100%
						);
					}
				}
			`}</style>
			</div>
		</DiagramWrapper>
	);
}

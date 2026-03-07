"use client";

import { getTheme } from "./theme";

const EVENTS = [
	{ year: 2003, event: "CAPTCHA coined", type: "milestone" },
	{ year: 2007, event: "reCAPTCHA", type: "milestone" },
	{ year: 2009, event: "Google acquires", type: "milestone" },
	{ year: 2014, event: "No CAPTCHA reCAPTCHA", type: "evolution" },
	{ year: 2018, event: "reCAPTCHA v3", type: "evolution" },
	{ year: 2022, event: "Cloudflare Turnstile", type: "evolution" },
	{ year: 2025, event: "Private Access Tokens", type: "evolution" },
	{ year: 2026, event: "CAPTHCA", type: "breakthrough" },
] as const;

export function CaptchaTimeline({ track }: { track: "light" | "dark" }) {
	const theme = getTheme(track);
	const isLight = track === "light";

	const lineColor = isLight ? theme.secondary : theme.accent;
	const nodeColor = isLight ? theme.accent : theme.muted;
	const capthcaColor = isLight ? theme.secondary : theme.secondary;
	const capthcaGlow = isLight
		? `0 0 12px ${theme.secondary}, 0 0 24px ${theme.secondary}60`
		: `0 0 12px ${theme.secondary}, 0 0 24px ${theme.secondary}80`;

	return (
		<div style={{ width: "100%" }}>
			<style>{`
				@keyframes captcha-timeline-pulse {
					0%, 100% { box-shadow: 0 0 12px ${theme.secondary}, 0 0 24px ${theme.secondary}60; }
					50% { box-shadow: 0 0 20px ${theme.secondary}, 0 0 40px ${theme.secondary}90; }
				}
			`}</style>
			<div
				style={{
					overflowX: "auto",
					padding: "24px 0",
					WebkitOverflowScrolling: "touch",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						position: "relative",
						minWidth: EVENTS.length * 140,
						padding: "40px 24px",
					}}
				>
					{/* Horizontal line */}
					<div
						style={{
							position: "absolute",
							top: "50%",
							left: 24,
							right: 24,
							height: 2,
							backgroundColor: lineColor,
							transform: "translateY(-1px)",
						}}
					/>

					{EVENTS.map((item) => {
						const isCapthca = item.type === "breakthrough";
						const nodeSize = isCapthca ? 20 : 12;

						return (
							<div
								key={item.year}
								style={{
									flex: "1 0 0",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									position: "relative",
									zIndex: 1,
								}}
							>
								{/* Year above */}
								<div
									style={{
										fontSize: isCapthca ? 15 : 12,
										fontWeight: isCapthca ? 700 : 500,
										color: isCapthca ? capthcaColor : theme.muted,
										marginBottom: 12,
										whiteSpace: "nowrap",
									}}
								>
									{item.year}
								</div>

								{/* Node */}
								<div
									style={{
										width: nodeSize,
										height: nodeSize,
										borderRadius: "50%",
										backgroundColor: isCapthca ? capthcaColor : nodeColor,
										boxShadow: isCapthca ? capthcaGlow : "none",
										...(isCapthca && !isLight
											? {
													animation: "captcha-timeline-pulse 2s ease-in-out infinite",
												}
											: {}),
									}}
								/>

								{/* Event below */}
								<div
									style={{
										fontSize: isCapthca ? 14 : 11,
										fontWeight: isCapthca ? 700 : 400,
										color: isCapthca ? capthcaColor : theme.text,
										marginTop: 12,
										textAlign: "center",
										whiteSpace: "nowrap",
										...(isCapthca
											? {
													textShadow: isLight ? "none" : `0 0 8px ${theme.secondary}80`,
												}
											: {}),
									}}
								>
									{item.event}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

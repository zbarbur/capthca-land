"use client";

import { getTheme } from "./theme";
import { useCountUp } from "./useCountUp";

const STATS = [
	{ value: 88, unit: "bytes", label: "Proof Size" },
	{ value: 3, unit: "ms", label: "Verification Time" },
	{ value: 80, unit: "x", label: "Faster than SHA-256" },
	{ value: 0, unit: "", label: "Identity Revealed" },
] as const;

function StatCard({ stat, track }: { stat: (typeof STATS)[number]; track: "light" | "dark" }) {
	const theme = getTheme(track);
	const { value, ref } = useCountUp(stat.value);
	const displayValue = stat.value === 0 ? 0 : value;

	const cardStyle: React.CSSProperties =
		track === "light"
			? {
					backgroundColor: "#ffffff",
					borderRadius: 12,
					padding: "24px 16px",
					textAlign: "center",
					boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
					border: `1px solid ${theme.border}`,
				}
			: {
					backgroundColor: "rgba(10, 10, 10, 0.8)",
					borderRadius: 12,
					padding: "24px 16px",
					textAlign: "center",
					border: `1px solid ${theme.border}`,
					boxShadow: "none",
				};

	const numberStyle: React.CSSProperties = {
		fontSize: 40,
		fontWeight: 700,
		lineHeight: 1.1,
		color: theme.accent,
		...(track === "dark"
			? { textShadow: `0 0 12px ${theme.accent}, 0 0 24px ${theme.accent}40` }
			: {}),
	};

	const unitStyle: React.CSSProperties = {
		fontSize: 18,
		fontWeight: 600,
		color: theme.secondary,
		marginLeft: 4,
	};

	const labelStyle: React.CSSProperties = {
		fontSize: 13,
		color: theme.muted,
		marginTop: 8,
		letterSpacing: "0.03em",
		textTransform: "uppercase" as const,
	};

	return (
		<div ref={ref} style={cardStyle}>
			<div>
				<span style={numberStyle}>{displayValue}</span>
				{stat.unit && <span style={unitStyle}>{stat.unit}</span>}
			</div>
			<div style={labelStyle}>{stat.label}</div>
		</div>
	);
}

export function StatsDashboard({ track }: { track: "light" | "dark" }) {
	return (
		<div style={{ width: "100%" }}>
			<style>{`
				@media (min-width: 768px) {
					[data-stats-grid] {
						grid-template-columns: repeat(4, 1fr) !important;
					}
				}
			`}</style>
			<div
				data-stats-grid=""
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(2, 1fr)",
					gap: 16,
					width: "100%",
				}}
			>
				{STATS.map((stat) => (
					<StatCard key={stat.label} stat={stat} track={track} />
				))}
			</div>
		</div>
	);
}

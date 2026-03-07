"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { getTheme } from "./theme";

const DATA = [
	{ name: "AI-Generated\nPhishing", value: 54 },
	{ name: "Human-Written\nPhishing", value: 12 },
];

export function PhishingBarChart({ track }: { track: "light" | "dark" }) {
	const theme = getTheme(track);
	const barColors = [theme.accent, theme.muted];

	return (
		<div style={{ width: "100%", textAlign: "center" }}>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={DATA} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
					<CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
					<XAxis
						dataKey="name"
						tick={{ fill: theme.text, fontSize: 12 }}
						axisLine={{ stroke: theme.border }}
						tickLine={false}
					/>
					<YAxis
						tick={{ fill: theme.muted, fontSize: 12 }}
						axisLine={{ stroke: theme.border }}
						tickLine={false}
						label={{
							value: "Click-Through Rate (%)",
							angle: -90,
							position: "insideLeft",
							fill: theme.muted,
							fontSize: 12,
							dx: -5,
						}}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: theme.cardBg,
							border: `1px solid ${theme.border}`,
							color: theme.text,
							borderRadius: 8,
						}}
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						formatter={(value: any) => [`${value}%`, "Click Rate"]}
					/>
					<Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
						{DATA.map((entry, index) => (
							<Cell key={entry.name} fill={barColors[index]} />
						))}
					</Bar>
					{/* Annotation */}
					<text
						x="50%"
						y={24}
						textAnchor="middle"
						fill={theme.accent}
						fontSize={14}
						fontWeight="bold"
					>
						4.5x more effective
					</text>
				</BarChart>
			</ResponsiveContainer>
			<p
				style={{
					color: theme.muted,
					fontSize: 11,
					marginTop: 4,
				}}
			>
				Source: IBM X-Force 2024
			</p>
		</div>
	);
}

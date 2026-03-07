"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTheme } from "./theme";

const CHART_DATA = [
	{ category: "Fortune 500\nAI Agents", active: 80, gap: 20 },
	{ category: "Governance\nFrameworks", active: 21, gap: 79 },
];

export function AgentGovernanceChart({ track }: { track: "light" | "dark" }) {
	const theme = getTheme(track);

	return (
		<div style={{ width: "100%", textAlign: "center" }}>
			<ResponsiveContainer width="100%" height={240}>
				<BarChart
					data={CHART_DATA}
					layout="vertical"
					margin={{ top: 20, right: 40, left: 30, bottom: 20 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke={theme.border} horizontal={false} />
					<XAxis
						type="number"
						domain={[0, 100]}
						tick={{ fill: theme.muted, fontSize: 12 }}
						axisLine={{ stroke: theme.border }}
						tickLine={false}
						tickFormatter={(v) => `${v}%`}
					/>
					<YAxis
						type="category"
						dataKey="category"
						tick={{ fill: theme.text, fontSize: 12 }}
						axisLine={{ stroke: theme.border }}
						tickLine={false}
						width={100}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: theme.cardBg,
							border: `1px solid ${theme.border}`,
							color: theme.text,
							borderRadius: 8,
						}}
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						formatter={(value: any, name: any) => {
							const label = name === "active" ? "Deployed / Have" : "None / Missing";
							return [`${value}%`, label];
						}}
					/>
					<Bar dataKey="active" stackId="stack" fill={theme.accent} radius={[0, 0, 0, 0]} />
					<Bar dataKey="gap" stackId="stack" fill={theme.subtle} radius={[0, 4, 4, 0]} />
					{/* Annotation */}
					<text
						x="50%"
						y={16}
						textAnchor="middle"
						fill={theme.danger}
						fontSize={16}
						fontWeight="bold"
					>
						59% GOVERNANCE GAP
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
				Source: McKinsey 2024
			</p>
		</div>
	);
}

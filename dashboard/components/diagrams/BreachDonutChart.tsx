"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DiagramWrapper } from "./DiagramWrapper";
import { getTheme } from "./theme";

const DATA = [
	{ name: "Human Element", value: 68 },
	{ name: "System Vulnerabilities", value: 13 },
	{ name: "Malware", value: 10 },
	{ name: "Credential Theft", value: 6 },
	{ name: "Other", value: 3 },
];

const COLORS_LIGHT = ["#0288D1", "#FFD700", "#90CAF9", "#B0BEC5", "#CFD8DC"];
const COLORS_DARK = ["#39FF14", "#ff003c", "#00FF41", "#666666", "#333333"];

export function BreachDonutChart({ track }: { track: "light" | "dark" }) {
	const theme = getTheme(track);
	const colors = track === "light" ? COLORS_LIGHT : COLORS_DARK;

	return (
		<DiagramWrapper>
			<div style={{ width: "100%", textAlign: "center" }}>
				<ResponsiveContainer width="100%" height={300}>
					<PieChart>
						<Pie
							data={DATA}
							cx="50%"
							cy="50%"
							innerRadius={70}
							outerRadius={110}
							dataKey="value"
							stroke="none"
						>
							{DATA.map((entry, index) => (
								<Cell key={entry.name} fill={colors[index % colors.length]} />
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								backgroundColor: theme.cardBg,
								border: `1px solid ${theme.border}`,
								color: theme.text,
								borderRadius: 8,
							}}
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							formatter={(value: any) => [`${value}%`]}
						/>
						{/* Center label */}
						<text
							x="50%"
							y="46%"
							textAnchor="middle"
							dominantBaseline="central"
							fill={theme.text}
							fontSize={28}
							fontWeight="bold"
						>
							68%
						</text>
						<text
							x="50%"
							y="57%"
							textAnchor="middle"
							dominantBaseline="central"
							fill={theme.muted}
							fontSize={12}
						>
							Human Element
						</text>
					</PieChart>
				</ResponsiveContainer>
				<p
					style={{
						color: theme.muted,
						fontSize: 12,
						marginTop: 4,
					}}
				>
					Source: Verizon DBIR 2024
				</p>
			</div>
		</DiagramWrapper>
	);
}

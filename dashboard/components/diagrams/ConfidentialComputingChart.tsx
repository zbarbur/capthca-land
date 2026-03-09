"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { DiagramWrapper } from "./DiagramWrapper";
import { getTheme } from "./theme";

const DATA = [
	{ year: 2022, value: 12 },
	{ year: 2023, value: 17 },
	{ year: 2024, value: 24 },
	{ year: 2025, value: 42 },
	{ year: 2026, value: 72 },
	{ year: 2027, value: 120 },
	{ year: 2028, value: 195 },
	{ year: 2029, value: 310 },
	{ year: 2030, value: 464 },
];

export function ConfidentialComputingChart({ track }: { track: "light" | "dark" }) {
	const theme = getTheme(track);
	const gradientId = `ccGrad-${track}`;

	return (
		<DiagramWrapper>
			<div style={{ width: "100%", textAlign: "center" }}>
				<ResponsiveContainer width="100%" height={320}>
					<AreaChart data={DATA} margin={{ top: 30, right: 30, left: 20, bottom: 20 }}>
						<defs>
							<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={theme.accent} stopOpacity={0.3} />
								<stop offset="100%" stopColor={theme.accent} stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
						<XAxis
							dataKey="year"
							tick={{ fill: theme.muted, fontSize: 12 }}
							axisLine={{ stroke: theme.border }}
							tickLine={false}
						/>
						<YAxis
							tick={{ fill: theme.muted, fontSize: 12 }}
							axisLine={{ stroke: theme.border }}
							tickLine={false}
							label={{
								value: "Market Size ($B)",
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
							formatter={(value: any) => [`$${value}B`, "Market Size"]}
						/>
						<ReferenceLine
							x={2026}
							stroke={theme.secondary}
							strokeDasharray="5 5"
							strokeWidth={2}
							label={{
								value: "CAPTHCA Launch",
								position: "top",
								fill: theme.secondary,
								fontSize: 12,
								fontWeight: "bold",
							}}
						/>
						<Area
							type="monotone"
							dataKey="value"
							stroke={theme.accent}
							strokeWidth={2}
							fill={`url(#${gradientId})`}
						/>
						{/* Callout text */}
						<text
							x="78%"
							y={20}
							textAnchor="middle"
							fill={theme.text}
							fontSize={13}
							fontWeight="bold"
						>
							$24B → $464B
						</text>
						<text
							x="78%"
							y={38}
							textAnchor="middle"
							fill={theme.accent}
							fontSize={12}
							fontWeight="bold"
						>
							1,835% growth
						</text>
					</AreaChart>
				</ResponsiveContainer>
				<p
					style={{
						color: theme.muted,
						fontSize: 12,
						marginTop: 4,
					}}
				>
					Source: Gartner 2024
				</p>
			</div>
		</DiagramWrapper>
	);
}

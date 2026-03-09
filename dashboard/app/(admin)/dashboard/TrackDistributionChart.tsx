"use client";

import { Cell, Pie, PieChart, type PieLabelRenderProps, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#38bdf8", "#22c55e"]; // sky-400, green-500

interface ChartProps {
	data: Array<{ name: string; value: number }>;
}

export function TrackDistributionChart({ data }: ChartProps) {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<PieChart>
				<Pie
					data={data}
					cx="50%"
					cy="50%"
					innerRadius={70}
					outerRadius={110}
					paddingAngle={4}
					dataKey="value"
					label={(props: PieLabelRenderProps) =>
						`${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
					}
				>
					{data.map((_entry, index) => (
						<Cell key={`cell-${_entry.name}`} fill={COLORS[index % COLORS.length]} />
					))}
				</Pie>
				<Tooltip
					contentStyle={{
						backgroundColor: "#18181b",
						border: "1px solid #3f3f46",
						borderRadius: "8px",
						color: "#fafafa",
					}}
				/>
			</PieChart>
		</ResponsiveContainer>
	);
}

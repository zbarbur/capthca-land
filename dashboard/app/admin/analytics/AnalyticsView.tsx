"use client";

import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DateRange = "7d" | "30d" | "90d";

interface GA4Metrics {
	activeUsers: number;
	pageViews: number;
	avgEngagementTime: number;
	newVsReturning: { new: number; returning: number };
	topPages: Array<{ path: string; views: number }>;
	pageViewTrend: Array<{ date: string; views: number }>;
}

interface ApiResponse {
	data: GA4Metrics | null;
	message?: string;
}

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
	{ value: "7d", label: "7 days" },
	{ value: "30d", label: "30 days" },
	{ value: "90d", label: "90 days" },
];

function formatDuration(seconds: number): string {
	if (seconds < 60) return `${seconds}s`;
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export default function AnalyticsView() {
	const [dateRange, setDateRange] = useState<DateRange>("30d");
	const [data, setData] = useState<GA4Metrics | null>(null);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);

	const fetchData = useCallback(async (range: DateRange) => {
		setLoading(true);
		setMessage(null);
		try {
			const res = await fetch(`/api/admin/analytics?dateRange=${range}`);
			const json: ApiResponse = await res.json();
			setData(json.data);
			if (json.message) setMessage(json.message);
		} catch {
			setMessage("Failed to fetch analytics data");
			setData(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData(dateRange);
	}, [dateRange, fetchData]);

	return (
		<div className="space-y-6">
			{/* Date range selector */}
			<div className="flex gap-2" data-testid="date-range-selector">
				{DATE_RANGE_OPTIONS.map((opt) => (
					<button
						key={opt.value}
						type="button"
						onClick={() => setDateRange(opt.value)}
						className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
							dateRange === opt.value
								? "bg-zinc-100 text-zinc-900"
								: "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
						}`}
					>
						{opt.label}
					</button>
				))}
			</div>

			{/* Loading state */}
			{loading && (
				<div className="text-zinc-500 text-sm py-8 text-center">Loading analytics...</div>
			)}

			{/* Empty / not configured state */}
			{!loading && !data && (
				<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
					<p className="text-zinc-400 text-sm">
						{message || "Analytics data unavailable. Please try again later."}
					</p>
				</div>
			)}

			{/* Data display */}
			{!loading && data && (
				<>
					{/* Stat cards */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						<StatCard label="Active Users" value={data.activeUsers.toLocaleString()} />
						<StatCard label="Page Views" value={data.pageViews.toLocaleString()} />
						<StatCard label="Avg Engagement" value={formatDuration(data.avgEngagementTime)} />
						<StatCard
							label="New vs Returning"
							value={`${data.newVsReturning.new} / ${data.newVsReturning.returning}`}
						/>
					</div>

					{/* Page View Trend chart */}
					<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
						<h2 className="text-sm font-medium text-zinc-400 mb-4">Page View Trend</h2>
						{data.pageViewTrend.length > 0 ? (
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={data.pageViewTrend}>
									<CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
									<XAxis
										dataKey="date"
										tick={{ fill: "#a1a1aa", fontSize: 11 }}
										tickFormatter={(val: string) => val.slice(5)}
									/>
									<YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
									<Tooltip
										contentStyle={{
											backgroundColor: "#18181b",
											border: "1px solid #3f3f46",
											borderRadius: 6,
										}}
										labelStyle={{ color: "#e4e4e7" }}
										itemStyle={{ color: "#a1a1aa" }}
									/>
									<Bar dataKey="views" fill="#6366f1" radius={[2, 2, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						) : (
							<p className="text-zinc-500 text-sm text-center py-8">No trend data available</p>
						)}
					</div>

					{/* Top Pages table */}
					<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
						<h2 className="text-sm font-medium text-zinc-400 mb-4">Top Pages</h2>
						{data.topPages.length > 0 ? (
							<table className="w-full text-sm">
								<thead>
									<tr className="text-zinc-500 border-b border-zinc-800">
										<th className="text-left py-2 font-medium">Path</th>
										<th className="text-right py-2 font-medium">Views</th>
									</tr>
								</thead>
								<tbody>
									{data.topPages.map((page) => (
										<tr key={page.path} className="border-b border-zinc-800/50">
											<td className="py-2 text-zinc-300 font-mono text-xs">{page.path}</td>
											<td className="py-2 text-right text-zinc-400">
												{page.views.toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<p className="text-zinc-500 text-sm text-center py-4">No page data available</p>
						)}
					</div>
				</>
			)}
		</div>
	);
}

function StatCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
			<p className="text-xs text-zinc-500 mb-1">{label}</p>
			<p className="text-xl font-bold text-zinc-100">{value}</p>
		</div>
	);
}

import { BetaAnalyticsDataClient } from "@google-analytics/data";

export type DateRange = "7d" | "30d" | "90d";

export interface GA4Metrics {
	activeUsers: number;
	pageViews: number;
	avgEngagementTime: number;
	newVsReturning: { new: number; returning: number };
	topPages: Array<{ path: string; views: number }>;
	pageViewTrend: Array<{ date: string; views: number }>;
}

const DATE_RANGE_MAP: Record<DateRange, string> = {
	"7d": "7daysAgo",
	"30d": "30daysAgo",
	"90d": "90daysAgo",
};

function getClient(): BetaAnalyticsDataClient {
	return new BetaAnalyticsDataClient();
}

export async function fetchGA4Metrics(
	propertyId: string,
	dateRange: DateRange = "30d",
): Promise<GA4Metrics | null> {
	const client = getClient();

	const startDate = DATE_RANGE_MAP[dateRange];
	const property = `properties/${propertyId}`;

	try {
		// Run all reports in parallel
		const [coreResponse, topPagesResponse, trendResponse] = await Promise.all([
			// Core metrics: active users, page views, engagement time, new vs returning
			client.runReport({
				property,
				dateRanges: [{ startDate, endDate: "today" }],
				dimensions: [{ name: "newVsReturning" }],
				metrics: [
					{ name: "activeUsers" },
					{ name: "screenPageViews" },
					{ name: "averageSessionDuration" },
				],
			}),
			// Top pages
			client.runReport({
				property,
				dateRanges: [{ startDate, endDate: "today" }],
				dimensions: [{ name: "pagePath" }],
				metrics: [{ name: "screenPageViews" }],
				orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
				limit: 10,
			}),
			// Page view trend by date
			client.runReport({
				property,
				dateRanges: [{ startDate, endDate: "today" }],
				dimensions: [{ name: "date" }],
				metrics: [{ name: "screenPageViews" }],
				orderBys: [{ dimension: { dimensionName: "date" } }],
			}),
		]);

		// Parse core metrics
		let activeUsers = 0;
		let pageViews = 0;
		let avgEngagementTime = 0;
		const newVsReturning = { new: 0, returning: 0 };

		const coreRows = coreResponse[0]?.rows ?? [];
		for (const row of coreRows) {
			const segment = row.dimensionValues?.[0]?.value ?? "";
			const users = Number(row.metricValues?.[0]?.value ?? 0);
			const views = Number(row.metricValues?.[1]?.value ?? 0);
			const engagement = Number(row.metricValues?.[2]?.value ?? 0);

			activeUsers += users;
			pageViews += views;
			avgEngagementTime += engagement * users; // weighted

			if (segment === "new") {
				newVsReturning.new = users;
			} else if (segment === "returning") {
				newVsReturning.returning = users;
			}
		}

		// Weighted average engagement time
		if (activeUsers > 0) {
			avgEngagementTime = Math.round(avgEngagementTime / activeUsers);
		}

		// Parse top pages
		const topPages: GA4Metrics["topPages"] = [];
		const topPagesRows = topPagesResponse[0]?.rows ?? [];
		for (const row of topPagesRows) {
			topPages.push({
				path: row.dimensionValues?.[0]?.value ?? "/",
				views: Number(row.metricValues?.[0]?.value ?? 0),
			});
		}

		// Parse trend
		const pageViewTrend: GA4Metrics["pageViewTrend"] = [];
		const trendRows = trendResponse[0]?.rows ?? [];
		for (const row of trendRows) {
			const rawDate = row.dimensionValues?.[0]?.value ?? "";
			// Format YYYYMMDD → YYYY-MM-DD
			const date =
				rawDate.length === 8
					? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
					: rawDate;
			pageViewTrend.push({
				date,
				views: Number(row.metricValues?.[0]?.value ?? 0),
			});
		}

		return {
			activeUsers,
			pageViews,
			avgEngagementTime,
			newVsReturning,
			topPages,
			pageViewTrend,
		};
	} catch (err) {
		console.warn("[ga4-reporting] Failed to fetch GA4 metrics:", err);
		throw err;
	}
}

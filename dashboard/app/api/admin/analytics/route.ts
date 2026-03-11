import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { type DateRange, fetchGA4Metrics } from "@/lib/ga4-reporting";

const VALID_RANGES = new Set(["7d", "30d", "90d"]);

export async function GET(request: Request) {
	// Verify admin access
	const user = getAdminUser(request);
	if (!user) {
		return NextResponse.json({ error: "forbidden" }, { status: 403 });
	}

	const url = new URL(request.url);
	const rangeParam = url.searchParams.get("dateRange");
	const dateRange: DateRange =
		rangeParam && VALID_RANGES.has(rangeParam) ? (rangeParam as DateRange) : "30d";

	const propertyId = process.env.CAPTHCA_LAND_GA4_PROPERTY_ID;

	if (!propertyId) {
		return NextResponse.json({
			data: null,
			message: "Analytics not configured. Contact your administrator.",
		});
	}

	try {
		const data = await fetchGA4Metrics(propertyId, dateRange);
		return NextResponse.json({ data });
	} catch (err) {
		console.error("[admin/analytics] Failed to fetch analytics:", err);
		return NextResponse.json({ data: null, message: "Failed to fetch analytics" });
	}
}

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { fetchRecentLogs, type LogSeverity, type LogType } from "@/lib/cloud-logging";

const VALID_SEVERITIES = new Set(["INFO", "WARNING", "ERROR"]);
const VALID_TYPES = new Set(["analytics", "subscribe", "health", "error"]);

export async function GET(request: Request) {
	// Verify admin access
	const user = getAdminUser(request);
	if (!user) {
		return NextResponse.json({ error: "forbidden" }, { status: 403 });
	}

	const url = new URL(request.url);
	const severityParam = url.searchParams.get("severity");
	const typeParam = url.searchParams.get("type");
	const limitParam = url.searchParams.get("limit");
	const pageToken = url.searchParams.get("pageToken");

	const severity =
		severityParam && VALID_SEVERITIES.has(severityParam.toUpperCase())
			? (severityParam.toUpperCase() as LogSeverity)
			: undefined;

	const type = typeParam && VALID_TYPES.has(typeParam) ? (typeParam as LogType) : undefined;

	const limit = limitParam
		? Math.min(Math.max(Number.parseInt(limitParam, 10) || 100, 1), 500)
		: 100;

	try {
		const result = await fetchRecentLogs({
			severity,
			type,
			limit,
			pageToken: pageToken || undefined,
		});

		return NextResponse.json(result);
	} catch (err) {
		console.error("[admin/logs] Failed to fetch logs:", err);
		return NextResponse.json({ entries: [], nextPageToken: null });
	}
}

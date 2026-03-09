// ---------------------------------------------------------------------------
// Cloud Logging client — fetches structured log entries from GCP
// ---------------------------------------------------------------------------

import { Logging } from "@google-cloud/logging";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "capthca-489205";
const SERVICE_NAME = process.env.CAPTHCA_LAND_CLOUD_RUN_SERVICE || "capthca-land-prod";

export type LogSeverity = "INFO" | "WARNING" | "ERROR";
export type LogType = "analytics" | "subscribe" | "health" | "error";

export interface LogEntry {
	id: string;
	timestamp: string;
	severity: LogSeverity;
	message: string;
	type: string | null;
	metadata: Record<string, unknown>;
	stackTrace: string | null;
}

export interface FetchLogsOptions {
	severity?: LogSeverity;
	type?: LogType;
	limit?: number;
	pageToken?: string;
}

export interface FetchLogsResult {
	entries: LogEntry[];
	nextPageToken: string | null;
}

/**
 * Fetch recent structured log entries from Cloud Logging.
 * Returns empty results when Cloud Logging is unavailable (e.g. local dev).
 */
export async function fetchRecentLogs(options: FetchLogsOptions = {}): Promise<FetchLogsResult> {
	const { severity, type, limit = 100, pageToken } = options;

	try {
		const logging = new Logging({ projectId: PROJECT_ID });

		// Build filter
		const filters: string[] = [
			`resource.type="cloud_run_revision"`,
			`resource.labels.service_name="${SERVICE_NAME}"`,
		];

		if (severity) {
			filters.push(`severity="${severity}"`);
		}

		if (type) {
			filters.push(`jsonPayload.type="${type}"`);
		}

		const filter = filters.join(" AND ");

		const [entries, , response] = await logging.getEntries({
			filter,
			orderBy: "timestamp desc",
			pageSize: limit,
			pageToken: pageToken || undefined,
		});

		const parsed: LogEntry[] = entries.map((entry) => {
			const data = entry.metadata;
			const jsonPayload =
				(data?.jsonPayload as Record<string, unknown>) ??
				(entry.data as Record<string, unknown>) ??
				{};

			const entrySeverity = (
				(data?.severity as string) ||
				(jsonPayload.severity as string) ||
				"INFO"
			).toUpperCase() as LogSeverity;

			const message =
				(jsonPayload.message as string) ||
				(data?.textPayload as string) ||
				JSON.stringify(jsonPayload);

			const entryType = (jsonPayload.type as string) || null;

			// Extract stack trace from error entries
			let stackTrace: string | null = null;
			if (entrySeverity === "ERROR") {
				stackTrace =
					(jsonPayload.stack as string) ||
					(jsonPayload.stackTrace as string) ||
					(jsonPayload.error as string) ||
					null;
			}

			// Build metadata (exclude fields we already extracted)
			const {
				message: _m,
				type: _t,
				severity: _s,
				stack: _st,
				stackTrace: _str,
				...rest
			} = jsonPayload;

			return {
				id:
					(data?.insertId as string) || `log-${Date.now()}-${Math.random().toString(36).slice(2)}`,
				timestamp:
					(data?.timestamp as string) ||
					(jsonPayload.timestamp as string) ||
					new Date().toISOString(),
				severity: entrySeverity,
				message,
				type: entryType,
				metadata: rest,
				stackTrace,
			};
		});

		const nextPageToken = (response as { nextPageToken?: string })?.nextPageToken || null;

		return { entries: parsed, nextPageToken };
	} catch (err) {
		// Cloud Logging unavailable (local dev, missing credentials, etc.)
		console.warn(
			"[cloud-logging] Failed to fetch logs — returning empty results:",
			err instanceof Error ? err.message : String(err),
		);
		return { entries: [], nextPageToken: null };
	}
}

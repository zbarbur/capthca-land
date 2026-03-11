"use client";

import { useCallback, useEffect, useState } from "react";
import type { LogEntry } from "@/lib/cloud-logging";

const SEVERITY_STYLES: Record<string, string> = {
	INFO: "bg-zinc-700 text-zinc-300",
	WARNING: "bg-amber-900/60 text-amber-300",
	ERROR: "bg-red-900/60 text-red-300",
};

const SEVERITY_ROW_STYLES: Record<string, string> = {
	INFO: "",
	WARNING: "border-l-2 border-l-amber-500",
	ERROR: "border-l-2 border-l-red-500",
};

const TYPE_STYLES: Record<string, string> = {
	analytics: "bg-blue-900/40 text-blue-300",
	subscribe: "bg-green-900/40 text-green-300",
	health: "bg-purple-900/40 text-purple-300",
	error: "bg-red-900/40 text-red-300",
};

function formatTimestamp(ts: string): string {
	try {
		const d = new Date(ts);
		return d.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		});
	} catch {
		return ts;
	}
}

export default function LogViewer() {
	const [entries, setEntries] = useState<LogEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [severity, setSeverity] = useState<string>("");
	const [type, setType] = useState<string>("");
	const [nextPageToken, setNextPageToken] = useState<string | null>(null);
	const [loadingMore, setLoadingMore] = useState(false);
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

	const fetchLogs = useCallback(
		async (append = false, pageToken?: string) => {
			if (append) {
				setLoadingMore(true);
			} else {
				setLoading(true);
			}

			try {
				const params = new URLSearchParams();
				if (severity) params.set("severity", severity);
				if (type) params.set("type", type);
				params.set("limit", "100");
				if (pageToken) params.set("pageToken", pageToken);

				const res = await fetch(`/api/admin/logs?${params.toString()}`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);

				const data = await res.json();

				if (append) {
					setEntries((prev) => [...prev, ...data.entries]);
				} else {
					setEntries(data.entries);
				}
				setNextPageToken(data.nextPageToken);
			} catch (err) {
				console.error("Failed to fetch logs:", err);
				if (!append) setEntries([]);
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[severity, type],
	);

	useEffect(() => {
		fetchLogs();
	}, [fetchLogs]);

	const handleRefresh = () => {
		setExpandedIds(new Set());
		fetchLogs();
	};

	const handleLoadMore = () => {
		if (nextPageToken) {
			fetchLogs(true, nextPageToken);
		}
	};

	const toggleExpand = (id: string) => {
		setExpandedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	return (
		<div>
			{/* Filter controls */}
			<div className="flex flex-wrap items-center gap-3 mb-4">
				<label className="flex items-center gap-2 text-sm text-zinc-400">
					Severity
					<select
						value={severity}
						onChange={(e) => setSeverity(e.target.value)}
						className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500"
						data-testid="severity-filter"
					>
						<option value="">All</option>
						<option value="INFO">INFO</option>
						<option value="WARNING">WARNING</option>
						<option value="ERROR">ERROR</option>
					</select>
				</label>

				<label className="flex items-center gap-2 text-sm text-zinc-400">
					Type
					<select
						value={type}
						onChange={(e) => setType(e.target.value)}
						className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500"
						data-testid="type-filter"
					>
						<option value="">All</option>
						<option value="analytics">analytics</option>
						<option value="subscribe">subscribe</option>
						<option value="health">health</option>
						<option value="error">error</option>
					</select>
				</label>

				<button
					type="button"
					onClick={handleRefresh}
					disabled={loading}
					className="ml-auto px-3 py-1 text-sm bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 text-zinc-200 disabled:opacity-50 transition-colors"
					data-testid="refresh-button"
				>
					{loading ? "Loading..." : "Refresh"}
				</button>
			</div>

			{/* Log entries */}
			<div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
				{loading && entries.length === 0 ? (
					<div className="p-8 text-center text-zinc-500">Loading log entries...</div>
				) : entries.length === 0 ? (
					<div className="p-8 text-center text-zinc-500">
						No log entries found. Logs are fetched from Cloud Logging and may be unavailable in
						local development.
					</div>
				) : (
					<div className="divide-y divide-zinc-800">
						{entries.map((entry) => {
							const isExpanded = expandedIds.has(entry.id);
							const hasDetails =
								entry.severity === "ERROR" &&
								(entry.stackTrace || Object.keys(entry.metadata).length > 0);

							return (
								<div
									key={entry.id}
									className={`px-4 py-2 text-sm ${SEVERITY_ROW_STYLES[entry.severity] || ""}`}
								>
									{/* biome-ignore lint/a11y/noStaticElementInteractions: conditionally interactive row */}
									<div
										className={`flex items-start gap-3 ${hasDetails ? "cursor-pointer" : ""}`}
										onClick={hasDetails ? () => toggleExpand(entry.id) : undefined}
										onKeyDown={
											hasDetails
												? (e) => {
														if (e.key === "Enter" || e.key === " ") toggleExpand(entry.id);
													}
												: undefined
										}
										role={hasDetails ? "button" : undefined}
										tabIndex={hasDetails ? 0 : undefined}
									>
										{/* Timestamp */}
										<span className="text-zinc-500 whitespace-nowrap shrink-0 font-mono text-xs pt-0.5">
											{formatTimestamp(entry.timestamp)}
										</span>

										{/* Severity badge */}
										<span
											className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${SEVERITY_STYLES[entry.severity] || SEVERITY_STYLES.INFO}`}
											data-severity={entry.severity}
										>
											{entry.severity}
										</span>

										{/* Type badge */}
										{entry.type && (
											<span
												className={`inline-block px-1.5 py-0.5 rounded text-xs shrink-0 ${TYPE_STYLES[entry.type] || "bg-zinc-700 text-zinc-300"}`}
											>
												{entry.type}
											</span>
										)}

										{/* Message */}
										<span className="text-zinc-300 break-all flex-1">{entry.message}</span>

										{/* Expand indicator */}
										{hasDetails && (
											<span className="text-zinc-600 shrink-0">{isExpanded ? "v" : ">"}</span>
										)}
									</div>
									{/* Expanded details */}
									{isExpanded && hasDetails && (
										<div className="mt-2 ml-20 space-y-2">
											{entry.stackTrace && (
												<pre className="bg-zinc-950 border border-zinc-800 rounded p-3 text-xs text-red-300 overflow-x-auto whitespace-pre-wrap font-mono">
													{entry.stackTrace}
												</pre>
											)}
											{Object.keys(entry.metadata).length > 0 && (
												<pre className="bg-zinc-950 border border-zinc-800 rounded p-3 text-xs text-zinc-400 overflow-x-auto whitespace-pre-wrap font-mono">
													{JSON.stringify(entry.metadata, null, 2)}
												</pre>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}

				{/* Load more */}
				{nextPageToken && (
					<div className="p-4 border-t border-zinc-800 text-center">
						<button
							type="button"
							onClick={handleLoadMore}
							disabled={loadingMore}
							className="px-4 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 text-zinc-200 disabled:opacity-50 transition-colors"
							data-testid="load-more-button"
						>
							{loadingMore ? "Loading..." : "Load More"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

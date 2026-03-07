// ---------------------------------------------------------------------------
// Structured JSON Logger — GCP Cloud Logging compatible
// ---------------------------------------------------------------------------

type Severity = "INFO" | "WARNING" | "ERROR";

interface LogEntry {
	severity: Severity;
	message: string;
	timestamp: string;
	[key: string]: unknown;
}

function emit(severity: Severity, message: string, metadata?: Record<string, unknown>): void {
	const entry: LogEntry = {
		severity,
		message,
		timestamp: new Date().toISOString(),
		...metadata,
	};

	const line = JSON.stringify(entry);

	if (severity === "ERROR") {
		console.error(line);
	} else if (severity === "WARNING") {
		console.warn(line);
	} else {
		console.log(line);
	}
}

export const logger = {
	info(message: string, metadata?: Record<string, unknown>): void {
		emit("INFO", message, metadata);
	},
	warn(message: string, metadata?: Record<string, unknown>): void {
		emit("WARNING", message, metadata);
	},
	error(message: string, metadata?: Record<string, unknown>): void {
		emit("ERROR", message, metadata);
	},
};

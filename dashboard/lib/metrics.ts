// ---------------------------------------------------------------------------
// Lightweight Metrics — structured JSON log lines for Cloud Logging
// ---------------------------------------------------------------------------

interface MetricEntry {
	severity: "INFO";
	type: "metric";
	metric: string;
	value: number;
	labels: Record<string, string>;
	timestamp: string;
}

function increment(metric: string, labels: Record<string, string> = {}): void {
	const entry: MetricEntry = {
		severity: "INFO",
		type: "metric",
		metric,
		value: 1,
		labels,
		timestamp: new Date().toISOString(),
	};

	console.log(JSON.stringify(entry));
}

export const metrics = { increment };

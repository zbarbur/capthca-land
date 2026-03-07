// ---------------------------------------------------------------------------
// Client-side Analytics — privacy-first event tracking
// ---------------------------------------------------------------------------

interface AnalyticsEvent {
	event: string;
	properties?: Record<string, unknown>;
	timestamp: string;
}

function track(event: string, properties?: Record<string, unknown>): void {
	const payload: AnalyticsEvent = {
		event,
		properties,
		timestamp: new Date().toISOString(),
	};

	if (process.env.NODE_ENV === "development") {
		console.log("[analytics]", payload);
		return;
	}

	try {
		navigator.sendBeacon("/api/analytics", JSON.stringify(payload));
	} catch {
		// Silently swallow — analytics must never break the app
	}
}

export const analytics = { track };

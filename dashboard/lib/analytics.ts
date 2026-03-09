// ---------------------------------------------------------------------------
// Client-side Analytics — privacy-first event tracking + GA4 integration
// ---------------------------------------------------------------------------

declare global {
	interface Window {
		gtag?: (...args: unknown[]) => void;
		dataLayer?: unknown[];
	}
}

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "";

interface AnalyticsEvent {
	event: string;
	properties?: Record<string, unknown>;
	timestamp: string;
}

/**
 * Typed helper for GA4 custom events via gtag().
 * No-ops when NEXT_PUBLIC_GA4_MEASUREMENT_ID is not set.
 */
export function trackEvent(opts: {
	event: string;
	category: string;
	label?: string;
	value?: number;
}): void {
	if (!GA4_ID) return;

	try {
		if (typeof window !== "undefined" && window.gtag) {
			window.gtag("event", opts.event, {
				event_category: opts.category,
				event_label: opts.label,
				value: opts.value,
			});
		}
	} catch {
		// Analytics must never break the app
	}
}

function track(event: string, properties?: Record<string, unknown>): void {
	const payload: AnalyticsEvent = {
		event,
		properties,
		timestamp: new Date().toISOString(),
	};

	// Fire GA4 event alongside existing tracking
	if (GA4_ID) {
		try {
			if (typeof window !== "undefined" && window.gtag) {
				window.gtag("event", event, properties ?? {});
			}
		} catch {
			// Silently swallow
		}
	}

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

"use client";

import { useEffect } from "react";
import { trackEvent } from "../../lib/analytics";

/**
 * Fires a GA4 track_select event on mount.
 * Drop into server-component track pages (/light, /dark) to record page visits.
 */
export function TrackPageView({ track }: { track: "light" | "dark" }) {
	useEffect(() => {
		trackEvent({ event: "track_select", category: "navigation", label: track });
	}, [track]);

	return null;
}

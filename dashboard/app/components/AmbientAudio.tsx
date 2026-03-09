"use client";

import { useCallback, useEffect, useState } from "react";
import { trackEvent } from "../../lib/analytics";

interface AmbientAudioProps {
	theme: "light" | "dark";
}

const STORAGE_KEY = "capthca-audio-muted";

// Module-level singleton — survives component remounts during navigation
let globalAudio: HTMLAudioElement | null = null;
let globalTrack: string | null = null;

function getOrCreateAudio(theme: "light" | "dark"): HTMLAudioElement {
	const src =
		theme === "dark"
			? "/tracks/dark/assets/ambient-dark.mp3"
			: "/tracks/light/assets/ambient-light.mp3";

	if (globalAudio && globalTrack === theme) {
		return globalAudio;
	}

	// Track changed — swap source but keep playing position concept
	if (globalAudio) {
		globalAudio.pause();
		globalAudio.src = "";
	}

	const audio = new Audio(src);
	audio.loop = true;
	audio.volume = 0.3;
	globalAudio = audio;
	globalTrack = theme;
	return audio;
}

/**
 * Ambient audio toggle for track pages.
 * Audio does NOT autoplay — requires explicit user click (browser policy compliant).
 * Uses a module-level Audio singleton so playback continues across page navigations.
 * Mute state persists via localStorage.
 */
export function AmbientAudio({ theme }: AmbientAudioProps) {
	const [muted, setMuted] = useState(true);
	const [hasInteracted, setHasInteracted] = useState(false);

	// Read persisted mute state on mount — resume playback if previously unmuted
	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored === "false") {
				setMuted(false);
				setHasInteracted(true);
			}
		} catch {
			// localStorage unavailable (SSR, private mode, etc.)
		}
	}, []);

	// Manage audio playback
	useEffect(() => {
		if (!hasInteracted) return;

		const audio = getOrCreateAudio(theme);

		if (!muted) {
			audio.play().catch((err) => {
				console.warn(
					"[AmbientAudio] play() blocked:",
					err.message,
					"src:",
					audio.src,
					"readyState:",
					audio.readyState,
				);
			});
		} else {
			audio.pause();
		}
	}, [theme, muted, hasInteracted]);

	// Persist mute preference
	useEffect(() => {
		if (!hasInteracted) return;
		try {
			localStorage.setItem(STORAGE_KEY, String(muted));
		} catch {
			// localStorage unavailable
		}
	}, [muted, hasInteracted]);

	const toggle = useCallback(() => {
		if (!hasInteracted) {
			setHasInteracted(true);
			setMuted(false);
			trackEvent({ event: "audio_toggle", category: "engagement", label: "unmute" });
		} else {
			const next = !muted;
			setMuted(next);
			trackEvent({
				event: "audio_toggle",
				category: "engagement",
				label: next ? "mute" : "unmute",
			});
		}
	}, [hasInteracted, muted]);

	const isMuted = !hasInteracted || muted;

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={isMuted ? "Unmute ambient audio" : "Mute ambient audio"}
			title={isMuted ? "Unmute ambient audio" : "Mute ambient audio"}
			className={`ambient-audio-toggle ${theme === "dark" ? "ambient-audio-dark" : "ambient-audio-light"}`}
			data-pulse={!hasInteracted ? "true" : undefined}
		>
			{isMuted ? <SpeakerMutedIcon theme={theme} /> : <SpeakerIcon theme={theme} />}
		</button>
	);
}

function SpeakerIcon({ theme }: { theme: "light" | "dark" }) {
	const color = theme === "dark" ? "#39ff14" : "#b48c32";
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
			<path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
			<path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
		</svg>
	);
}

function SpeakerMutedIcon({ theme }: { theme: "light" | "dark" }) {
	const color = theme === "dark" ? "#39ff14" : "#b48c32";
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
			<line x1="23" y1="9" x2="17" y2="15" />
			<line x1="17" y1="9" x2="23" y2="15" />
		</svg>
	);
}

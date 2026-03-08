"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface AmbientAudioProps {
	theme: "light" | "dark";
}

const STORAGE_KEY = "capthca-audio-muted";

/**
 * Ambient audio toggle for track pages.
 * Audio does NOT autoplay — requires explicit user click (browser policy compliant).
 * Mute state persists across navigations via localStorage.
 */
export function AmbientAudio({ theme }: AmbientAudioProps) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [muted, setMuted] = useState(true);
	const [hasInteracted, setHasInteracted] = useState(false);

	// Read persisted mute state on mount
	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored === "false") {
				setMuted(false);
			}
		} catch {
			// localStorage unavailable (SSR, private mode, etc.)
		}
	}, []);

	// Create / update audio element when theme or muted state changes
	useEffect(() => {
		if (!hasInteracted) return;

		if (!audioRef.current) {
			const audio = new Audio();
			audio.loop = true;
			audio.volume = 0.3;
			audioRef.current = audio;
		}

		const audio = audioRef.current;
		const src =
			theme === "dark"
				? "/tracks/dark/assets/ambient-dark.mp3"
				: "/tracks/light/assets/ambient-light.mp3";

		if (audio.src !== new URL(src, window.location.origin).href) {
			audio.src = src;
		}

		if (!muted) {
			audio.play().catch(() => {
				// Browser blocked playback — silently fail
			});
		} else {
			audio.pause();
		}

		return () => {
			// Cleanup on unmount
		};
	}, [theme, muted, hasInteracted]);

	// Cleanup audio element on unmount
	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.src = "";
				audioRef.current = null;
			}
		};
	}, []);

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
		} else {
			setMuted((prev) => !prev);
		}
	}, [hasInteracted]);

	const isMuted = !hasInteracted || muted;

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={isMuted ? "Unmute ambient audio" : "Mute ambient audio"}
			title={isMuted ? "Unmute ambient audio" : "Mute ambient audio"}
			className={`ambient-audio-toggle ${theme === "dark" ? "ambient-audio-dark" : "ambient-audio-light"}`}
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

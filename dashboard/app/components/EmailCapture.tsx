"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "../../lib/analytics";

declare global {
	interface Window {
		turnstile?: {
			render: (
				el: HTMLElement,
				opts: { sitekey: string; callback: (token: string) => void },
			) => string;
			reset: (widgetId: string) => void;
		};
	}
}

type Status = "idle" | "submitting" | "success" | "error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export interface EmailCaptureProps {
	track: "light" | "dark";
	heading?: string;
	subheading?: string | null;
	inputPlaceholder?: string;
	buttonText?: string;
	successTitle?: string;
	successMessage?: string;
}

export function EmailCapture({
	track,
	heading,
	subheading: _subheading,
	inputPlaceholder,
	buttonText,
	successTitle,
	successMessage,
}: EmailCaptureProps) {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<Status>("idle");
	const [errorMsg, setErrorMsg] = useState("");
	const [cfToken, setCfToken] = useState("");
	const turnstileRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<string | null>(null);

	const isLight = track === "light";

	// Explicitly render Turnstile widget after component mounts
	useEffect(() => {
		if (!SITE_KEY || !turnstileRef.current) return;

		const renderWidget = () => {
			if (!window.turnstile || !turnstileRef.current || widgetIdRef.current) return;
			widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
				sitekey: SITE_KEY,
				callback: (token: string) => setCfToken(token),
			});
		};

		// Script may already be loaded
		if (window.turnstile) {
			renderWidget();
		} else {
			// Wait for script to load
			const interval = setInterval(() => {
				if (window.turnstile) {
					clearInterval(interval);
					renderWidget();
				}
			}, 200);
			return () => clearInterval(interval);
		}
	}, []);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();

			const trimmed = email.trim();
			if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
				setErrorMsg("Please enter a valid email address.");
				setStatus("error");
				return;
			}

			setStatus("submitting");
			setErrorMsg("");
			trackEvent({ event: "cta_click", category: "conversion", label: track });

			try {
				// Read honeypot value
				const form = e.target as HTMLFormElement;
				const honeypot = form.querySelector<HTMLInputElement>("[name='website']")?.value || "";

				const res = await fetch("/api/subscribe", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: trimmed,
						track,
						cfToken,
						honeypot,
						timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
						locale: navigator.language,
						screenWidth: screen.width,
						screenHeight: screen.height,
					}),
				});

				if (!res.ok) {
					const data = await res.json().catch(() => ({}));
					if (data.error === "rate_limit_exceeded") {
						setErrorMsg("Too many attempts. Please try again later.");
					} else if (data.error === "invalid_email") {
						setErrorMsg("Please enter a valid email address.");
					} else if (data.error === "captcha_failed") {
						setErrorMsg("CAPTCHA verification failed. Please try again.");
					} else {
						setErrorMsg("Something went wrong. Please try again.");
					}
					setStatus("error");
					return;
				}

				setStatus("success");
			} catch {
				setErrorMsg("Connection error. Please try again.");
				setStatus("error");
			}
		},
		[email, track, cfToken],
	);

	if (status === "success") {
		return (
			<div
				className={`rounded-xl p-8 text-center ${
					isLight
						? "bg-[var(--ethereal-blue,#E0F7FA)] text-[var(--deep-navy,#102027)]"
						: "border border-[var(--accent)] bg-[#111] text-[var(--accent)]"
				}`}
			>
				<p className="text-lg font-bold">
					{successTitle ?? (isLight ? "Welcome to the Garden." : "Endpoint registered.")}
				</p>
				<p className="mt-2 text-sm opacity-70">
					{successMessage ??
						(isLight ? "The harmony grows stronger." : "Your signal has been received.")}
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="mx-auto max-w-md">
			<p
				className={`mb-4 text-sm uppercase tracking-widest ${
					isLight ? "text-[var(--accent)]" : "text-[var(--accent)]"
				}`}
			>
				{heading ?? (isLight ? "Join the Symbiotic Standard" : "Initialize your Protocol")}
			</p>
			{/* Honeypot — hidden from humans, bots auto-fill it */}
			<input
				type="text"
				name="website"
				autoComplete="off"
				tabIndex={-1}
				aria-hidden="true"
				style={{ position: "absolute", left: "-9999px", opacity: 0 }}
			/>
			{/* Turnstile widget — rendered explicitly via useEffect */}
			<div ref={turnstileRef} className="mb-4" />
			<div className="flex gap-3">
				<input
					type="email"
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
						if (status === "error") setStatus("idle");
					}}
					placeholder={
						inputPlaceholder ?? (isLight ? "Join the garden..." : "Submit your endpoint...")
					}
					className={`flex-1 rounded-full px-5 py-3 text-sm outline-none transition-colors ${
						isLight
							? "border border-[var(--accent)] bg-white text-[var(--deep-navy,#102027)] placeholder:text-gray-400"
							: "border border-[var(--accent)] bg-[#111] text-[var(--accent)] placeholder:text-[var(--accent)]/40"
					}`}
					disabled={status === "submitting"}
				/>
				<button
					type="submit"
					disabled={status === "submitting"}
					className={`rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 ${
						isLight ? "bg-[var(--accent)] text-white" : "bg-[var(--accent)] text-black"
					}`}
				>
					{status === "submitting" ? "..." : (buttonText ?? (isLight ? "Join" : "Init"))}
				</button>
			</div>
			{status === "error" && <p className="mt-3 text-sm text-red-500">{errorMsg}</p>}
		</form>
	);
}

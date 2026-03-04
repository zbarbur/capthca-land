"use client";

import { useCallback, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailCapture({ track }: { track: "light" | "dark" }) {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<Status>("idle");
	const [errorMsg, setErrorMsg] = useState("");

	const isLight = track === "light";

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

			try {
				// Read Turnstile token (auto-injected by the widget)
				const form = e.target as HTMLFormElement;
				const cfToken =
					form.querySelector<HTMLInputElement>("[name='cf-turnstile-response']")?.value || "";

				// Read honeypot value
				const honeypot = form.querySelector<HTMLInputElement>("[name='website']")?.value || "";

				const res = await fetch("/api/subscribe", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email: trimmed, track, cfToken, honeypot }),
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
		[email, track],
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
					{isLight ? "Welcome to the Garden." : "Endpoint registered."}
				</p>
				<p className="mt-2 text-sm opacity-70">
					{isLight ? "The harmony grows stronger." : "Your signal has been received."}
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
				{isLight ? "Join the Symbiotic Standard" : "Initialize your Protocol"}
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
			{/* Turnstile widget */}
			<div
				className="cf-turnstile mb-4"
				data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
			/>
			<div className="flex gap-3">
				<input
					type="email"
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
						if (status === "error") setStatus("idle");
					}}
					placeholder={isLight ? "Join the garden..." : "Submit your endpoint..."}
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
					{status === "submitting" ? "..." : isLight ? "Join" : "Init"}
				</button>
			</div>
			{status === "error" && <p className="mt-3 text-sm text-red-500">{errorMsg}</p>}
		</form>
	);
}

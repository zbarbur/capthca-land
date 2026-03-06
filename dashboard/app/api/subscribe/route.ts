import { NextResponse } from "next/server";
import { db } from "@/lib/firestore";
import { createSecretProvider } from "@/lib/secrets";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TRACKS = ["light", "dark"] as const;

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const entry = rateLimitMap.get(ip);

	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		return false;
	}

	entry.count++;
	return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
	// Body size limit — reject oversized payloads before parsing
	const contentLength = request.headers.get("content-length");
	if (contentLength && Number.parseInt(contentLength, 10) > 4096) {
		return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
	}

	// Rate limiting — use last x-forwarded-for entry (Cloud Run appends real client IP)
	const forwarded = request.headers.get("x-forwarded-for");
	const forwardedParts = forwarded
		?.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	const ip = forwardedParts?.at(-1) || "unknown";

	if (isRateLimited(ip)) {
		return NextResponse.json({ error: "rate_limit_exceeded" }, { status: 429 });
	}

	// Parse body
	let body: { email?: string; track?: string; honeypot?: string; cfToken?: string };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid_json" }, { status: 400 });
	}

	// Honeypot check — bots auto-fill hidden fields
	if (body.honeypot) {
		return NextResponse.json({ error: "invalid_request" }, { status: 400 });
	}

	// Turnstile verification (skip if secret not configured — local dev)
	let turnstileSecret: string | undefined;
	try {
		turnstileSecret = await createSecretProvider().getSecret("turnstile-secret-key");
	} catch {
		// Secret not configured — skip Turnstile verification (local dev)
	}
	if (turnstileSecret) {
		const cfToken = body.cfToken || "";
		const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				secret: turnstileSecret,
				response: cfToken,
				remoteip: ip,
			}),
		});
		const verifyData = (await verifyRes.json()) as { success: boolean };
		if (!verifyData.success) {
			return NextResponse.json({ error: "captcha_failed" }, { status: 400 });
		}
	}

	// Validate email
	const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
	if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
		return NextResponse.json({ error: "invalid_email" }, { status: 400 });
	}

	// Validate track
	const track = body.track as string;
	if (!VALID_TRACKS.includes(track as (typeof VALID_TRACKS)[number])) {
		return NextResponse.json({ error: "invalid_track" }, { status: 400 });
	}

	// Upsert to Firestore
	try {
		const docRef = db.collection("subscribers").doc(email);
		await docRef.set(
			{
				email,
				track,
				subscribedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			{ merge: true },
		);

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Firestore write error:", err);
		return NextResponse.json({ error: "server_error" }, { status: 500 });
	}
}

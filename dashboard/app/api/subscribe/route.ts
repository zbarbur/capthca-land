import { NextResponse } from "next/server";
import { db } from "@/lib/firestore";

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
	// Rate limiting
	const forwarded = request.headers.get("x-forwarded-for");
	const ip = forwarded?.split(",")[0]?.trim() || "unknown";

	if (isRateLimited(ip)) {
		return NextResponse.json({ error: "rate_limit_exceeded" }, { status: 429 });
	}

	// Parse body
	let body: { email?: string; track?: string };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid_json" }, { status: 400 });
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

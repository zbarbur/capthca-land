import { NextResponse } from "next/server";
import { db } from "@/lib/firestore";
import { logger } from "@/lib/logger";

const VERSION = "0.1.0";

export async function GET() {
	const start = Date.now();

	try {
		// Attempt a lightweight Firestore read to verify connectivity.
		// The db proxy auto-prefixes collection names; we just need any read
		// to confirm the backend is reachable (or the memory store is working).
		const col = db.collection("_health");
		await col.doc("ping").set({ ts: new Date().toISOString() });

		const responseTimeMs = Date.now() - start;

		logger.info("Health check passed", {
			firestore: "connected",
			responseTimeMs,
		});

		return NextResponse.json({
			status: "ok",
			firestore: "connected",
			version: VERSION,
			responseTimeMs,
		});
	} catch (err) {
		const responseTimeMs = Date.now() - start;
		const message = err instanceof Error ? err.message : String(err);

		logger.error("Health check failed", {
			firestore: "error",
			message,
			responseTimeMs,
		});

		return NextResponse.json(
			{
				status: "degraded",
				firestore: "error",
				message,
				responseTimeMs,
			},
			{ status: 503 },
		);
	}
}

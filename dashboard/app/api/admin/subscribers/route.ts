import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import type { DocSnapshot } from "@/lib/firestore";
import { db } from "@/lib/firestore";

const TEST_EMAIL_PATTERNS = [/^test[@+]/i, /test\.com$/i, /@example\./i, /@test\./i, /\+test/i];

function isTestEmail(email: string): boolean {
	return TEST_EMAIL_PATTERNS.some((pattern) => pattern.test(email));
}

export async function DELETE(request: Request) {
	// Verify write role
	const user = getAdminUser(request);
	if (!user || user.role !== "write") {
		return NextResponse.json({ error: "forbidden" }, { status: 403 });
	}

	let body: { id?: string; pattern?: string };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid_json" }, { status: 400 });
	}

	// Single delete by ID
	if (body.id && typeof body.id === "string") {
		try {
			await db.collection("subscribers").doc(body.id).delete();
			return NextResponse.json({ success: true, deleted: 1 });
		} catch (err) {
			return NextResponse.json(
				{ error: "delete_failed", detail: err instanceof Error ? err.message : String(err) },
				{ status: 500 },
			);
		}
	}

	// Bulk delete test records
	if (body.pattern === "test") {
		try {
			const snapshot = await db.collection("subscribers").get();
			const testDocs = snapshot.docs.filter((doc: DocSnapshot) => {
				const email = doc.data().email as string;
				return isTestEmail(email);
			});

			let deleted = 0;
			for (const doc of testDocs) {
				await db.collection("subscribers").doc(doc.id).delete();
				deleted++;
			}

			return NextResponse.json({ success: true, deleted });
		} catch (err) {
			return NextResponse.json(
				{ error: "bulk_delete_failed", detail: err instanceof Error ? err.message : String(err) },
				{ status: 500 },
			);
		}
	}

	return NextResponse.json({ error: "invalid_request" }, { status: 400 });
}

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ---------- Collection prefix (duplicated from dashboard/lib/firestore.ts) ----------

function getCollectionPrefix(): string {
	const env = process.env.CAPTHCA_LAND_ENV || "local";
	switch (env) {
		case "prd":
			return "prd_";
		case "stg":
			return "stg_";
		default:
			return "local_";
	}
}

// ---------- Firestore init ----------

function initFirestore() {
	if (getApps().length > 0) {
		return getFirestore(getApps()[0]);
	}

	if (process.env.FIRESTORE_EMULATOR_HOST) {
		return getFirestore(initializeApp({ projectId: "capthca-local" }));
	}

	const options: Record<string, unknown> = {
		projectId: process.env.GOOGLE_CLOUD_PROJECT || "capthca-489205",
	};
	if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
		options.credential = cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
	}
	return getFirestore(initializeApp(options));
}

// ---------- Helpers ----------

function usage(): never {
	console.error(`Usage: npx tsx scripts/subscribers.ts <command> [args]
  list                   — List all subscribers (email, track, date)
  count                  — Show count per track
  export                 — Export CSV to stdout (email,track,created_at,timezone,locale,deviceType,country)
  delete <email> --confirm — Delete a subscriber`);
	process.exit(1);
}

// ---------- Commands ----------

async function list() {
	const db = initFirestore();
	const prefix = getCollectionPrefix();
	const snapshot = await db.collection(`${prefix}subscribers`).get();

	if (snapshot.empty) {
		console.log("No subscribers found.");
		return;
	}

	console.log(`${"EMAIL".padEnd(40)} ${"TRACK".padEnd(10)} CREATED`);
	console.log("-".repeat(70));

	for (const doc of snapshot.docs) {
		const data = doc.data();
		const email = (data.email as string) || doc.id;
		const track = (data.track as string) || "—";
		const created = data.created_at
			? new Date(
					(data.created_at as { _seconds: number })._seconds
						? (data.created_at as { _seconds: number })._seconds * 1000
						: (data.created_at as string | number),
				).toISOString()
			: "—";
		console.log(`${email.padEnd(40)} ${track.padEnd(10)} ${created}`);
	}

	console.log(`\nTotal: ${snapshot.size}`);
}

async function count() {
	const db = initFirestore();
	const prefix = getCollectionPrefix();
	const snapshot = await db.collection(`${prefix}subscribers`).get();

	const counts: Record<string, number> = {};
	for (const doc of snapshot.docs) {
		const track = (doc.data().track as string) || "unknown";
		counts[track] = (counts[track] || 0) + 1;
	}

	console.log("Subscriber counts by track:");
	for (const [track, n] of Object.entries(counts).sort()) {
		console.log(`  ${track}: ${n}`);
	}
	console.log(`  TOTAL: ${snapshot.size}`);
}

async function exportCsv() {
	const db = initFirestore();
	const prefix = getCollectionPrefix();
	const snapshot = await db.collection(`${prefix}subscribers`).get();

	const header = "email,track,created_at,timezone,locale,deviceType,country";
	process.stdout.write(`${header}\n`);

	for (const doc of snapshot.docs) {
		const d = doc.data();
		const email = (d.email as string) || doc.id;
		const track = (d.track as string) || "";
		const created = d.created_at
			? new Date(
					(d.created_at as { _seconds: number })._seconds
						? (d.created_at as { _seconds: number })._seconds * 1000
						: (d.created_at as string | number),
				).toISOString()
			: "";
		const timezone = (d.timezone as string) || "";
		const locale = (d.locale as string) || "";
		const deviceType = (d.deviceType as string) || "";
		const country = (d.country as string) || "";

		// Escape fields that may contain commas
		const csvEscape = (s: string) =>
			s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;

		const row = [email, track, created, timezone, locale, deviceType, country]
			.map(csvEscape)
			.join(",");
		process.stdout.write(`${row}\n`);
	}
}

async function deleteSubscriber(email: string, confirm: boolean) {
	if (!email) {
		console.error("Error: email argument is required for delete command.");
		usage();
	}

	if (!confirm) {
		console.error("Error: --confirm flag is required to delete a subscriber.");
		console.error(`Usage: npx tsx scripts/subscribers.ts delete ${email} --confirm`);
		process.exit(1);
	}

	const db = initFirestore();
	const prefix = getCollectionPrefix();
	const collection = db.collection(`${prefix}subscribers`);

	// Try by document ID first, then query by email field
	const docRef = collection.doc(email);
	const docSnap = await docRef.get();

	if (docSnap.exists) {
		await docRef.delete();
		console.log(`Deleted subscriber: ${email}`);
		return;
	}

	// Fallback: query by email field
	const query = await collection.where("email", "==", email).get();
	if (query.empty) {
		console.error(`Subscriber not found: ${email}`);
		process.exit(1);
	}

	for (const doc of query.docs) {
		await doc.ref.delete();
		console.log(`Deleted subscriber: ${email} (doc: ${doc.id})`);
	}
}

// ---------- Main ----------

async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	if (!command) {
		usage();
	}

	switch (command) {
		case "list":
			await list();
			break;
		case "count":
			await count();
			break;
		case "export":
			await exportCsv();
			break;
		case "delete":
			await deleteSubscriber(args[1], args.includes("--confirm"));
			break;
		default:
			console.error(`Unknown command: ${command}`);
			usage();
	}
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});

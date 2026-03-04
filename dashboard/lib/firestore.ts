import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getApp() {
	if (getApps().length > 0) {
		return getApps()[0];
	}

	// When FIRESTORE_EMULATOR_HOST is set, credentials are not required
	if (process.env.FIRESTORE_EMULATOR_HOST) {
		return initializeApp({ projectId: "capthca-local" });
	}

	// Production: use default credentials (Cloud Run service account)
	return initializeApp({
		credential: process.env.GOOGLE_APPLICATION_CREDENTIALS
			? cert(process.env.GOOGLE_APPLICATION_CREDENTIALS)
			: undefined,
		projectId: process.env.GOOGLE_CLOUD_PROJECT || "capthca-land",
	});
}

export const db = getFirestore(getApp());

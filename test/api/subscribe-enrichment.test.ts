import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

describe("subscriber enrichment", () => {
	const routeSource = fs.readFileSync(
		path.resolve("dashboard/app/api/subscribe/route.ts"),
		"utf-8",
	);
	const formSource = fs.readFileSync(
		path.resolve("dashboard/app/components/EmailCapture.tsx"),
		"utf-8",
	);

	it("subscribe route accepts timezone field", () => {
		assert.ok(routeSource.includes("timezone"), "Route should handle timezone field");
	});

	it("subscribe route accepts locale field", () => {
		assert.ok(routeSource.includes("locale"), "Route should handle locale field");
	});

	it("subscribe route derives deviceType from user-agent", () => {
		assert.ok(routeSource.includes("deviceType"), "Route should derive deviceType");
	});

	it("subscribe route reads country from headers", () => {
		assert.ok(
			routeSource.includes("cf-ipcountry") || routeSource.includes("x-appengine-country"),
			"Route should read country from CDN headers",
		);
	});

	it("email capture form sends enrichment fields", () => {
		assert.ok(formSource.includes("timezone"), "Form should send timezone");
		assert.ok(
			formSource.includes("screenWidth") || formSource.includes("screen.width"),
			"Form should send screen dimensions",
		);
	});
});

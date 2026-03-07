import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

describe("social sharing cards", () => {
	const darkPage = fs.readFileSync(path.resolve("dashboard/app/dark/page.tsx"), "utf-8");
	const lightPage = fs.readFileSync(path.resolve("dashboard/app/light/page.tsx"), "utf-8");
	const innerPage = fs.readFileSync(path.resolve("dashboard/app/[track]/[slug]/page.tsx"), "utf-8");

	it("dark landing page has openGraph metadata", () => {
		assert.ok(darkPage.includes("openGraph"), "Dark page should have openGraph metadata");
	});

	it("light landing page has openGraph metadata", () => {
		assert.ok(lightPage.includes("openGraph"), "Light page should have openGraph metadata");
	});

	it("inner pages have openGraph in generateMetadata", () => {
		assert.ok(innerPage.includes("openGraph"), "Inner pages should have openGraph metadata");
	});

	it("inner pages have twitter card metadata", () => {
		assert.ok(innerPage.includes("twitter"), "Inner pages should have twitter card metadata");
	});

	it("dark page uses track-specific OG image", () => {
		assert.ok(darkPage.includes("dark-hero"), "Dark page should use dark track OG image");
	});
});

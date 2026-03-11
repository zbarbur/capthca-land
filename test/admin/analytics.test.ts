import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const DASHBOARD_DIR = path.join(process.cwd(), "dashboard");

describe("admin: ga4-reporting helper", () => {
	const helperPath = path.join(DASHBOARD_DIR, "lib", "ga4-reporting.ts");

	it("ga4-reporting.ts file exists", () => {
		assert.ok(fs.existsSync(helperPath), "ga4-reporting.ts must exist in dashboard/lib/");
	});

	it("ga4-reporting exports fetchGA4Metrics function", () => {
		const src = fs.readFileSync(helperPath, "utf-8");
		assert.ok(
			src.includes("export async function fetchGA4Metrics"),
			"ga4-reporting.ts must export fetchGA4Metrics",
		);
	});

	it("ga4-reporting imports @google-analytics/data", () => {
		const src = fs.readFileSync(helperPath, "utf-8");
		assert.ok(
			src.includes("@google-analytics/data"),
			"ga4-reporting.ts must import @google-analytics/data SDK",
		);
	});

	it("ga4-reporting propagates errors for caller to handle", () => {
		const src = fs.readFileSync(helperPath, "utf-8");
		assert.ok(
			src.includes("catch") && src.includes("throw"),
			"ga4-reporting must catch and re-throw errors for the API route to handle",
		);
	});

	it("ga4-reporting exports GA4Metrics type", () => {
		const src = fs.readFileSync(helperPath, "utf-8");
		assert.ok(
			src.includes("export interface GA4Metrics"),
			"ga4-reporting must export GA4Metrics interface",
		);
	});
});

describe("admin: analytics API route", () => {
	const routePath = path.join(DASHBOARD_DIR, "app", "api", "admin", "analytics", "route.ts");

	it("analytics API route file exists", () => {
		assert.ok(
			fs.existsSync(routePath),
			"analytics API route must exist at api/admin/analytics/route.ts",
		);
	});

	it("analytics API route imports getAdminUser for auth", () => {
		const src = fs.readFileSync(routePath, "utf-8");
		assert.ok(src.includes("getAdminUser"), "analytics API route must import getAdminUser");
	});

	it("analytics API route returns 403 for unauthorized access", () => {
		const src = fs.readFileSync(routePath, "utf-8");
		assert.ok(src.includes("403"), "analytics API route must return 403 for unauthorized users");
	});

	it("analytics API route accepts dateRange query param", () => {
		const src = fs.readFileSync(routePath, "utf-8");
		assert.ok(src.includes("dateRange"), "analytics API route must accept dateRange param");
	});
});

describe("admin: analytics page", () => {
	const pagePath = path.join(DASHBOARD_DIR, "app", "admin", "analytics", "page.tsx");

	it("analytics page file exists", () => {
		assert.ok(fs.existsSync(pagePath), "analytics page must exist at (admin)/analytics/page.tsx");
	});

	it("analytics page imports AnalyticsView component", () => {
		const src = fs.readFileSync(pagePath, "utf-8");
		assert.ok(src.includes("AnalyticsView"), "analytics page must use AnalyticsView component");
	});

	it("analytics page has heading", () => {
		const src = fs.readFileSync(pagePath, "utf-8");
		assert.ok(src.includes("Analytics"), "analytics page must have Analytics heading");
	});
});

describe("admin: AnalyticsView client component", () => {
	const viewPath = path.join(DASHBOARD_DIR, "app", "admin", "analytics", "AnalyticsView.tsx");

	it("AnalyticsView file exists", () => {
		assert.ok(fs.existsSync(viewPath), "AnalyticsView.tsx must exist");
	});

	it("AnalyticsView is a client component", () => {
		const src = fs.readFileSync(viewPath, "utf-8");
		assert.ok(src.includes('"use client"'), "AnalyticsView must have 'use client' directive");
	});

	it("AnalyticsView has date range selector with all options", () => {
		const src = fs.readFileSync(viewPath, "utf-8");
		assert.ok(src.includes("date-range-selector"), "AnalyticsView must have date range selector");
		assert.ok(src.includes('"7d"'), "AnalyticsView must include 7d option");
		assert.ok(src.includes('"30d"'), "AnalyticsView must include 30d option");
		assert.ok(src.includes('"90d"'), "AnalyticsView must include 90d option");
	});

	it("AnalyticsView displays stat cards", () => {
		const src = fs.readFileSync(viewPath, "utf-8");
		assert.ok(src.includes("Active Users"), "AnalyticsView must show Active Users stat");
		assert.ok(src.includes("Page Views"), "AnalyticsView must show Page Views stat");
		assert.ok(src.includes("Avg Engagement"), "AnalyticsView must show Avg Engagement stat");
		assert.ok(src.includes("New vs Returning"), "AnalyticsView must show New vs Returning stat");
	});

	it("AnalyticsView has Top Pages table", () => {
		const src = fs.readFileSync(viewPath, "utf-8");
		assert.ok(src.includes("Top Pages"), "AnalyticsView must have Top Pages section");
		assert.ok(src.includes("<table"), "AnalyticsView must render a table for top pages");
	});

	it("AnalyticsView has Page View Trend chart using Recharts", () => {
		const src = fs.readFileSync(viewPath, "utf-8");
		assert.ok(src.includes("Page View Trend"), "AnalyticsView must have Page View Trend section");
		assert.ok(src.includes("BarChart"), "AnalyticsView must use Recharts BarChart");
		assert.ok(src.includes("recharts"), "AnalyticsView must import from recharts");
	});

	it("AnalyticsView shows empty state with user-friendly message", () => {
		const src = fs.readFileSync(viewPath, "utf-8");
		assert.ok(
			src.includes("unavailable"),
			"AnalyticsView must show user-friendly empty state message",
		);
		assert.ok(
			!src.includes("CAPTHCA_LAND_"),
			"AnalyticsView must not expose internal env var names",
		);
	});
});

describe("admin: layout includes Analytics nav item", () => {
	const layoutPath = path.join(DASHBOARD_DIR, "app", "admin", "layout.tsx");

	it("layout has Analytics in NAV_ITEMS", () => {
		const src = fs.readFileSync(layoutPath, "utf-8");
		assert.ok(src.includes('"Analytics"'), "Layout must include Analytics label in nav");
		assert.ok(src.includes("/admin/analytics"), "Layout must include /admin/analytics href in nav");
	});
});

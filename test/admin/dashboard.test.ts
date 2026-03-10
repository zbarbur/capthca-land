import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const DASHBOARD_DIR = path.join(process.cwd(), "dashboard");

const { maskIp } = await import(path.join(DASHBOARD_DIR, "lib", "firestore.ts"));

describe("admin: DbLike interface extensions", () => {
	const firestoreSrc = fs.readFileSync(path.join(DASHBOARD_DIR, "lib", "firestore.ts"), "utf-8");

	it("exports DocSnapshot interface", () => {
		assert.ok(
			firestoreSrc.includes("export interface DocSnapshot"),
			"firestore.ts must export DocSnapshot interface",
		);
	});

	it("exports QuerySnapshot interface", () => {
		assert.ok(
			firestoreSrc.includes("export interface QuerySnapshot"),
			"firestore.ts must export QuerySnapshot interface",
		);
	});

	it("exports QueryRef interface with get/where/orderBy/limit methods", () => {
		assert.ok(
			firestoreSrc.includes("export interface QueryRef"),
			"firestore.ts must export QueryRef interface",
		);
		assert.ok(firestoreSrc.includes("get(): Promise<QuerySnapshot>"), "QueryRef must have get()");
		assert.ok(firestoreSrc.includes("limit(n: number): QueryRef"), "QueryRef must have limit()");
		assert.ok(
			firestoreSrc.includes('orderBy(field: string, direction?: "asc" | "desc"): QueryRef'),
			"QueryRef must have orderBy()",
		);
		assert.ok(
			firestoreSrc.includes("where(field: string, op: string, value: unknown): QueryRef"),
			"QueryRef must have where()",
		);
	});

	it("DocRef has delete method", () => {
		assert.ok(firestoreSrc.includes("delete(): Promise<unknown>"), "DocRef must have delete()");
	});

	it("CollectionRef extends QueryRef", () => {
		assert.ok(
			firestoreSrc.includes("export interface CollectionRef extends QueryRef"),
			"CollectionRef must extend QueryRef",
		);
	});

	it("exports maskIp function", () => {
		assert.ok(
			firestoreSrc.includes("export function maskIp"),
			"firestore.ts must export maskIp function",
		);
	});
});

describe("admin: maskIp function", () => {
	it("masks last octet of IPv4 address", () => {
		assert.equal(maskIp("192.168.1.100"), "192.168.1.xxx");
	});

	it("masks last octet of different IPv4", () => {
		assert.equal(maskIp("10.0.0.1"), "10.0.0.xxx");
	});

	it("returns 'unknown' for empty string", () => {
		assert.equal(maskIp(""), "unknown");
	});

	it("masks last group of IPv6 address", () => {
		const result = maskIp("2001:db8::1");
		assert.ok(result.endsWith("xxxx"), "IPv6 last group should be masked");
	});
});

describe("admin: layout", () => {
	const layoutSrc = fs.readFileSync(
		path.join(DASHBOARD_DIR, "app", "admin", "layout.tsx"),
		"utf-8",
	);

	it("layout file exists and imports getAdminUser helpers", () => {
		assert.ok(
			layoutSrc.includes("parseAdminUsers") && layoutSrc.includes("parseIapEmail"),
			"admin layout must import admin auth helpers",
		);
	});

	it("layout reads x-admin-context header", () => {
		assert.ok(
			layoutSrc.includes("x-admin-context"),
			"admin layout must check x-admin-context header",
		);
	});

	it("layout reads x-admin-email header", () => {
		assert.ok(layoutSrc.includes("x-admin-email"), "admin layout must read x-admin-email header");
	});

	it("layout shows Access Denied for unauthorized users", () => {
		assert.ok(layoutSrc.includes("Access Denied"), "admin layout must show Access Denied message");
	});

	it("layout has sidebar with Dashboard, Subscribers, Logs links", () => {
		assert.ok(layoutSrc.includes("/dashboard"), "layout must link to /dashboard");
		assert.ok(layoutSrc.includes("/subscribers"), "layout must link to /subscribers");
		assert.ok(layoutSrc.includes("/logs"), "layout must link to /logs");
	});

	it("layout has mobile navigation", () => {
		assert.ok(layoutSrc.includes("md:hidden"), "layout must have mobile-specific navigation");
	});

	it("layout passes admin role to content area", () => {
		assert.ok(layoutSrc.includes("data-admin-role"), "layout must pass admin role to content area");
	});
});

describe("admin: dashboard page", () => {
	const dashboardSrc = fs.readFileSync(
		path.join(DASHBOARD_DIR, "app", "admin", "dashboard", "page.tsx"),
		"utf-8",
	);

	it("dashboard page queries Firestore subscribers collection", () => {
		assert.ok(
			dashboardSrc.includes('db.collection("subscribers")'),
			"dashboard must query subscribers collection",
		);
	});

	it("dashboard page calculates light and dark counts", () => {
		assert.ok(
			dashboardSrc.includes('"light"') && dashboardSrc.includes('"dark"'),
			"dashboard must filter by track",
		);
	});

	it("dashboard page shows last 7 and 30 day counts", () => {
		assert.ok(
			dashboardSrc.includes("Last 7 Days") && dashboardSrc.includes("Last 30 Days"),
			"dashboard must show recent signup counts",
		);
	});

	it("dashboard page uses TrackDistributionChart (Recharts)", () => {
		assert.ok(
			dashboardSrc.includes("TrackDistributionChart"),
			"dashboard must use TrackDistributionChart component",
		);
	});
});

describe("admin: TrackDistributionChart", () => {
	const chartSrc = fs.readFileSync(
		path.join(DASHBOARD_DIR, "app", "admin", "dashboard", "TrackDistributionChart.tsx"),
		"utf-8",
	);

	it("chart is a client component using Recharts", () => {
		assert.ok(chartSrc.includes('"use client"'), "chart must be a client component");
		assert.ok(chartSrc.includes('from "recharts"'), "chart must import from recharts");
	});

	it("chart uses PieChart", () => {
		assert.ok(chartSrc.includes("PieChart"), "chart must use PieChart");
	});
});

describe("admin: subscribers page", () => {
	const subscribersSrc = fs.readFileSync(
		path.join(DASHBOARD_DIR, "app", "admin", "subscribers", "page.tsx"),
		"utf-8",
	);

	it("subscribers page has pagination", () => {
		assert.ok(
			subscribersSrc.includes("PAGE_SIZE") && subscribersSrc.includes("totalPages"),
			"subscribers page must implement pagination",
		);
	});

	it("subscribers page has email search", () => {
		assert.ok(
			subscribersSrc.includes("Search by email"),
			"subscribers page must have email search",
		);
	});

	it("subscribers page has track filter", () => {
		assert.ok(
			subscribersSrc.includes("All Tracks"),
			"subscribers page must have track filter dropdown",
		);
	});

	it("subscribers page masks IP addresses", () => {
		assert.ok(subscribersSrc.includes("maskIp"), "subscribers page must use maskIp to mask IPs");
	});

	it("subscribers page shows delete button only for writers", () => {
		assert.ok(
			subscribersSrc.includes("isWriter"),
			"subscribers page must check write role for delete actions",
		);
	});

	it("subscribers page uses SubscriberActions component", () => {
		assert.ok(
			subscribersSrc.includes("SubscriberActions"),
			"subscribers page must use SubscriberActions client component",
		);
	});
});

describe("admin: delete API endpoint", () => {
	const deleteSrc = fs.readFileSync(
		path.join(DASHBOARD_DIR, "app", "api", "admin", "subscribers", "route.ts"),
		"utf-8",
	);

	it("delete endpoint validates write role", () => {
		assert.ok(
			deleteSrc.includes("getAdminUser") && deleteSrc.includes('"write"'),
			"delete endpoint must verify write role",
		);
	});

	it("delete endpoint returns 403 for non-writers", () => {
		assert.ok(deleteSrc.includes("403"), "delete endpoint must return 403 for unauthorized users");
	});

	it("delete endpoint supports single delete by id", () => {
		assert.ok(deleteSrc.includes("body.id"), "delete endpoint must support single delete by id");
	});

	it("delete endpoint supports bulk test record removal", () => {
		assert.ok(
			deleteSrc.includes('"test"') && deleteSrc.includes("isTestEmail"),
			"delete endpoint must support bulk test record removal",
		);
	});

	it("delete endpoint has test email patterns", () => {
		assert.ok(
			deleteSrc.includes("TEST_EMAIL_PATTERNS"),
			"delete endpoint must define test email patterns",
		);
	});
});

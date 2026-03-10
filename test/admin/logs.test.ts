import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const DASHBOARD_DIR = path.join(process.cwd(), "dashboard");

describe("admin: logs page", () => {
	const logsPagePath = path.join(DASHBOARD_DIR, "app", "admin", "logs", "page.tsx");

	it("logs page file exists", () => {
		assert.ok(fs.existsSync(logsPagePath), "logs page must exist at (admin)/logs/page.tsx");
	});

	it("logs page imports LogViewer component", () => {
		const src = fs.readFileSync(logsPagePath, "utf-8");
		assert.ok(src.includes("LogViewer"), "logs page must use LogViewer component");
	});
});

describe("admin: LogViewer client component", () => {
	const logViewerPath = path.join(DASHBOARD_DIR, "app", "admin", "logs", "LogViewer.tsx");

	it("LogViewer file exists", () => {
		assert.ok(fs.existsSync(logViewerPath), "LogViewer.tsx must exist");
	});

	it("LogViewer is a client component", () => {
		const src = fs.readFileSync(logViewerPath, "utf-8");
		assert.ok(src.includes('"use client"'), "LogViewer must have 'use client' directive");
	});

	it("LogViewer has severity filter dropdown", () => {
		const src = fs.readFileSync(logViewerPath, "utf-8");
		assert.ok(
			src.includes("severity-filter") || src.includes("Severity"),
			"LogViewer must have severity filter control",
		);
		assert.ok(src.includes('"INFO"'), "LogViewer must include INFO severity option");
		assert.ok(src.includes('"WARNING"'), "LogViewer must include WARNING severity option");
		assert.ok(src.includes('"ERROR"'), "LogViewer must include ERROR severity option");
	});

	it("LogViewer has type filter dropdown", () => {
		const src = fs.readFileSync(logViewerPath, "utf-8");
		assert.ok(
			src.includes("type-filter") || src.includes('"analytics"'),
			"LogViewer must have type filter control",
		);
		assert.ok(src.includes('"subscribe"'), "LogViewer must include subscribe type option");
		assert.ok(src.includes('"health"'), "LogViewer must include health type option");
	});

	it("LogViewer has refresh button", () => {
		const src = fs.readFileSync(logViewerPath, "utf-8");
		assert.ok(src.includes("Refresh"), "LogViewer must have a Refresh button");
		assert.ok(
			src.includes("refresh-button") || src.includes("handleRefresh"),
			"LogViewer must have refresh functionality",
		);
	});

	it("LogViewer has load more pagination", () => {
		const src = fs.readFileSync(logViewerPath, "utf-8");
		assert.ok(src.includes("Load More"), "LogViewer must have Load More button");
		assert.ok(
			src.includes("nextPageToken") || src.includes("pageToken"),
			"LogViewer must support pagination via page tokens",
		);
	});

	it("LogViewer uses correct severity color coding", () => {
		const src = fs.readFileSync(logViewerPath, "utf-8");
		assert.ok(src.includes("zinc") && src.includes("INFO"), "INFO severity must use zinc styling");
		assert.ok(
			src.includes("amber") && src.includes("WARNING"),
			"WARNING severity must use amber styling",
		);
		assert.ok(src.includes("red") && src.includes("ERROR"), "ERROR severity must use red styling");
	});

	it("LogViewer supports expandable error details", () => {
		const src = fs.readFileSync(logViewerPath, "utf-8");
		assert.ok(src.includes("stackTrace"), "LogViewer must display stack traces for errors");
		assert.ok(
			src.includes("expandedIds") || src.includes("isExpanded"),
			"LogViewer must support expandable entries",
		);
	});
});

describe("admin: logs API route", () => {
	const routePath = path.join(DASHBOARD_DIR, "app", "api", "admin", "logs", "route.ts");

	it("logs API route file exists", () => {
		assert.ok(fs.existsSync(routePath), "logs API route must exist at api/admin/logs/route.ts");
	});

	it("logs API route imports getAdminUser for auth", () => {
		const src = fs.readFileSync(routePath, "utf-8");
		assert.ok(src.includes("getAdminUser"), "logs API route must import getAdminUser");
	});

	it("logs API route uses cloud-logging module", () => {
		const src = fs.readFileSync(routePath, "utf-8");
		assert.ok(
			src.includes("fetchRecentLogs") || src.includes("cloud-logging"),
			"logs API route must use cloud-logging module",
		);
	});

	it("logs API route returns 403 for unauthorized access", () => {
		const src = fs.readFileSync(routePath, "utf-8");
		assert.ok(src.includes("403"), "logs API route must return 403 for unauthorized users");
	});

	it("logs API route accepts severity and type query params", () => {
		const src = fs.readFileSync(routePath, "utf-8");
		assert.ok(src.includes('"severity"'), "logs API route must accept severity param");
		assert.ok(src.includes('"type"'), "logs API route must accept type param");
	});
});

describe("admin: cloud-logging helper", () => {
	const helperPath = path.join(DASHBOARD_DIR, "lib", "cloud-logging.ts");

	it("cloud-logging.ts helper file exists", () => {
		assert.ok(fs.existsSync(helperPath), "cloud-logging.ts must exist in dashboard/lib/");
	});

	it("cloud-logging exports fetchRecentLogs function", () => {
		const src = fs.readFileSync(helperPath, "utf-8");
		assert.ok(
			src.includes("export async function fetchRecentLogs"),
			"cloud-logging.ts must export fetchRecentLogs",
		);
	});

	it("cloud-logging imports @google-cloud/logging", () => {
		const src = fs.readFileSync(helperPath, "utf-8");
		assert.ok(
			src.includes("@google-cloud/logging"),
			"cloud-logging.ts must import @google-cloud/logging SDK",
		);
	});

	it("cloud-logging uses correct Cloud Run filter", () => {
		const src = fs.readFileSync(helperPath, "utf-8");
		assert.ok(
			src.includes("cloud_run_revision"),
			"cloud-logging filter must target cloud_run_revision resource type",
		);
		assert.ok(
			src.includes("capthca-land-prod"),
			"cloud-logging filter must target capthca-land-prod service",
		);
	});

	it("cloud-logging handles unavailability gracefully", () => {
		const src = fs.readFileSync(helperPath, "utf-8");
		assert.ok(
			src.includes("catch") && src.includes("entries: []"),
			"cloud-logging must catch errors and return empty results",
		);
	});

	it("cloud-logging exports LogEntry type", () => {
		const src = fs.readFileSync(helperPath, "utf-8");
		assert.ok(
			src.includes("export interface LogEntry"),
			"cloud-logging must export LogEntry interface",
		);
	});
});

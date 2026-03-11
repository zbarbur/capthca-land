import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const PROJECT_DIR = process.cwd();
const PKG_PATH = path.join(PROJECT_DIR, "package.json");
const DEPLOY_PROD_PATH = path.join(PROJECT_DIR, "bin", "deploy-production.sh");

describe("ci:full script", () => {
	const pkg = JSON.parse(fs.readFileSync(PKG_PATH, "utf-8"));

	it("ci:full script exists in package.json", () => {
		assert.ok(pkg.scripts["ci:full"], 'package.json must have a "ci:full" script');
	});

	it("ci:full includes next build", () => {
		const script: string = pkg.scripts["ci:full"];
		assert.ok(
			script.includes("build"),
			"ci:full script must include a build step (npm run build or next build)",
		);
	});

	it("ci:full runs ci first", () => {
		const script: string = pkg.scripts["ci:full"];
		assert.ok(script.includes("npm run ci"), "ci:full must run npm run ci before building");
	});

	it("ci:full builds inside dashboard directory", () => {
		const script: string = pkg.scripts["ci:full"];
		assert.ok(script.includes("cd dashboard"), "ci:full must cd into dashboard for the build step");
	});
});

describe("deploy-production.sh references ci:full", () => {
	const content = fs.readFileSync(DEPLOY_PROD_PATH, "utf-8");

	it("deploy-production.sh exists", () => {
		assert.ok(fs.existsSync(DEPLOY_PROD_PATH), "bin/deploy-production.sh must exist");
	});

	it("deploy-production.sh runs ci:full", () => {
		assert.ok(
			content.includes("ci:full"),
			"deploy-production.sh must reference ci:full for pre-deploy validation",
		);
	});

	it("deploy-production.sh does not use plain ci (without :full)", () => {
		// Ensure it uses ci:full, not just ci
		const lines = content.split("\n");
		const ciLines = lines.filter(
			(line) => line.includes("npm run ci") && !line.startsWith("#") && !line.startsWith("echo"),
		);
		for (const line of ciLines) {
			assert.ok(
				line.includes("ci:full"),
				`deploy-production.sh should use ci:full, not plain ci: ${line.trim()}`,
			);
		}
	});
});

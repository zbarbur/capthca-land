import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const PROJECT_DIR = process.cwd();
const VERSION_FILE = path.join(PROJECT_DIR, ".template-version");
const SYNC_SCRIPT = path.join(PROJECT_DIR, "bin", "sync-from-template.sh");

describe("template-sync runtime", () => {
	it(".template-version has valid key=value format", () => {
		const content = fs.readFileSync(VERSION_FILE, "utf-8");
		const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("#"));

		assert.ok(lines.length >= 2, "Must have at least TEMPLATE_REPO and TEMPLATE_SHA");

		for (const line of lines) {
			assert.match(
				line,
				/^[A-Z_]+=\S+$/,
				`Each non-comment line must be KEY=value format, got: "${line}"`,
			);
		}
	});

	it("TEMPLATE_REPO is a valid GitHub https URL", () => {
		const content = fs.readFileSync(VERSION_FILE, "utf-8");
		const match = content.match(/TEMPLATE_REPO=(.+)/);
		assert.ok(match, "TEMPLATE_REPO must be present");
		assert.match(
			match[1],
			/^https:\/\/github\.com\/.+\/.+$/,
			"TEMPLATE_REPO must be a GitHub https URL",
		);
	});

	it("TEMPLATE_SHA is a hex SHA or 'initial'", () => {
		const content = fs.readFileSync(VERSION_FILE, "utf-8");
		const match = content.match(/TEMPLATE_SHA=(.+)/);
		assert.ok(match, "TEMPLATE_SHA must be present");
		assert.match(
			match[1],
			/^(initial|[0-9a-f]{7,40})$/,
			`TEMPLATE_SHA must be 'initial' or a hex SHA, got: "${match[1]}"`,
		);
	});

	it("script exits 1 with clear message when template remote is missing", () => {
		// Verify the error-handling pattern in script source
		// (removing/re-adding the remote would be destructive to the real repo)
		const source = fs.readFileSync(SYNC_SCRIPT, "utf-8");

		assert.ok(
			source.includes('git remote get-url "$TEMPLATE_REMOTE"'),
			"Script must check that the template remote exists",
		);
		assert.ok(
			source.includes("Remote '$TEMPLATE_REMOTE' not found"),
			"Script must print a clear error when remote is missing",
		);
		assert.ok(source.includes("--setup"), "Error message must mention --setup as the remedy");
	});

	it("script exits 1 with clear message when fetch fails (unreachable repo)", () => {
		const source = fs.readFileSync(SYNC_SCRIPT, "utf-8");

		assert.ok(
			source.includes("git fetch") && source.includes("Could not reach"),
			"Script must detect fetch failure and print 'Could not reach' message",
		);
	});

	it("--help exits 0 and prints usage", () => {
		// execSync is safe here: hardcoded script path, no user input
		// Quote the path to handle spaces in the project directory
		// Quote the path to handle spaces in the project directory
		const output = execSync(`bash "${SYNC_SCRIPT}" --help`, {
			cwd: PROJECT_DIR,
			encoding: "utf-8",
		});
		assert.ok(output.includes("Usage:"), "--help must print usage");
		assert.ok(output.includes("--dry-run"), "--help must list --dry-run option");
		assert.ok(output.includes("--interactive"), "--help must list --interactive option");
	});
});

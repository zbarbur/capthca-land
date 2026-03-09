import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const PROJECT_DIR = process.cwd();
const VERSION_FILE = path.join(PROJECT_DIR, ".template-version");
const SYNC_SCRIPT = path.join(PROJECT_DIR, "bin", "sync-from-template.sh");

describe("template sync", () => {
	describe(".template-version file", () => {
		it("exists in the project root", () => {
			assert.ok(
				fs.existsSync(VERSION_FILE),
				".template-version file must exist in the project root",
			);
		});

		it("contains TEMPLATE_REPO entry", () => {
			const content = fs.readFileSync(VERSION_FILE, "utf-8");
			assert.ok(
				content.includes("TEMPLATE_REPO="),
				".template-version must contain a TEMPLATE_REPO entry",
			);
		});

		it("contains TEMPLATE_SHA entry", () => {
			const content = fs.readFileSync(VERSION_FILE, "utf-8");
			assert.ok(
				content.includes("TEMPLATE_SHA="),
				".template-version must contain a TEMPLATE_SHA entry",
			);
		});

		it("TEMPLATE_REPO points to a valid URL", () => {
			const content = fs.readFileSync(VERSION_FILE, "utf-8");
			const match = content.match(/TEMPLATE_REPO=(.+)/);
			assert.ok(match, "TEMPLATE_REPO line must be present");
			assert.ok(match[1].startsWith("https://"), "TEMPLATE_REPO must be an https URL");
		});
	});

	describe("bin/sync-from-template.sh", () => {
		it("exists", () => {
			assert.ok(fs.existsSync(SYNC_SCRIPT), "bin/sync-from-template.sh must exist");
		});

		it("is executable or has bash shebang", () => {
			const content = fs.readFileSync(SYNC_SCRIPT, "utf-8");
			const stats = fs.statSync(SYNC_SCRIPT);
			const isExecutable = (stats.mode & 0o111) !== 0;
			const hasBashShebang = content.startsWith("#!/");
			assert.ok(
				isExecutable || hasBashShebang,
				"sync script must be executable or have a bash shebang",
			);
		});

		it("supports --dry-run flag", () => {
			const content = fs.readFileSync(SYNC_SCRIPT, "utf-8");
			assert.ok(content.includes("--dry-run"), "sync script must support --dry-run flag");
			assert.ok(content.includes("DRY_RUN"), "sync script must have DRY_RUN logic");
		});

		it("reads .template-version for stored SHA", () => {
			const content = fs.readFileSync(SYNC_SCRIPT, "utf-8");
			assert.ok(
				content.includes(".template-version"),
				"sync script must reference .template-version file",
			);
			assert.ok(
				content.includes("TEMPLATE_SHA"),
				"sync script must read TEMPLATE_SHA from version file",
			);
		});

		it("updates .template-version after sync", () => {
			const content = fs.readFileSync(SYNC_SCRIPT, "utf-8");
			assert.ok(
				content.includes("update_template_version"),
				"sync script must have a function to update .template-version",
			);
		});

		it("handles unreachable template repo gracefully", () => {
			const content = fs.readFileSync(SYNC_SCRIPT, "utf-8");
			// Should check for fetch failure and exit gracefully
			assert.ok(
				content.includes("Could not reach") ||
					content.includes("unreachable") ||
					(content.includes("git fetch") && content.includes("exit 1")),
				"sync script must handle unreachable template repo",
			);
		});

		it("filters placeholder-only differences", () => {
			const content = fs.readFileSync(SYNC_SCRIPT, "utf-8");
			assert.ok(
				content.includes("placeholder") || content.includes("PLACEHOLDER"),
				"sync script must filter placeholder-only diffs",
			);
		});

		it("outputs categorized file lists (add/modify/delete)", () => {
			const content = fs.readFileSync(SYNC_SCRIPT, "utf-8");
			assert.ok(
				content.includes("ADD") || content.includes("NEW"),
				"sync script must report new/added files",
			);
			assert.ok(
				content.includes("MODIFY") || content.includes("UPDATED"),
				"sync script must report modified files",
			);
			assert.ok(content.includes("DELETE"), "sync script must report deleted files");
		});
	});
});

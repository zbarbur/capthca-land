# Testing — Strategy, Patterns, Coverage

## Test Runner: Node.js Built-In

Use `node --test` (Node.js 18+), not vitest or jest. It is fast, zero-config, and ships with the runtime.

```bash
# Run all tests
node --test --import tsx test/*.test.ts test/**/*.test.ts

# Run a specific file
node --test --import tsx test/auth.test.ts

# npm script
# package.json: "test": "node --test --import tsx test/*.test.ts test/**/*.test.ts"
npm test
```

The `--import tsx` flag enables TypeScript support without a build step.

## Test Organization

```
test/
  auth.test.ts           # Unit tests for auth module
  token.test.ts          # Unit tests for token lifecycle
  report.test.ts         # Unit tests for report generation
  infra/
    deps.test.ts         # Dependency completeness checks
    config.test.ts       # Config validation tests
  live/
    api-smoke.test.ts    # Live API smoke tests (require running server)
```

- `test/` — Unit and integration tests, run by `npm test`
- `test/infra/` — Infrastructure tests (dependency checks, config validation)
- `test/live/` — Live tests against a running instance, **excluded** from `npm test`

## Core Principles

### 1. Test Pure Functions, Not Frameworks

Extract business logic from route handlers into testable modules in `lib/`. The route handler becomes a thin wrapper that parses input, calls the function, and formats output.

```typescript
// BAD — logic embedded in route handler, untestable
export async function GET(req: NextRequest) {
	const hosts = await getHosts(tenantId);
	const stats = { total: hosts.length, critical: hosts.filter(h => h.severity === "critical").length };
	// ... 50 lines of report formatting
	return Response.json({ stats, report });
}

// GOOD — logic extracted to lib/, easily testable
// lib/report-generator.ts
export function generateReport(hosts: Host[]): Report {
	const stats = { total: hosts.length, critical: hosts.filter(h => h.severity === "critical").length };
	// ... report formatting
	return { stats, markdown };
}

// route.ts — thin wrapper
import { generateReport } from "@/lib/report-generator";
export async function GET(req: NextRequest) {
	const hosts = await getHosts(tenantId);
	return Response.json(generateReport(hosts));
}

// test/report.test.ts — tests pure function directly
import { generateReport } from "../dashboard/lib/report-generator.ts";
test("generateReport counts critical hosts", () => {
	const report = generateReport([{ severity: "critical" }, { severity: "low" }]);
	assert.strictEqual(report.stats.critical, 1);
});
```

### 2. Use Temp Dirs with Cleanup

Tests that write to the filesystem must use temp directories and clean up after themselves.

```typescript
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("file export", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "test-"));
	});

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true });
	});

	it("writes export file", async () => {
		await exportData(tempDir, data);
		const files = readdirSync(tempDir);
		assert.strictEqual(files.length, 1);
	});
});
```

### 3. Environment Variable Isolation

Tests must not depend on or pollute the host environment.

```typescript
describe("config loading", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("uses default when env var unset", () => {
		delete process.env.MY_SETTING;
		assert.strictEqual(getConfig().setting, "default");
	});
});
```

## Live Smoke Tests

Live tests run against a real server instance. They are **not** part of `npm test` — they require a running server and valid credentials.

### Env-Var Skip Pattern

```typescript
// test/live/api-smoke.test.ts
import { describe, it, before } from "node:test";

const BASE_URL = process.env.SMOKE_TEST_URL;
const TOKEN = process.env.SMOKE_TEST_TOKEN;

describe("API smoke tests", () => {
	before(() => {
		if (!BASE_URL || !TOKEN) {
			console.log("Skipping smoke tests: SMOKE_TEST_URL and SMOKE_TEST_TOKEN required");
			process.exit(0);
		}
	});

	it("GET /api/health returns 200", async () => {
		const res = await fetch(`${BASE_URL}/api/health`);
		assert.strictEqual(res.status, 200);
	});

	it("GET /api/fleet returns data with valid token", async () => {
		const res = await fetch(`${BASE_URL}/api/fleet`, {
			headers: { Authorization: `Bearer ${TOKEN}` },
		});
		assert.strictEqual(res.status, 200);
		const body = await res.json();
		assert.ok(Array.isArray(body.data));
	});
});
```

## Pre-Commit vs CI Test Separation

| Stage | What runs | Why |
|---|---|---|
| Pre-commit | Lint + typecheck | Fast feedback, under 10 seconds |
| CI | Lint + typecheck + full test suite | Comprehensive, catches integration issues |

Keep pre-commit fast. Developers bypass slow hooks. Run the full suite in CI where time is less critical.

## Test Coverage as Sprint Deliverable

Every sprint should include a dedicated test task at the end. Feature tasks focus on shipping functionality. The test task provides comprehensive coverage of all new code.

- Add the test task to the sprint backlog with explicit DoD: "All new modules have test coverage, all new API endpoints have request/response tests."
- This prevents the common failure mode where tests are "part of the feature task" but silently get deprioritized.

## Infrastructure Tests

Test project health and configuration, not just business logic.

```typescript
// test/infra/deps.test.ts
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

describe("dependency health", () => {
	it("package.json and lock file are in sync", () => {
		// Run npm ls --all and check exit code
	});

	it("no circular dependencies in lib/", () => {
		// Use madge or manual import graph check
	});

	it("all env vars referenced in code have defaults or validation", () => {
		// Grep for process.env usages and verify each has a fallback
	});
});
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| Testing implementation details | Tests break on refactors | Test behavior (inputs/outputs), not internals |
| Flaky tests | Erode trust, get ignored | Use deterministic data, mock time, avoid race conditions |
| Test-only code in production | Dead code, security surface | Use dependency injection, not `if (process.env.NODE_ENV === "test")` |
| Snapshot overuse | Changes auto-approved, drift unnoticed | Use explicit assertions for important fields |
| No cleanup | Tests pollute each other | Always restore env, remove temp files, reset state |
| Giant test files | Hard to find/maintain | One test file per module, mirror the source structure |
| Testing the framework | Wasted effort | Test your logic, trust the framework |

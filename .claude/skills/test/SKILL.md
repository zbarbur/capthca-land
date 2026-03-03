---
name: test
description: Run tests intelligently — diagnose failures, analyze coverage gaps, run targeted tests, and suggest missing test cases.
---

# Test Skill

You are managing tests for CAPTHCA land. The user invoked `/test $ARGUMENTS`.

## Determine Mode

Parse the first argument:

| Argument | Mode | Action |
|----------|------|--------|
| (empty) | Run all | `npm test` — run full suite, diagnose any failures |
| `FILE.test.ts` | Run specific | Run a single test file |
| `for FILE.ts` | Find related | Find and run tests related to a source file |
| `coverage` | Coverage analysis | Analyze what's tested vs untested |
| `live` | Live smoke tests | Run `test/live/*.test.ts` with env var checks |
| `infra` | Infrastructure tests | Run `test/infra/*.test.ts` only |
| `watch FILE` | Watch mode | Re-run tests on file changes |
| `add FILE.ts` | Generate tests | Generate test file for untested source |

## Mode: Run All (`/test`)

```bash
npm test
```

**On success:** Report test count, suite count, duration. Highlight any slow tests (>1s).

**On failure:** For each failing test:
1. Read the failing test file
2. Read the source file being tested
3. Diagnose why it fails:
   - Assertion error → show expected vs actual, suggest fix
   - Import error → check module resolution, `"type": "module"` in package.json
   - Timeout → suggest async issue or missing cleanup
   - Reference error → missing dependency or wrong import path
4. Offer to fix the test or the source code

## Mode: Run Specific (`/test path/to/file.test.ts`)

```bash
node --test --import tsx $ARGUMENTS
```

Run a single test file and report results. On failure, diagnose as above.

## Mode: Find Related (`/test for src/auth.ts`)

1. Search for test files that import or test the target source file:
   ```
   grep -r "auth" test/ --include="*.test.ts" -l
   ```
2. Also check for naming convention matches: `src/auth.ts` → `test/auth.test.ts`
3. If found, run them and report
4. If not found, report "No tests found for src/auth.ts" and offer to generate a test skeleton

## Mode: Coverage Analysis (`/test coverage`)

Perform a manual coverage analysis (no coverage tool needed):

1. **List all source files**:
   ```
   find src/ lib/ dashboard/lib/ -name "*.ts" -not -name "*.test.ts" -not -name "*.d.ts"
   ```

2. **List all test files**:
   ```
   find test/ -name "*.test.ts"
   ```

3. **Match source → test**:
   For each source file, check if a corresponding test exists (by name or import).

4. **Report**:
   ```markdown
   ## Test Coverage Analysis

   ### Covered (have tests)
   - src/auth.ts → test/auth.test.ts (5 tests)
   - lib/cloud/secrets.ts → test/cloud-secrets.test.ts (3 tests)

   ### Uncovered (no tests found)
   - src/validation.ts ← **has exported functions, should be tested**
   - dashboard/lib/report-generator.ts ← **pure functions, easy to test**

   ### Test-Only (no matching source)
   - test/integration.test.ts (standalone integration test)

   ### Summary
   - Source files: N
   - Covered: N (X%)
   - Uncovered: N
   - Priority targets: [files with most exports and no tests]
   ```

5. **Suggest priorities**: Rank uncovered files by number of exported functions — more exports = higher priority.

## Mode: Live Smoke Tests (`/test live`)

1. Check required environment variables:
   - Look for env var references in `test/live/*.test.ts`
   - Report which are set and which are missing

2. If all required vars are set:
   ```bash
   node --test --import tsx test/live/*.test.ts
   ```

3. If vars are missing:
   ```
   Missing environment variables for live tests:
     CAPTHCA_LAND_API_URL  — set to your staging/production URL
     CAPTHCA_LAND_TOKEN    — set to a valid API token

   Example:
     export CAPTHCA_LAND_API_URL=https://staging.example.com
     export CAPTHCA_LAND_TOKEN=your_token_here
     /test live
   ```

## Mode: Infrastructure Tests (`/test infra`)

```bash
node --test --import tsx test/infra/*.test.ts
```

Run infrastructure tests (dependency completeness, config validation). Report results.

## Mode: Generate Tests (`/test add src/module.ts`)

1. Read the source file
2. Identify all exported functions, classes, and their signatures
3. Generate a test file skeleton:

```typescript
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { functionName } from "../src/module.ts";

describe("module", () => {
	describe("functionName", () => {
		it("should [expected behavior for typical input]", () => {
			// TODO: implement
		});

		it("should [expected behavior for edge case]", () => {
			// TODO: implement
		});

		it("should [expected behavior for error case]", () => {
			// TODO: implement
		});
	});
});
```

4. For each exported function, generate test cases based on:
   - Parameter types (test with valid, invalid, edge-case values)
   - Return type (assert correct type and value)
   - Error conditions (if function throws, test the throw)
   - Side effects (if function writes files/state, verify and clean up)

5. Write the file to `test/[name].test.ts`
6. Run it to verify it at least compiles: `node --test --import tsx test/[name].test.ts`

## Failure Diagnosis Patterns

When tests fail, check these common causes:

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `ERR_MODULE_NOT_FOUND` | Missing `"type": "module"` in package.json | Add to package.json |
| `Cannot find module` | Wrong import path or missing `.ts` extension handling | Check tsconfig, tsx setup |
| `EADDRINUSE` | Port conflict from previous test run | Kill process on port |
| `ETIMEOUT` | Missing `await` or unclosed handles | Check async/cleanup |
| `AssertionError` | Logic bug or outdated test | Compare expected vs actual |
| `ReferenceError` | Missing import or undefined variable | Check imports |

## Important Rules

- Test runner is **Node.js built-in** (`node --test`), NEVER vitest or jest
- Always import as: `import { describe, it } from "node:test"` and `import assert from "node:assert/strict"`
- Tests should be pure — no external service dependencies in unit tests
- Clean up temp files/dirs after tests
- Use `test/live/` for env-var-gated integration tests, kept separate from `npm test`

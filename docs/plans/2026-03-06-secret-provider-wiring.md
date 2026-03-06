# SecretProvider Wiring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire the existing `SecretProvider` abstraction into the dashboard so all server-side secrets flow through a single, testable interface with `CAPTHCA_LAND_` prefixed env vars.

**Architecture:** Copy `lib/cloud/secrets.ts` into `dashboard/lib/secrets.ts`. Wire it into the subscribe API route for the Turnstile secret. Middleware runs in Edge Runtime (no `Buffer`) so it stays on raw `process.env` but renames to `CAPTHCA_LAND_` prefix. Update Cloud Build configs and `.env` files to match.

**Tech Stack:** TypeScript, Next.js 14 API Routes, Cloud Build, GCP Secret Manager

---

## Constraints

- **Edge Runtime**: `dashboard/middleware.ts` runs in Edge Runtime. It cannot import the `SecretProvider` (uses `Buffer`). It reads `process.env` at module load time. We rename the env vars but keep `process.env` access.
- **Test runner**: Node.js built-in (`node --test --import tsx`), not vitest/jest.
- **Linter**: Biome v2 (tabs, double quotes, trailing commas).
- **Secret naming**: GCP Secret Manager names use kebab-case (`turnstile-secret-key`). The `EnvSecretProvider` transforms `turnstile-secret-key` → `CAPTHCA_LAND_TURNSTILE_SECRET_KEY`.
- **Cloud Run `--set-secrets`**: Maps a Secret Manager secret to an env var name. We change the env var name the secret is mapped to (e.g. `CAPTHCA_LAND_TURNSTILE_SECRET_KEY=turnstile-secret-key:latest`).

---

## Secret Inventory

| Secret (SM name) | Old env var | New env var | Used in | Runtime |
|---|---|---|---|---|
| `turnstile-secret-key` | `TURNSTILE_SECRET_KEY` | `CAPTHCA_LAND_TURNSTILE_SECRET_KEY` | `subscribe/route.ts` | Node.js |
| `staging-auth-pass` | `STAGING_AUTH_PASS` | `CAPTHCA_LAND_STAGING_AUTH_PASS` | `middleware.ts` | Edge |
| _(config, not secret)_ | `STAGING_AUTH_USER` | `CAPTHCA_LAND_STAGING_AUTH_USER` | `middleware.ts` | Edge |

---

### Task 1: Copy SecretProvider into dashboard

**Files:**
- Source: `lib/cloud/secrets.ts`
- Create: `dashboard/lib/secrets.ts`

**Step 1: Copy and verify**

Copy `lib/cloud/secrets.ts` to `dashboard/lib/secrets.ts`. The file is self-contained (no local imports). No changes to the implementation — it already has:
- `SecretProvider` interface
- `GCPSecretProvider` (REST API + metadata token + cache)
- `EnvSecretProvider` (prefix-based env var lookup)
- `createSecretProvider()` factory (auto-detects via `K_SERVICE`)
- `resetSecretProvider()` for testing

```typescript
// dashboard/lib/secrets.ts — exact copy of lib/cloud/secrets.ts
// No modifications needed. The CAPTHCA_LAND_ prefix is already the default.
```

**Step 2: Verify it compiles**

Run: `cd dashboard && npx tsc --noEmit --pretty`
Expected: No errors related to `lib/secrets.ts`

**Step 3: Commit**

```bash
git add dashboard/lib/secrets.ts
git commit -m "feat: copy SecretProvider into dashboard/lib for Next.js access"
```

---

### Task 2: Write tests for SecretProvider

**Files:**
- Create: `test/infra/secrets.test.ts`

**Step 1: Write the tests**

```typescript
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
	EnvSecretProvider,
	createSecretProvider,
	resetSecretProvider,
} from "../../dashboard/lib/secrets.ts";

describe("EnvSecretProvider", () => {
	afterEach(() => {
		// Clean up env vars set during tests
		for (const key of Object.keys(process.env)) {
			if (key.startsWith("CAPTHCA_LAND_TEST_")) {
				delete process.env[key];
			}
		}
	});

	it("resolves secret from prefixed env var", async () => {
		process.env.CAPTHCA_LAND_MY_SECRET = "hunter2";
		const provider = new EnvSecretProvider();
		const value = await provider.getSecret("my-secret");
		assert.equal(value, "hunter2");
		delete process.env.CAPTHCA_LAND_MY_SECRET;
	});

	it("transforms kebab-case to UPPER_SNAKE_CASE", async () => {
		process.env.CAPTHCA_LAND_TURNSTILE_SECRET_KEY = "test-key";
		const provider = new EnvSecretProvider();
		const value = await provider.getSecret("turnstile-secret-key");
		assert.equal(value, "test-key");
		delete process.env.CAPTHCA_LAND_TURNSTILE_SECRET_KEY;
	});

	it("throws when env var is missing", async () => {
		const provider = new EnvSecretProvider();
		await assert.rejects(
			() => provider.getSecret("nonexistent-secret"),
			(err: Error) => {
				assert.ok(err.message.includes("CAPTHCA_LAND_NONEXISTENT_SECRET"));
				return true;
			},
		);
	});

	it("supports custom prefix", async () => {
		process.env.CUSTOM_MY_KEY = "custom-val";
		const provider = new EnvSecretProvider("CUSTOM_");
		const value = await provider.getSecret("my-key");
		assert.equal(value, "custom-val");
		delete process.env.CUSTOM_MY_KEY;
	});
});

describe("createSecretProvider factory", () => {
	afterEach(() => {
		resetSecretProvider();
		delete process.env.SECRET_PROVIDER;
		delete process.env.K_SERVICE;
	});

	it("returns EnvSecretProvider when not on GCP", () => {
		delete process.env.K_SERVICE;
		delete process.env.SECRET_PROVIDER;
		resetSecretProvider();
		const provider = createSecretProvider();
		assert.equal(provider.provider, "env");
	});

	it("returns singleton on repeated calls", () => {
		resetSecretProvider();
		const a = createSecretProvider();
		const b = createSecretProvider();
		assert.equal(a, b);
	});
});
```

**Step 2: Run tests to verify they pass**

Run: `npm test`
Expected: All secrets tests pass

**Step 3: Commit**

```bash
git add test/infra/secrets.test.ts
git commit -m "test: add SecretProvider unit tests"
```

---

### Task 3: Wire SecretProvider into subscribe route

**Files:**
- Modify: `dashboard/app/api/subscribe/route.ts` (line 52)

**Step 1: Write a test for secret-backed Turnstile lookup**

Add to `test/infra/secrets.test.ts`:

```typescript
describe("Turnstile secret via provider", () => {
	afterEach(() => {
		resetSecretProvider();
		delete process.env.CAPTHCA_LAND_TURNSTILE_SECRET_KEY;
	});

	it("resolves turnstile-secret-key from CAPTHCA_LAND_ env var", async () => {
		process.env.CAPTHCA_LAND_TURNSTILE_SECRET_KEY = "0x_test_turnstile_key";
		resetSecretProvider();
		const provider = createSecretProvider();
		const secret = await provider.getSecret("turnstile-secret-key");
		assert.equal(secret, "0x_test_turnstile_key");
	});
});
```

Run: `npm test` — Expected: PASS

**Step 2: Modify subscribe route to use SecretProvider**

Replace line 52 in `dashboard/app/api/subscribe/route.ts`:

```typescript
// OLD:
const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

// NEW:
import { createSecretProvider } from "@/lib/secrets";

// ... inside POST handler, replace the turnstileSecret line:
let turnstileSecret: string | undefined;
try {
	turnstileSecret = await createSecretProvider().getSecret("turnstile-secret-key");
} catch {
	// Secret not configured — skip Turnstile verification (local dev)
}
```

The full modified section (lines 51-68 of the original):

```typescript
	// Turnstile verification (skip if secret not configured — local dev)
	let turnstileSecret: string | undefined;
	try {
		turnstileSecret = await createSecretProvider().getSecret("turnstile-secret-key");
	} catch {
		// Secret not configured — skip Turnstile verification (local dev)
	}
	if (turnstileSecret) {
		const cfToken = body.cfToken || "";
		// ... rest unchanged
	}
```

**Step 3: Run tests**

Run: `npm test`
Expected: All tests pass

**Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: No errors

**Step 5: Commit**

```bash
git add dashboard/app/api/subscribe/route.ts test/infra/secrets.test.ts
git commit -m "feat: wire SecretProvider into subscribe route for Turnstile secret"
```

---

### Task 4: Rename middleware env vars to CAPTHCA_LAND_ prefix

**Files:**
- Modify: `dashboard/middleware.ts` (lines 4-5)

**Step 1: Update env var names in middleware**

```typescript
// OLD:
const STAGING_USER = process.env.STAGING_AUTH_USER || "capthca";
const STAGING_AUTH_PASS = process.env.STAGING_AUTH_PASS || "";

// NEW:
const STAGING_USER = process.env.CAPTHCA_LAND_STAGING_AUTH_USER || "capthca";
const STAGING_AUTH_PASS = process.env.CAPTHCA_LAND_STAGING_AUTH_PASS || "";
```

Note: Middleware runs in Edge Runtime — cannot import SecretProvider (uses `Buffer`). Raw `process.env` is the only option here. We still apply the naming convention.

**Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add dashboard/middleware.ts
git commit -m "refactor: rename middleware env vars to CAPTHCA_LAND_ prefix"
```

---

### Task 5: Update .env files

**Files:**
- Modify: `dashboard/.env.example`
- Modify: `dashboard/.env.local`

**Step 1: Update .env.example**

```env
USE_MEMORY_STORE=true
GOOGLE_CLOUD_PROJECT=capthca-local
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
CAPTHCA_LAND_TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
# Set to enable basic auth on staging (leave empty to disable)
CAPTHCA_LAND_STAGING_AUTH_USER=capthca
CAPTHCA_LAND_STAGING_AUTH_PASS=
```

**Step 2: Update .env.local**

```env
USE_MEMORY_STORE=true
GOOGLE_CLOUD_PROJECT=capthca-local
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
CAPTHCA_LAND_TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

**Step 3: Run local-stack start, verify subscribe still works**

Run: `bin/local-stack.sh start`
Then: `bin/api-test.sh -X POST /api/subscribe -d '{"email":"test@example.com","track":"light"}'`
Expected: `{"success":true}` (memory store, Turnstile skipped because dummy key fails gracefully)

**Step 4: Commit**

```bash
git add dashboard/.env.example dashboard/.env.local
git commit -m "refactor: rename env vars to CAPTHCA_LAND_ prefix in .env files"
```

---

### Task 6: Update Cloud Build configs

**Files:**
- Modify: `cloudbuild.yaml` (line 109)
- Modify: `cloudbuild-deploy.yaml` (line 48)

**Step 1: Update cloudbuild.yaml (staging)**

Line 109 — change `--set-secrets`:

```yaml
# OLD:
--set-secrets="STAGING_AUTH_PASS=staging-auth-pass:latest,TURNSTILE_SECRET_KEY=turnstile-secret-key:latest"

# NEW:
--set-secrets="CAPTHCA_LAND_STAGING_AUTH_PASS=staging-auth-pass:latest,CAPTHCA_LAND_TURNSTILE_SECRET_KEY=turnstile-secret-key:latest"
```

Also add `CAPTHCA_LAND_STAGING_AUTH_USER` to `--set-env-vars` on line 108 (it's a config value, not a secret):

```yaml
# OLD:
--set-env-vars="GOOGLE_CLOUD_PROJECT=${PROJECT_ID},NEXT_PUBLIC_TURNSTILE_SITE_KEY=${_TURNSTILE_SITE_KEY}"

# NEW:
--set-env-vars="GOOGLE_CLOUD_PROJECT=${PROJECT_ID},NEXT_PUBLIC_TURNSTILE_SITE_KEY=${_TURNSTILE_SITE_KEY},CAPTHCA_LAND_STAGING_AUTH_USER=capthca"
```

**Step 2: Update cloudbuild-deploy.yaml (production)**

Line 48 — change `--set-secrets`:

```yaml
# OLD:
--set-secrets="TURNSTILE_SECRET_KEY=turnstile-secret-key:latest"

# NEW:
--set-secrets="CAPTHCA_LAND_TURNSTILE_SECRET_KEY=turnstile-secret-key:latest"
```

**Step 3: Verify YAML is valid**

Run: `python3 -c "import yaml; yaml.safe_load(open('cloudbuild.yaml')); yaml.safe_load(open('cloudbuild-deploy.yaml')); print('OK')"`
Expected: `OK`

**Step 4: Commit**

```bash
git add cloudbuild.yaml cloudbuild-deploy.yaml
git commit -m "refactor: rename Cloud Build secret env vars to CAPTHCA_LAND_ prefix"
```

---

### Task 7: Full CI verification

**Step 1: Run full CI**

Run: `npm run ci`
Expected: lint + typecheck + test all pass

**Step 2: Run ci:full (includes next build)**

Run: `npm run ci:full`
Expected: Build succeeds (secrets not required at build time — Turnstile secret is runtime-only)

---

### Task 8: Update Dockerfile comment

**Files:**
- Modify: `Dockerfile` (lines 37-38)

**Step 1: Update the runtime secrets comment**

```dockerfile
# OLD:
# Runtime secrets (injected by Secret Manager, NOT baked into image):
#   CAPTHCA_LAND_AUTH_SECRET  -> env var (session signing key)

# NEW:
# Runtime secrets (injected by Secret Manager, NOT baked into image):
#   CAPTHCA_LAND_TURNSTILE_SECRET_KEY  -> Turnstile CAPTCHA verification
#   CAPTHCA_LAND_STAGING_AUTH_PASS     -> staging basic auth (staging only)
```

**Step 2: Commit**

```bash
git add Dockerfile
git commit -m "docs: update Dockerfile runtime secrets comment"
```

---

## Deployment Note

After merging, the **next staging deploy** will apply the new env var names. The GCP Secret Manager secret names (`turnstile-secret-key`, `staging-auth-pass`) stay the same — only the env var names they're mapped to change. No Secret Manager changes needed.

If a deploy happens between merging individual commits, it could break staging temporarily (env var renamed in code but not yet in Cloud Build config, or vice versa). To avoid this, **deploy Tasks 1-6 together** or merge to a feature branch first.

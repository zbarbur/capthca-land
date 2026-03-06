# Sprint 2: Security hardening, content polish, and SecretProvider

---

### T2.1 — Wire SecretProvider into dashboard
- **Goal:** Integrate the SecretProvider abstraction so all server-side secrets use `CAPTHCA_LAND_` prefixed env vars, improving consistency and testability
- **Specialist:** infra-architect
- **Complexity:** S
- **Depends on:** None _(implementation complete on `feat/secret-provider-wiring` branch — merge and verify)_
- **DoD:**
  - [ ] `dashboard/lib/secrets.ts` exists with `SecretProvider` interface, `GCPSecretProvider`, `EnvSecretProvider`, factory
  - [ ] `subscribe/route.ts` uses `createSecretProvider().getSecret("turnstile-secret-key")` instead of raw `process.env`
  - [ ] `middleware.ts` uses `CAPTHCA_LAND_STAGING_AUTH_PASS` and `CAPTHCA_LAND_STAGING_AUTH_USER`
  - [ ] `cloudbuild.yaml` and `cloudbuild-deploy.yaml` use `CAPTHCA_LAND_*` env var names in `--set-secrets`
  - [ ] `.env.example` and `.env.local` use `CAPTHCA_LAND_*` env var names
  - [ ] Tests pass (`npm test`) — includes 7 SecretProvider tests
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Merge `feat/secret-provider-wiring` branch (7 commits, already tested)
  - Key files: `dashboard/lib/secrets.ts`, `dashboard/app/api/subscribe/route.ts`, `dashboard/middleware.ts`, `cloudbuild.yaml`, `cloudbuild-deploy.yaml`, `.env.example`, `.env.local`, `Dockerfile`
  - Test file: `test/infra/secrets.test.ts` (7 tests)
- **Test Plan:**
  - `test/infra/secrets.test.ts` — EnvSecretProvider resolution, kebab-to-UPPER_SNAKE transform, missing secret throws, custom prefix, factory singleton, Turnstile secret lookup
- **Demo Data Impact:**
  - None — secret management infrastructure only

---

### T2.2 — Add favicon
- **Goal:** Add a favicon to the site so browsers don't return 404 on favicon.ico requests
- **Specialist:** frontend-engineer
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] `dashboard/app/favicon.ico` exists and is served at `/favicon.ico`
  - [ ] Browser tab shows the favicon when visiting any page
  - [ ] No 404 in browser network tab for favicon.ico
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Create or source a favicon that fits CAPTHCA brand (dual-narrative / helix motif)
  - Place at `dashboard/app/favicon.ico` (Next.js App Router convention — auto-served)
  - Optionally add `apple-touch-icon.png` in `dashboard/app/` for iOS
  - Optionally add `icon` metadata export in `dashboard/app/layout.tsx`
- **Test Plan:**
  - Manual: visit localhost:3000, verify favicon in browser tab
  - `test/infra/dependency-completeness.test.ts` — add check that `dashboard/app/favicon.ico` exists
- **Demo Data Impact:**
  - None — static asset only

---

### T2.3 — SEO meta tags and Open Graph
- **Goal:** Add SEO meta tags and Open Graph metadata so the site renders rich previews when shared on social media
- **Specialist:** frontend-engineer
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] `<title>` and `<meta name="description">` set on all pages (/, /light, /dark)
  - [ ] Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) on all pages
  - [ ] Twitter card meta tags (`twitter:card`, `twitter:title`, `twitter:description`) on all pages
  - [ ] Content sourced from `content/shared/meta.md`
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Read `content/shared/meta.md` for title, description, and OG values
  - Use Next.js `metadata` export in `dashboard/app/layout.tsx` for site-wide defaults
  - Override per-page in `dashboard/app/light/page.tsx` and `dashboard/app/dark/page.tsx` using `generateMetadata`
  - OG image: use existing helix-hero.png from `public/tracks/` or a shared image
- **Test Plan:**
  - `test/ui/meta.test.ts` — verify metadata exports exist in layout.tsx, light/page.tsx, dark/page.tsx (source-level check)
- **Demo Data Impact:**
  - None — metadata only

---

### T2.4 — Add HSTS header
- **Goal:** Add Strict-Transport-Security header to enforce HTTPS connections and prevent SSL stripping attacks
- **Specialist:** devsecops-expert
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains` header present on all responses
  - [ ] Header configured in `dashboard/next.config.mjs` alongside existing security headers
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Add `{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }` to the headers array in `dashboard/next.config.mjs`
  - Place after existing `X-Frame-Options` header
- **Test Plan:**
  - `test/infra/security-hardening.test.ts` — source-level: verify `next.config.mjs` contains `Strict-Transport-Security` with `max-age=31536000`
- **Demo Data Impact:**
  - None — HTTP header only

---

### T2.5 — Input validation hardening: body size limit
- **Goal:** Reject oversized request bodies on `/api/subscribe` before JSON parsing to prevent memory pressure from large payloads
- **Specialist:** devsecops-expert
- **Complexity:** S
- **Depends on:** T2.1 (subscribe route modified by SecretProvider wiring)
- **DoD:**
  - [ ] Requests with `Content-Length` > 1KB return 413 with `{ error: "payload_too_large" }`
  - [ ] Requests without `Content-Length` that exceed 1KB after reading also return 413
  - [ ] Normal subscribe requests (< 200 bytes) continue to work
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Add body size check at the top of the POST handler in `dashboard/app/api/subscribe/route.ts`
  - Check `Content-Length` header first (fast path), then limit body read
  - Limit: 1024 bytes (subscribe payload is ~100 bytes)
  - Return `NextResponse.json({ error: "payload_too_large" }, { status: 413 })`
- **Test Plan:**
  - `test/api/subscribe.test.ts` — add: body size validation test (content-length > 1KB should be rejected)
- **Demo Data Impact:**
  - None — validation hardening

---

### T2.6 — No input reflection in error messages
- **Goal:** Audit and ensure error messages never echo back user-supplied values, preventing information leakage and potential XSS in API consumers
- **Specialist:** devsecops-expert
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] All error responses in `subscribe/route.ts` use static strings (no template literals with user input)
  - [ ] Non-regression test verifies no `${` interpolation in error response lines
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Audit `dashboard/app/api/subscribe/route.ts` — verify all `error:` values are string literals
  - Audit any other API routes (currently only subscribe)
  - The `console.error("Firestore write error:", err)` is server-side only (safe) — no change needed
- **Test Plan:**
  - `test/infra/security-hardening.test.ts` — source-level: read all `route.ts` files, check that lines containing `error:` don't contain `${` interpolation
- **Demo Data Impact:**
  - None — security audit

---

### T2.7 — Firestore collection prefix for environment isolation
- **Goal:** Add environment-based prefix to Firestore collection names (`stg_`, `prd_`, `local_`) to prevent cross-environment data pollution
- **Specialist:** infra-architect
- **Complexity:** S
- **Depends on:** T2.1 (firestore.ts may be affected by SecretProvider changes)
- **DoD:**
  - [ ] `dashboard/lib/firestore.ts` prepends env-based prefix to collection names
  - [ ] Prefix determined by `CAPTHCA_LAND_ENV` env var: `prd` -> `prd_`, `stg` -> `stg_`, else `local_`
  - [ ] Subscribe route writes to `stg_subscribers` on staging, `prd_subscribers` on production, `local_subscribers` locally
  - [ ] `cloudbuild.yaml` sets `CAPTHCA_LAND_ENV=stg` in `--set-env-vars`
  - [ ] `cloudbuild-deploy.yaml` sets `CAPTHCA_LAND_ENV=prd` in `--set-env-vars`
  - [ ] `.env.example` documents `CAPTHCA_LAND_ENV` (default: `local`)
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Add `CAPTHCA_LAND_ENV` env var (values: `prd`, `stg`, `local`)
  - Modify `db.collection(name)` wrapper in `dashboard/lib/firestore.ts` to prepend `${prefix}_` to collection name
  - Prefix map: `prd` -> `prd_`, `stg` -> `stg_`, everything else -> `local_`
  - Update `cloudbuild.yaml` `--set-env-vars` to include `CAPTHCA_LAND_ENV=stg`
  - Update `cloudbuild-deploy.yaml` `--set-env-vars` to include `CAPTHCA_LAND_ENV=prd`
  - Add `CAPTHCA_LAND_ENV=local` to `.env.example`
- **Test Plan:**
  - `test/infra/firestore-prefix.test.ts` — unit: prefix function returns correct prefix for each env value
  - `test/api/subscribe.test.ts` — update existing tests if they reference collection names
- **Demo Data Impact:**
  - Existing Firestore `subscribers` collection becomes `stg_subscribers` on staging — existing data stays in unprefixed collection (one-time, acceptable for MVP scale)

---

### T2.8 — Security non-regression tests
- **Goal:** Add source-level tests that catch security regressions in CI — verify HSTS, CSP directives, no input reflection, and body size limits are present in code
- **Specialist:** devsecops-expert
- **Complexity:** S
- **Depends on:** T2.4, T2.5, T2.6 (security features must exist to test)
- **DoD:**
  - [ ] Test verifies HSTS header with 1-year max-age in `next.config.mjs`
  - [ ] Test verifies CSP includes required directives (default-src, script-src, frame-ancestors)
  - [ ] Test verifies no user input reflection in API error responses
  - [ ] Test verifies body size limit check exists in subscribe route
  - [ ] All non-regression tests in a single file: `test/infra/security-hardening.test.ts`
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New file: `test/infra/security-hardening.test.ts`
  - Read source files and assert security patterns exist (inspired by battle-tested patterns 5.2)
  - Tests:
    1. Read `next.config.mjs` -> assert contains `Strict-Transport-Security` with `max-age=31536000`
    2. Read `next.config.mjs` -> assert CSP contains `default-src`, `script-src`, `frame-ancestors`
    3. Read all `app/api/**/route.ts` -> assert no `error:.*\${` pattern (no input reflection)
    4. Read `app/api/subscribe/route.ts` -> assert contains `413` or `payload_too_large` (body size limit)
- **Test Plan:**
  - Self-testing: these ARE the tests
  - Expected: ~4-5 new test cases
- **Demo Data Impact:**
  - None — test infrastructure only

---

## Sprint 2 Summary

| Task | Title | Size | Depends |
|------|-------|------|---------|
| T2.1 | Wire SecretProvider | S | None |
| T2.2 | Add favicon | S | None |
| T2.3 | SEO meta tags + OG | S | None |
| T2.4 | Add HSTS header | S | None |
| T2.5 | Body size limit | S | T2.1 |
| T2.6 | No input reflection | S | None |
| T2.7 | Firestore collection prefix | S | T2.1 |
| T2.8 | Security non-regression tests | S | T2.4, T2.5, T2.6 |

# TODO — CAPTHCA land

> Sprint 8: Analytics foundation and infrastructure hardening
> Branch: `sprint8/main`

---

### T8.1 — GA4 integration with custom events
- **Goal:** Add Google Analytics 4 to the site with custom events tracking slider interactions, track selection, audio toggles, and CTA clicks for engagement measurement
- **Specialist:** frontend-developer
- **Complexity:** M
- **Depends on:** None
- **DoD:**
  - [ ] GA4 `gtag.js` loaded on all pages via nonce-based script tag
  - [ ] CSP updated to allow `*.google-analytics.com` and `*.googletagmanager.com`
  - [ ] Custom events fire: `slider_interaction`, `track_select`, `audio_toggle`, `cta_click`, `page_scroll_depth`
  - [ ] GA4 measurement ID configurable via `NEXT_PUBLIC_GA4_MEASUREMENT_ID` env var
  - [ ] Analytics disabled when measurement ID is not set (local dev)
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New file: `dashboard/lib/analytics.ts` — typed `trackEvent()` helper wrapping `gtag()`
  - Add gtag script in `dashboard/app/layout.tsx` with nonce from `x-nonce` header
  - CSP in `middleware.ts`: add `*.google-analytics.com *.googletagmanager.com` to `script-src` and `connect-src`
  - Events: `{ event: string, category: string, label?: string, value?: number }`
  - Wire events: DualitySlider (drag/click), track page visit, AmbientAudio toggle, EmailCapture submit
  - Env var: `NEXT_PUBLIC_GA4_MEASUREMENT_ID` (empty = disabled)
- **Test Plan:**
  - `test/lib/analytics.test.ts` — trackEvent helper, disabled when no ID, event shape validation
  - `test/middleware/csp-ga4.test.ts` — CSP headers include GA4 domains
  - ~8 tests
- **Demo Data Impact:**
  - None — analytics is client-side only

---

### T8.2 — GA4 Data API in admin dashboard
- **Goal:** Add an analytics page to the admin dashboard that pulls GA4 metrics (page views, active users, engagement time, top pages, returning visitors) via the GA4 Data API
- **Specialist:** frontend-developer + node-architect
- **Complexity:** M
- **Depends on:** T8.1
- **DoD:**
  - [ ] New admin page at `/analytics` showing GA4 metrics
  - [ ] Displays: active users (7d/30d), page views by page, avg engagement time, new vs returning visitors
  - [ ] Date range selector (7d, 30d, 90d)
  - [ ] Charts for page view trends and top pages (Recharts)
  - [ ] Graceful fallback when GA4 credentials unavailable (local dev shows placeholder)
  - [ ] GA4 property ID configurable via `CAPTHCA_LAND_GA4_PROPERTY_ID` env var
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Add `@google-analytics/data` dependency to `dashboard/package.json`
  - New file: `dashboard/lib/ga4-reporting.ts` — wraps GA4 Data API (`runReport`), returns typed metrics
  - New route: `dashboard/app/api/admin/analytics/route.ts` — GET endpoint, admin auth required
  - New page: `dashboard/app/(admin)/analytics/page.tsx` — server component with client chart components
  - Add "Analytics" nav item to admin layout sidebar
  - Uses same GCP service account — needs Analytics Data API enabled + GA4 property access
- **Test Plan:**
  - `test/admin/analytics.test.ts` — page structure, API route auth, chart components, fallback behavior
  - ~10 tests
- **Demo Data Impact:**
  - None — reads from GA4 API

---

### T8.3 — Migrate DNS to Cloudflare with Access policies
- **Goal:** Move capthca.ai DNS to Cloudflare for DDoS protection, CDN, and Cloudflare Access to secure admin dashboard and staging with per-user Google OAuth
- **Specialist:** devops-engineer
- **Complexity:** M
- **Depends on:** None
- **DoD:**
  - [ ] DNS records migrated to Cloudflare (capthca.ai, staging.capthca.ai)
  - [ ] Cloudflare proxy enabled (orange cloud) for CDN and DDoS protection
  - [ ] Cloudflare Access application configured for admin routes (`/dashboard`, `/subscribers`, `/logs`, `/api/admin`)
  - [ ] Cloudflare Access application configured for `staging.capthca.ai`
  - [ ] Middleware updated to read `Cf-Access-Authenticated-User-Email` header
  - [ ] Admin routes unblocked for Cloudflare Access-authenticated requests (remove localhost-only restriction)
  - [ ] Basic auth removed from staging (replaced by Cloudflare Access)
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Cloudflare: add site, update nameservers at registrar, verify propagation
  - Cloudflare Access: Zero Trust dashboard → Applications → Self-hosted → path-based policy
  - Access policy: allow specific Google accounts (your email)
  - Middleware: update `isAdminPath()` to check `Cf-Access-Authenticated-User-Email` header instead of localhost check
  - Keep `isLocalDev()` fallback for local development
  - Remove `CAPTHCA_LAND_STAGING_AUTH_USER` and `CAPTHCA_LAND_STAGING_AUTH_PASS` env vars + basic auth middleware logic
  - Update deploy scripts to remove staging basic auth secrets
- **Test Plan:**
  - `test/middleware/cloudflare-access.test.ts` — header parsing, access control, local dev fallback
  - Update `test/middleware/admin-routing.test.ts` — Cloudflare Access header instead of IAP
  - ~8 tests
- **Demo Data Impact:**
  - None — infrastructure change only

---

### T8.4 — Improve template sync mechanism
- **Goal:** Record `.template-version` at init, diff template-to-template for clean updates, reduce noise from placeholder substitution
- **Specialist:** node-architect
- **Complexity:** M
- **Depends on:** None
- **DoD:**
  - [ ] `.template-version` file tracked in repo with current template commit hash
  - [ ] `bin/sync-from-template.sh` diffs between stored version and latest template (not against project files)
  - [ ] Placeholder substitution (project name, slug) applied after diff to reduce noise
  - [ ] Dry-run mode (`--dry-run`) shows what would change without modifying files
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New file: `.template-version` — stores last synced template commit SHA
  - Update `bin/sync-from-template.sh` — clone template at stored SHA and at HEAD, diff between them, apply delta
  - Filter: ignore files that only differ by placeholder values (project name, slug)
  - Output: list of files to add/modify/delete with preview
- **Test Plan:**
  - `test/tools/template-sync.test.ts` — version file exists, script is executable, dry-run flag
  - ~4 tests
- **Demo Data Impact:**
  - None

---

### T8.5 — Add ci:full script pattern
- **Goal:** Add `ci:full` npm script that includes `next build` in addition to lint, typecheck, and test for comprehensive pre-deploy validation
- **Specialist:** devops-engineer
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] `npm run ci:full` runs lint + typecheck + test + `next build` in sequence
  - [ ] `npm run ci` remains as the fast check (no build)
  - [ ] Production deploy script uses `ci:full` instead of `ci`
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Add to root `package.json`: `"ci:full": "npm run ci && cd dashboard && npx next build"`
  - Update `bin/deploy-production.sh`: change `npm run ci` to `npm run ci:full`
  - Verify standalone output still works with `ci:full`
- **Test Plan:**
  - `test/tools/ci-scripts.test.ts` — verify ci:full script exists in package.json, deploy script references it
  - ~3 tests
- **Demo Data Impact:**
  - None

---

### T8.6 — Sync CAPTHCA from latest template
- **Goal:** Pull latest process docs, checklists, and skill improvements from the upstream template into CAPTHCA
- **Specialist:** devops-engineer
- **Complexity:** S
- **Depends on:** T8.4
- **DoD:**
  - [ ] `bin/sync-from-template.sh` run against latest template
  - [ ] Process docs updated if template has improvements
  - [ ] `.template-version` updated to latest template commit
  - [ ] No regressions — `npm run ci` passes after sync
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Run the improved sync script from T8.4
  - Review diff, accept relevant changes, skip project-specific customizations
  - Update `.template-version` to new SHA
- **Test Plan:**
  - Verify `npm run ci` passes after sync
  - ~2 tests (version file updated, no broken imports)
- **Demo Data Impact:**
  - None

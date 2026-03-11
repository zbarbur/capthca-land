# Sprint 8 Handover — Analytics Foundation & Infrastructure Hardening

**Theme:** Add Google Analytics (collection + reporting), migrate DNS to Cloudflare with Zero Trust Access for admin protection, and improve CI/template tooling.

**Branch:** `sprint8/main`
**Dates:** Sprint 7 closure → 2026-03-11
**Test count:** 370 tests, 72 suites (up from 307/56)

---

## Completed Tasks

| Task | Status | Key Files |
|------|--------|-----------|
| T8.1 — GA4 integration with custom events | Done | `dashboard/lib/analytics.ts`, `dashboard/app/layout.tsx`, `dashboard/middleware.ts` (CSP) |
| T8.2 — GA4 Data API in admin dashboard | Done | `dashboard/lib/ga4-reporting.ts`, `dashboard/app/admin/analytics/`, `dashboard/app/api/admin/analytics/route.ts` |
| T8.3 — Cloudflare DNS + Access policies | Done | `dashboard/middleware.ts`, `dashboard/lib/admin-auth.ts`, `cloudbuild.yaml`, `cloudbuild-deploy.yaml` |
| T8.4 — Template sync improvement | Done | `bin/sync-from-template.sh`, `.template-version` |
| T8.5 — ci:full script | Done | `package.json` |
| T8.6 — Sync from template | Done | `.template-version`, process docs |

## Additional Fixes During Sprint

- Admin routes moved from `(admin)` route group to `/admin` path prefix — simpler middleware, simpler CF Access config
- Image 400s on staging fixed — `/_next/image` optimizer internal fetch was hitting basic auth middleware
- GA4 Data API enabled in GCP project
- Secret Manager IAM binding added for `CAPTHCA_LAND_ADMIN_USERS`
- Cloud Build Alpine bash dependency removed — replaced shell execution test with source-based check
- Unused `_GA4_MEASUREMENT_ID` substitution removed from production deploy config
- Error messages sanitized — no internal env var names exposed to users

## Architecture Changes

### Admin Route Structure
- **Before:** `app/(admin)/` route group — URLs at root (`/dashboard`, `/subscribers`, etc.)
- **After:** `app/admin/` folder — URLs under `/admin/*` (`/admin/dashboard`, `/admin/analytics`, etc.)
- Middleware: single `pathname.startsWith("/admin")` check instead of array of paths
- Cloudflare Access: one rule for `/admin*`, one for `/api/admin*`

### Authentication Flow
- **Before:** Localhost-only admin access, 404 for remote
- **After:** Cloudflare Access → CF header → middleware → admin layout auth chain
- Fallback: localhost dev still works with simulated IAP identity
- Admin users managed via `CAPTHCA_LAND_ADMIN_USERS` secret in Secret Manager (JSON: `{"email":"role"}`)

### GA4 Integration
- **Client-side:** gtag.js with nonce-based CSP, fires custom events (`slider_interaction`, `track_select`, `audio_toggle`, `cta_click`)
- **Server-side:** `@google-analytics/data` SDK for Data API reporting in admin dashboard
- **Config:** `NEXT_PUBLIC_GA4_MEASUREMENT_ID` (build-time, public) + `CAPTHCA_LAND_GA4_PROPERTY_ID` (runtime, server-only)

### Middleware Matcher
- Added `tracks/` and `assets/` to exclusion list to prevent `/_next/image` optimizer internal fetch from hitting basic auth

## Key Decisions

- Cloudflare Access with one-time PIN (not Google OAuth) — simpler, no OAuth app needed
- Admin routes under `/admin` path prefix — cleaner than route groups for security policy
- GA4 property shared between staging and production — separate property in backlog
- Basic auth kept on staging during CF Access transition — removal in backlog
- GA4 property ID as plain env var (not secret) — it's not sensitive

## Known Issues

- GA4 30d/90d date ranges show empty until data accumulates (GA4 just installed)
- GA4 analytics shared between staging and production — staging traffic pollutes production data
- Basic auth still active on staging alongside Cloudflare Access
- `cloudbuild-deploy.yaml` deploys pre-built `latest` image — must run staging build first to get latest code in image

## Lessons Learned

- **Enable GCP APIs before deploy** — GA4 Data API wasn't enabled, causing silent null returns
- **Grant Secret Manager IAM on creation** — new secrets have no bindings by default; add `bin/create-secret.sh` to automate
- **`/_next/image` optimizer internal fetch hits middleware** — the matcher excludes the endpoint but the optimizer's internal request goes through the full middleware stack
- **Don't expose env var names in user-facing messages** — replace with generic user-friendly messages
- **Cloud Build Alpine has no bash** — only busybox `sh`; avoid shell execution tests or install bash
- **Git index corruption** — killed git processes on shared filesystems leave `index.lock`; `rm .git/index && git reset` rebuilds it
- **Unused Cloud Build substitutions cause INVALID_ARGUMENT** — production deploy config shouldn't define build-time-only substitutions

## Recommendations for Next Sprint

1. **Expanded analytics** — traffic sources, device breakdown, geography (high value, data is accumulating)
2. **Custom date range** — date picker for arbitrary periods
3. **Remove staging basic auth** — fully transition to Cloudflare Access
4. **`bin/create-secret.sh`** — prevent IAM binding oversights
5. **Separate staging GA4 property** — clean analytics data

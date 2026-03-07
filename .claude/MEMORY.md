# CAPTHCA land — Project Memory

## Project Purpose
Dual-narrative landing page for the CAPTHCA identity protocol at capthca.ai. Visitors choose between Light (Symbiotic) and Dark (Post-Biological) tracks via an interactive slider, then sign up with email.

## Project Tools — ALWAYS USE THESE
**STOP and check here before running ANY infrastructure/dev command.**

| Action | Use THIS | NEVER use |
|---|---|---|
| Start/stop dev env | `bin/local-stack.sh start\|stop` | `npm run dev`, `lsof -ti:PORT`, manual kill |
| Deploy staging | `bin/deploy-staging.sh [service]` | raw `gcloud run deploy` |
| Deploy production | `bin/deploy-production.sh [service]` | raw `gcloud builds submit` |
| Tests | `npm test` / `npm run ci` | `vitest`, `jest` |
| Pre-deploy CI | `npm run ci:full` (includes `next build`) | `npm run ci` alone before deploy |
| Domain status | `bin/domain-status.sh [domain]` | raw `gcloud run domain-mappings` |

## Testing
- Test runner: **Node.js built-in** (`node --test`), NOT vitest/jest
- Command: `node --test --import tsx test/*.test.ts test/**/*.test.ts`
- npm script: `npm test`
- 63 tests passing as of Sprint 3 end

## Key Project Patterns
- **Theme switching:** CSS variables + body class (`theme-light` / `theme-dark`)
- **Shared components:** Same logic, different skins per track (see `docs/COMPONENT_STRATEGY.md`)
- **Domain:** capthca.ai (production), staging.capthca.ai (DNS on GoDaddy)
- **Email storage:** Firestore — email + track preference (light/dark)
- **North star metric:** Visitor -> email signup conversion rate, segmented by track
- **Turnstile CAPTCHA:** Explicit render API (not auto-render) — required for React client components
- **Lazy Firestore init:** `db` proxy creates real client on first `.collection()` call — Next.js evaluates API routes at build time
- **`NEXT_PUBLIC_*` vars:** Must be Docker `ARG` + `ENV`, passed via `--build-arg` in Kaniko — inlined at build time, not runtime
- **Observability:** Structured JSON logging (logger.ts), custom metrics (metrics.ts), analytics (analytics.ts)

## Key Decisions
- Next.js on Cloud Run (not static export) — need SSR for SEO + API routes
- Firestore for email (not Sheets/Supabase) — simplest GCP-native option
- Cloudflare Turnstile over reCAPTCHA — lighter, privacy-friendly
- Staging auth via middleware (basic auth) — will be replaced by Cloudflare Access
- In-memory rate limiter — acceptable at single-instance scale
- Biome excludes `app/styles/**/*.css` and `dashboard/app/globals.css`
- Blue/green production deploys (--no-traffic + traffic shift)
- Privacy-first analytics — no external SDK, custom /api/analytics endpoint

## Environments
| Environment | URL | Service Name | GCP Project |
|---|---|---|---|
| Production | capthca.ai | capthca-land-prod | capthca-489205 |
| Staging | staging.capthca.ai | capthca-land-staging | capthca-489205 |

## Secrets (Secret Manager)
- `turnstile-secret-key` — Cloudflare Turnstile verification
- `staging-auth-pass` — Basic auth for staging

## Sprint Status
- Sprint 0 (Inception): COMPLETED — charter, backlog, context populated
- Sprint 1 (Dual-narrative MVP): COMPLETED — slider, tracks, email capture, Turnstile, staging deploy
- Sprint 2 (Security + Design): COMPLETED — SecretProvider, HSTS, dark/light designs, subscriber enrichment
- Sprint 3 (Visual polish + Production): COMPLETED (2026-03-07) — DualitySlider rebuild, visual assets, observability stack, production deploy to capthca.ai

## Lessons Learned
- Turnstile auto-render (`cf-turnstile` class) doesn't work with React client components — must use explicit `window.turnstile.render()` via useEffect
- Firebase `initializeApp` crashes during `next build` "Collecting page data" phase — use lazy init pattern
- `NEXT_PUBLIC_*` env vars are inlined at build time by Next.js, NOT read at runtime — must be Docker build args
- Cloud Run `--allow-unauthenticated` silently fails without `run.services.setIamPolicy` — add explicit IAM binding in deploy step
- `x-forwarded-for` last entry is the real IP on Cloud Run (Cloud Run appends it)
- Always run `npm run ci:full` (includes `next build`) before deploying — catches type errors that `tsc --noEmit` misses
- Root `tsconfig.json` doesn't include `dashboard/` — typecheck script must run both `tsc` invocations
- Local dev server changes `.next/` directory which breaks `ci:full` typecheck — stop dev server before running deploy script
- Slider drag thresholds must be generous (5-8%) — last mouse/touch event may not register at the exact edge

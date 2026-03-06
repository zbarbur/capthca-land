# KANBAN — CAPTHCA land

> This file is the single source of truth for the project backlog.
> `TODO.md` contains only the active sprint's tasks.
> Items flow: **Backlog** --> **Doing** --> **Done**

---

## Doing (Sprint 2)

- [infra] Wire SecretProvider into dashboard — CAPTHCA_LAND_ prefix, update Cloud Build (S) → T2.1
- [ui] Add favicon (currently 404) (S) → T2.2
- [ui] SEO meta tags + Open Graph for social sharing (S) → T2.3
- [security] Add HSTS header — Strict-Transport-Security in next.config.mjs (S) → T2.4
- [security] Input validation hardening — body size limit (413) on subscribe route (S) → T2.5
- [security] No input reflection in errors — audit + add non-regression test (S) → T2.6
- [infra] Firestore collection prefix (stg_/prd_) — prevent cross-env data pollution (S) → T2.7
- [testing] Security non-regression tests — source-level checks for HSTS, CSP, no input reflection (S) → T2.8

---

## Backlog

### High Priority
- [infra] Deploy production to capthca.ai — production Cloud Run service + DNS (S)
- [infra] Migrate DNS from GoDaddy to Cloudflare — DDoS, CDN, Cloudflare Access (S)

### MVP (Sprint 3)
- [analytics] Instrument slider interaction events (track choice, time spent) (M)
- [ui] Optimize images with next/image, compress track assets (S)
- [content] Implement content system — render markdown from content/ into dashboard pages (M)

### Post-MVP (Sprint 3+)
- [email] Welcome email on signup — track-specific content (M)
- [email] Email provider integration (Resend or SendGrid) (M)
- [ui] Deep multi-section narrative pages for each track (L)
- [ui] Social sharing cards with track-specific generated images (M)
- [analytics] Analytics dashboard — track preference distribution, conversion funnel (M)
- [ui] Animated transitions between slider positions (S)
- [ui] Sound/ambient audio per track (experimental) (M)
- [security] Move rate limiter to Redis or Cloud Armor for multi-instance consistency (M)
- [security] Add request logging for abuse monitoring (S)
- [security] Tighten CSP — remove 'unsafe-inline' for scripts (S)
- [infra] Evaluate Turbopack / Vite for build tooling (M)

### Battle-Tested Patterns (from OpenClaw Lens review)
- [observability] Structured JSON logging — Cloud Logging compatible (M)
- [observability] Health endpoint /api/health — check Firestore connectivity (S)
- [observability] Custom metrics for subscribe API — counters for signups, errors, rate limits (M)
- [observability] OpenTelemetry foundation — Edge-Runtime-safe Next.js setup (L)
- [infra] Blue-green deploys for staging — --no-traffic + traffic shift (S)
- [infra] npm audit in CI pipeline — non-blocking dependency vulnerability check (S)
- [testing] API route coverage check — ensure every route.ts has test coverage (S)

---

## Tech Debt

- [infra] Turnstile console warnings on track pages (non-blocking, cosmetic)
- [infra] `NEXT_PUBLIC_*` vars require Docker build args — document pattern for future public env vars

---

## Done (Sprint 1)

- [infra] Local dev stack — Tailwind + PostCSS build, hot reload, local Firestore emulator (M)
- [ui] Convert index.html duality slider to Next.js React component (L)
- [ui] Theme switching system — CSS variables + Tailwind class toggle (S)
- [ui] Mobile-responsive slider with touch support (M)
- [ui] Build light track page at /light with narrative content from tracks/light (M)
- [ui] Build dark track page at /dark with narrative content from tracks/dark (M)
- [api] POST /api/subscribe endpoint — validate email, store to Firestore with track preference (M)
- [ui] Email capture forms on both tracks with inline validation + Turnstile CAPTCHA (S)
- [security] Pre-launch security review — rate limiting, input validation, CORS, CSP, Turnstile, honeypot (M)
- [infra] Cloud Run staging deployment + DNS (staging.capthca.ai) (M)

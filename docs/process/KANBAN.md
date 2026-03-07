# KANBAN — CAPTHCA land

> This file is the single source of truth for the project backlog.
> `TODO.md` contains only the active sprint's tasks.
> Items flow: **Backlog** --> **Doing** --> **Done**

---

## Doing

(empty — between sprints)

---

## Backlog

### High Priority
- [infra] Migrate DNS from GoDaddy to Cloudflare — DDoS, CDN, Cloudflare Access (S)
- [ui] Mobile slider drag-to-navigate — touch UX for edge navigation on mobile (S)
- [content] Remove "V4" references from site copy (S)
- [infra] Configure www.capthca.ai CNAME in GoDaddy DNS (S)

### MVP (Sprint 4+)
- [tooling] Subscriber management scripts — pull, export CSV, list by track, delete (S)
- [analytics] Subscriber profiling enrichment — timezone, locale, screen size, geo (IP lookup), device type (S)
- [ui] Optimize images with next/image, compress track assets (S)
- [content] Implement content system — render markdown from content/ into dashboard pages (M)

### Post-MVP (Sprint 4+)
- [email] Welcome email on signup — track-specific content (M)
- [email] Email provider integration (Resend or SendGrid) (M)
- [ui] Deep multi-section narrative pages for each track (L)
- [ui] Social sharing cards with track-specific generated images (M)
- [analytics] Analytics dashboard — track preference distribution, conversion funnel (M)
- [ui] Animated transitions between slider positions (S)
- [ui] Sound/ambient audio per track (experimental) (M)
- [security] Move rate limiter to Redis or Cloud Armor for multi-instance consistency (M)
- [security] Tighten CSP — remove 'unsafe-inline' for scripts (S)
- [infra] Evaluate Turbopack / Vite for build tooling (M)

### Battle-Tested Patterns (from OpenClaw Lens review)
- [observability] OpenTelemetry foundation — Edge-Runtime-safe Next.js setup (L)
- [infra] Blue-green deploys for staging — --no-traffic + traffic shift (S)
- [infra] npm audit in CI pipeline — non-blocking dependency vulnerability check (S)
- [testing] API route coverage check — ensure every route.ts has test coverage (S)

---

## Tech Debt

- [infra] Turnstile console warnings on track pages (non-blocking, cosmetic)
- [infra] `NEXT_PUBLIC_*` vars require Docker build args — document pattern for future public env vars

---

## Done (Sprint 3)

- [art] T3.1 — Generate all visual assets from art-direction.md (L)
- [ui] T3.2 — Rebuild home page (DualitySlider) from content spec (L)
- [observability] T3.3 — Structured JSON logging (M)
- [observability] T3.4 — Health endpoint /api/health (S)
- [observability] T3.5 — Custom metrics for subscribe API (M)
- [security] T3.6 — Request logging for abuse monitoring (S)
- [analytics] T3.7 — Instrument slider interaction events (M)
- [infra] T3.8 — Deploy production to capthca.ai (S)
- [ui] T3.9 — Align track pages with content system + wire images (M)
- [fix] Slider edge-drag navigation — widened thresholds + edge check on release

---

## Done (Sprint 2)

- [infra] Wire SecretProvider into dashboard — CAPTHCA_LAND_ prefix, update Cloud Build (S)
- [ui] Add favicon — gold C on black SVG (S)
- [ui] SEO meta tags + Open Graph for social sharing (S)
- [security] Add HSTS header — Strict-Transport-Security in next.config.mjs (S)
- [security] Input validation hardening — body size limit (4096) on subscribe route (S)
- [security] No input reflection in errors — audit + non-regression test (S)
- [infra] Firestore collection prefix (stg_/prd_/local_) — prevent cross-env data pollution (S)
- [testing] Security non-regression tests — HSTS, CSP, no input reflection, body size, Firestore prefix (S)
- [ui] Dark track design — Matrix rain, CRT scanlines, glitch typography, alert pulse, HUD brackets (M)
- [ui] Dark track copy — content implemented on page (M)
- [ui] Light track design — glassmorphism, gradient orbs, smooth scroll reveal, pull quotes (M)
- [ui] Light track copy — content implemented on page (M)
- [fix] Body size limit bumped 1024->4096 for Turnstile tokens
- [feat] Subscriber data enriched with IP, user agent, referer, accept-language

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

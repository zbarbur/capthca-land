# KANBAN — CAPTHCA land

> This file is the single source of truth for the project backlog.
> `TODO.md` contains only the active sprint's tasks.
> Items flow: **Backlog** --> **Doing** --> **Done**

---

## Backlog

### High Priority
- [infra] Deploy production to capthca.ai — production Cloud Run service + DNS (S)
- [infra] Migrate DNS from GoDaddy to Cloudflare — DDoS, CDN, Cloudflare Access (S)

### MVP (Sprint 3)
- [art] Generate all visual assets from content/shared/art-direction.md — 17 images via Nano Banana: dark track heroes + sections (7), light track heroes + sections (7), shared OG cards + favicon + slider (3). Save to public/tracks/*/assets/ and public/assets/ (L)
- [ui] Rebuild home page (DualitySlider) from content spec — each half previews track world (glassmorphism vs Matrix rain), gradient collision zone, cinematic entrance animation, hover expansion, mobile vertical stack, CTAs from content/home/duality-slider.md (L)
- [observability] Structured JSON logging — Cloud Logging compatible, replace console.log/error (M)
- [observability] Health endpoint /api/health — check Firestore connectivity (S)
- [observability] Custom metrics for subscribe API — counters for signups, errors, rate limits (M)
- [security] Add request logging for abuse monitoring (S)
- [analytics] Instrument slider interaction events (track choice, time spent) (M)
- [tooling] Subscriber management scripts — pull, export CSV, list by track, delete (S)
- [analytics] Subscriber profiling enrichment — timezone, locale, screen size, geo (IP lookup), device type (S)
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
- [fix] Body size limit bumped 1024→4096 for Turnstile tokens
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

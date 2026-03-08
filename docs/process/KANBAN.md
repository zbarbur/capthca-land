# KANBAN — CAPTHCA land

> This file is the single source of truth for the project backlog.
> `TODO.md` contains only the active sprint's tasks.
> Items flow: **Backlog** --> **Doing** --> **Done**

---

## Doing

### Sprint 6 — Content consolidation, mobile UX, and housekeeping

- [ui] T6.1 — Mobile experience overhaul (L)
- [ui] T6.2 — Ambient sound per track (M)
- [ui] T6.3 — CTA section on every page (M)
- [cleanup] T6.4 — Remove dead files and audit for orphans (S)
- [refactor] T6.5 — Wire landing pages into content system (M)
- [infra] T6.6 — Next.js upgrade to fix audit vulnerabilities (M)

---

## Backlog

### Post-MVP
- [email] Welcome email on signup — track-specific content (M)
- [email] Email provider integration (Resend or SendGrid) (M)
- [analytics] Analytics dashboard — track preference distribution, conversion funnel (M)
- [security] Move rate limiter to Redis or Cloud Armor for multi-instance consistency (M)
- [infra] Evaluate Turbopack / Vite for build tooling (M)

### Content & Diagrams
- [ui] Whitepaper diagram polish — refine spacing, mobile layouts, animations (M)
- [content] Content system regression tests — full render pipeline (markdown → HTML → diagrams) (S)

### Battle-Tested Patterns (from OpenClaw Lens review)
- [observability] OpenTelemetry foundation — Edge-Runtime-safe Next.js setup (L)
- [infra] Blue-green deploys for staging — --no-traffic + traffic shift (S)
- [infra] Migrate DNS from GoDaddy to Cloudflare — DDoS, CDN, Cloudflare Access (S)

### Template Sync
- [template] Improve template sync mechanism — record .template-version at init, diff template-to-template for clean updates, reduce noise from placeholder substitution (M)
- [template] Add ci:full script pattern to template package.json (S)
- [template] Sync CAPTHCA from latest template — process docs, checklists, skills may have upstream improvements (S)

### Infrastructure
- [infra] Local Cloud Build testing script — simulate build steps locally (S)

---

## Tech Debt

- [infra] Turnstile console warnings on track pages (non-blocking, cosmetic)
- [infra] `NEXT_PUBLIC_*` vars require Docker build args — document pattern for future public env vars
- [infra] Turbopack (`--turbo`) fails on paths with spaces — removed from dev script, evaluate when path changes or Turbopack fixes upstream

---

## Done (Sprint 5)

- [ui] T5.1 — Dark inner page atmosphere with per-page variations (L)
- [ui] T5.2 — Light inner page atmosphere with per-page variations (L)
- [ui] T5.3 — Content image integration via frontmatter (M)
- [docs] T5.4 — Content guide for cowork (S)
- [ui] T5.5 — Academic paper scaffold in content system (S)
- [infra] T5.6 — npm audit in CI pipeline (S)
- [infra] T5.7 — Deploy Sprint 4+5 to staging (S)
- [ui] Whitepaper interactive diagrams — 13 React components with Recharts
- [fix] Visual polish — atmosphere visibility, DNA helix width, per-page orb variants
- [fix] Cloud Build — include content/*.md, copy content/ into Docker builder

---

## Done (Sprint 4)

- [content] T4.1 — Implement content system (markdown rendering pipeline) (M)
- [ui] T4.2 — Scaffold all inner page routes (7 pages x 2 tracks) (M)
- [ui] T4.3 — Per-page design polish (track-specific styling + header images) (L)
- [ui] T4.4 — Animated transitions between slider positions (S)
- [ui] T4.5 — Social sharing cards with track-specific images (M)
- [tooling] T4.6 — Subscriber management scripts (S)
- [analytics] T4.7 — Subscriber profiling enrichment (S)
- [ui] T4.8 — Optimize images with next/image (S)
- [security] T4.9 — Tighten CSP — nonce-based script-src, remove 'unsafe-inline' (S)
- [testing] T4.10 — API route coverage check (S)
- [fix] Content pipeline: added remark-gfm for GFM tables, fixed marker post-processing
- [fix] Nav: integrated page links into TrackLayout, reordered (About first), added separators

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
- [content] T3.9 — Align track pages with content system + wire images (M)

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

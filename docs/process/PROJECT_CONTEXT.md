# Project Context — CAPTHCA land

> This file provides a high-level snapshot of the project's current state.
> Updated at the end of every sprint. See `SPRINT_END_CHECKLIST.md`.

---

## Status

| Field | Value |
|-------|-------|
| **Status** | Active — Sprint 8 Closed, Sprint 9 Planning |
| **Last Sync** | 2026-03-11 |
| **Current Sprint** | Sprint 8 Closed |
| **Objective** | Dual-narrative landing page at capthca.ai with email capture |

---

## Architecture Summary

```
┌──────────────────────────────────────────────────┐
│           Cloudflare (DNS + CDN + Access)         │
│                                                    │
│  capthca.ai ──────────────► Cloud Run (prod)      │
│  staging.capthca.ai ──────► Cloud Run (staging)   │
│                                                    │
│  /admin* ──► CF Access ──► one-time PIN auth      │
│  /api/admin* ──► CF Access ──► PIN auth           │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────┴───────────────────────────────┐
│              Cloud Run (Next.js 14)               │
│                                                    │
│  ┌─────────────┐  ┌───────────┐  ┌────────────┐  │
│  │  Duality     │  │  /light   │  │  /dark     │  │
│  │  Slider (/)  │──│  track    │  │  track     │  │
│  └──────┬──────┘  └─────┬─────┘  └─────┬──────┘  │
│         └───────────┬───┘──────────────┘          │
│                     │                              │
│  ┌──────────────────┴────────────────────────┐    │
│  │ /api/subscribe  │ /api/admin/analytics    │    │
│  │ + Turnstile     │ + GA4 Data API          │    │
│  │ + rate limit    │ + admin auth            │    │
│  └──────────────────┬────────────────────────┘    │
│                     │                              │
│  ┌──────────────────┴────────────────────────┐    │
│  │ /admin/*  — Dashboard, Subscribers,       │    │
│  │             Logs, Analytics                │    │
│  └───────────────────────────────────────────┘    │
└──────────────────┬───────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │  Firestore │ GA4    │
        │  (prefixed │ Data   │
        │  stg_/prd_)│ API    │
        └─────────────────────┘
```

- **Frontend:** Next.js 14.2.35 (App Router) with SSR on Cloud Run
- **Styling:** Tailwind CSS with CSS variable theme switching (`.theme-light` / `.theme-dark`)
- **API:** Next.js API routes (`/api/subscribe`, `/api/admin/analytics`)
- **Database:** Firestore (email collection with track preference, env-prefixed)
- **Hosting:** GCP Cloud Run (auto-scaling, standalone Next.js output)
- **DNS/CDN:** Cloudflare (proxy enabled, DDoS protection, Zero Trust Access)
- **CI/CD:** Cloud Build (cloudbuild.yaml → staging, cloudbuild-deploy.yaml → production)
- **Security:** Turnstile CAPTCHA, honeypot, rate limiter, CSP, HSTS, Cloudflare Access, SecretProvider
- **Analytics:** GA4 (client-side collection + server-side Data API reporting)
- **Secrets:** SecretProvider abstraction (`CAPTHCA_LAND_` prefix), GCP Secret Manager in prod/staging
- **Content:** Markdown + YAML frontmatter in `content/`, rendered via remark/rehype pipeline

---

## Infrastructure

| Component | Technology | Environment | Notes |
|-----------|-----------|-------------|-------|
| Frontend + API | Next.js 14.2.35 | Cloud Run | Standalone output, SSR |
| Database | Firestore | GCP (`capthca-489205`) | Env-prefixed collections (stg_/prd_/local_) |
| DNS/CDN | Cloudflare | Proxy enabled | DDoS, CDN, Zero Trust Access |
| Domain | capthca.ai / staging.capthca.ai | Cloudflare → Cloud Run | Cloudflare managed SSL |
| Admin Auth | Cloudflare Access | Zero Trust | One-time PIN, `/admin*` + `/api/admin*` |
| CI/CD | Cloud Build | GCP | Auto on push (staging), manual (prod) |
| Secrets | Secret Manager + SecretProvider | GCP | `CAPTHCA_LAND_*` env var naming |
| CAPTCHA | Cloudflare Turnstile | Cloudflare | Invisible mode |
| Analytics | Google Analytics 4 | GA4 | Collection (gtag.js) + Reporting (Data API) |
| Images | next/image | Cloud Run | Optimization at serve time |

---

## Test Coverage

| Metric | Value |
|--------|-------|
| **Total Tests** | 370 |
| **Test Suites** | 72 |
| **Test Runner** | Node.js built-in (`node --test`) |
| **Test Command** | `npm test` |
| **CI Command** | `npm run ci` (lint + typecheck + test) |
| **CI Full Command** | `npm run ci:full` (ci + next build) |

---

## Sprint History

| Sprint | Theme | Status | Tests | Key Deliverables |
|--------|-------|--------|-------|-----------------|
| 0 | Project inception | Completed | 5 | Template init, charter, backlog |
| 1 | Dual-narrative MVP | Completed | 13 | Slider, track pages, email capture, Turnstile, staging deploy |
| 2 | Security + Design | Completed | 30 | SecretProvider, HSTS, Firestore prefix, dark/light track designs, subscriber enrichment |
| 3 | Visual Polish + Observability | Completed | 63 | Art assets, DualitySlider rebuild, structured logging, health endpoint, metrics, analytics, content alignment, production deploy |
| 4 | Content Depth + Hardening | Completed | 94 | Content pipeline (remark/rehype), 14 inner pages, nonce-based CSP, subscriber scripts, enrichment, social cards, API coverage check |
| 5 | Inner Page Atmosphere | Completed | 113 | Per-page dark/light atmosphere (MatrixRain, GradientOrbs, DNAHelix), content images via frontmatter, 13 whitepaper diagram components (Recharts), academic paper scaffold, npm audit in CI, staging deploy |
| 6 | Content consolidation, mobile UX, housekeeping | Completed | 197 | Vertical mobile slider, hamburger nav, ambient audio toggle, CTA on every page, dead file cleanup, landing pages wired to content system, Next.js 14.2.35 |
| 7 | Admin foundation, content quality, polish | Completed | 307 | Admin dashboard (local-only), subscriber stats, Cloud Logging viewer, content pipeline tests, diagram polish, real ambient audio with seamless navigation |
| 8 | Analytics foundation, infrastructure hardening | Completed | 370 | GA4 integration + Data API dashboard, Cloudflare DNS + Access, admin routes under /admin, template sync improvements, ci:full script |

---

## Current State

### Working
- GA4 analytics collection (custom events: slider, track, audio, CTA) + admin reporting dashboard
- Admin dashboard under `/admin/*` protected by Cloudflare Access (one-time PIN)
- Cloudflare DNS with CDN proxy for capthca.ai and staging.capthca.ai
- Admin users managed via Secret Manager (`CAPTHCA_LAND_ADMIN_USERS`)
- Ambient audio with real tracks, module-level singleton for seamless cross-navigation playback
- Vertical mobile slider with mirrored content layout (drag up/down)
- Mobile hamburger navigation with 44px touch targets
- CTA email capture on every page (content-driven from markdown)
- All landing page copy from content system (no hardcoded prose in JSX)
- 14 inner pages rendered from markdown content system (remark/rehype pipeline)
- Unified nav bar with page links on all track pages
- Nonce-based CSP (no unsafe-inline in script-src)
- Subscriber management scripts (list, count, export, delete)
- Subscriber enrichment (timezone, locale, screen, device, geo)
- Social sharing cards (OG + Twitter) with track-specific images
- API route coverage test (auto-discovers untested routes)
- CI pipeline with ci:full (lint + typecheck + test + build)
- Production deployment at capthca.ai
- Staging deployment at staging.capthca.ai (basic auth + Cloudflare Access)

### Not Yet Done
- Welcome emails for subscribers
- Custom date range picker for analytics
- Expanded analytics (traffic sources, devices, geography)
- Local Cloud Build testing script
- Next.js 15 migration (audit vulns require 15.5.10+)
- Automated browser testing (Playwright/Cypress)
- Remove staging basic auth (fully transition to CF Access)

### Known Limitations
- Rate limiter is in-memory (resets on container restart, not shared across instances)
- Turnstile CSP warning from widget iframe (cosmetic, Cloudflare-side)
- Next.js 14.x audit vulns (9 total) — project not exposed, require 15.5.10+ to fix
- GA4 shared between staging and production (staging traffic pollutes production data)
- GA4 Data API requires service account Viewer role on GA4 property

---

## Documentation Map

| Document | Location | Purpose |
|----------|----------|---------|
| Project rules | `CLAUDE.md` | Auto-loaded project conventions |
| Project charter | `docs/PROJECT_CHARTER.md` | Goals, scope, decisions |
| Agent memory | `.claude/MEMORY.md` | Persistent lessons and state |
| Active sprint | `TODO.md` | Current sprint tasks and DoD |
| Backlog | `docs/process/KANBAN.md` | Prioritized work items |
| Sprint handovers | `docs/sprints/SPRINT{N}_HANDOVER.md` | Per-sprint knowledge transfer |
| Security review | `docs/security/SPRINT1_REVIEW.md` | Sprint 1 security audit |
| Process docs | `docs/process/` | Templates, checklists, standards |
| Component strategy | `docs/COMPONENT_STRATEGY.md` | Shared component architecture |
| Content system | `content/CONTENT_SYSTEM.md` | How page copy is structured and rendered |
| Content (light) | `content/light/` | Light track section-by-section copy |
| Content (dark) | `content/dark/` | Dark track section-by-section copy |
| Research briefs | `content/research/` | Research supporting landing page narrative |
| Implementation plans | `docs/plans/` | Feature implementation plans |
| Research (legacy) | `docs/research/` | Storyboards, manifestos, visual research |

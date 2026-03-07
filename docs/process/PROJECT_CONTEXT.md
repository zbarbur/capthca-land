# Project Context — CAPTHCA land

> This file provides a high-level snapshot of the project's current state.
> Updated at the end of every sprint. See `SPRINT_END_CHECKLIST.md`.

---

## Status

| Field | Value |
|-------|-------|
| **Status** | Active — Sprint 3 Closed, Sprint 4 Planning |
| **Last Sync** | 2026-03-07 |
| **Current Sprint** | Sprint 3 Closed |
| **Objective** | Dual-narrative landing page at capthca.ai with email capture |

---

## Architecture Summary

```
┌──────────────────────────────────────────────────┐
│         capthca.ai (production)                   │
│         staging.capthca.ai (basic auth)           │
│                                                    │
│  ┌─────────────┐  ┌───────────┐  ┌────────────┐  │
│  │  Duality     │  │  /light   │  │  /dark     │  │
│  │  Slider (/)  │──│  track    │  │  track     │  │
│  └──────┬──────┘  └─────┬─────┘  └─────┬──────┘  │
│         │               │              │          │
│         └───────────┬───┘──────────────┘          │
│                     │                              │
│  ┌──────────────────┼──────────────────────────┐  │
│  │ /api/subscribe   │  /api/health  /api/analytics│
│  │ + Turnstile      │                             │
│  │ + rate limit     │  Structured JSON logging    │
│  │ + SecretProv     │  Custom metrics             │
│  └──────────────────┼─────────────────────────┘  │
│                     │                              │
└─────────────────────┼──────────────────────────────┘
                      │
               ┌──────┴──────┐
               │  Firestore   │
               │  (prefixed:  │
               │  stg_/prd_/  │
               │  local_)     │
               └─────────────┘
```

- **Frontend:** Next.js 14 (App Router) with SSR on Cloud Run
- **Styling:** Tailwind CSS with CSS variable theme switching (`.theme-light` / `.theme-dark`)
- **API:** Next.js API routes (`/api/subscribe`, `/api/health`, `/api/analytics`)
- **Database:** Firestore (email collection with track preference, env-prefixed)
- **Hosting:** GCP Cloud Run (auto-scaling, standalone Next.js output)
- **CI/CD:** Cloud Build (cloudbuild.yaml -> staging on push, cloudbuild-deploy.yaml -> production manual)
- **Security:** Turnstile CAPTCHA, honeypot, rate limiter, CSP, HSTS, staging basic auth, SecretProvider
- **Secrets:** SecretProvider abstraction (`CAPTHCA_LAND_` prefix), GCP Secret Manager in prod/staging
- **Observability:** Structured JSON logging, custom metrics, analytics instrumentation, health endpoint

---

## Infrastructure

| Component | Technology | Environment | Notes |
|-----------|-----------|-------------|-------|
| Frontend + API | Next.js 14 | Cloud Run | Standalone output, SSR |
| Database | Firestore | GCP (`capthca-489205`) | Env-prefixed collections (stg_/prd_/local_) |
| Production | capthca.ai | Cloud Run domain mapping | Managed SSL cert, blue/green deploy |
| Staging | staging.capthca.ai | Cloud Run CNAME | Managed SSL cert, basic auth |
| CI/CD | Cloud Build | GCP | Auto on push (staging), manual (prod) |
| Secrets | Secret Manager + SecretProvider | GCP | `CAPTHCA_LAND_*` env var naming |
| CAPTCHA | Cloudflare Turnstile | Cloudflare | Invisible mode |
| Images | next/image | Cloud Run | Optimization at serve time |

---

## Test Coverage

| Metric | Value |
|--------|-------|
| **Total Tests** | 63 |
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
| 3 | Visual polish + Production | Completed | 63 | DualitySlider rebuild, visual assets, observability stack, production deploy to capthca.ai |

---

## Current State

### Working
- Cinematic duality slider with drag-to-navigate, entrance animations, glassmorphism vs Matrix rain
- Light track: glassmorphism, gradient orbs, smooth scroll reveal, pull quotes
- Dark track: Matrix digital rain, glitch text, CRT scanlines, alert pulse, HUD brackets
- Email capture with Turnstile CAPTCHA + honeypot + rate limiting
- SecretProvider abstraction for all server-side secrets
- Firestore env-prefixed collections (stg_/prd_/local_)
- HSTS + CSP + security non-regression tests
- Subscriber data enrichment (IP, user agent, referer, language)
- Structured JSON logging (Cloud Logging compatible)
- Health endpoint `/api/health` with Firestore connectivity check
- Custom metrics for subscribe API
- Analytics instrumentation (slider interactions)
- Request logging for abuse monitoring
- CI pipeline (lint + typecheck + test + build)
- Production deployment at capthca.ai (SSL provisioned)
- Staging deployment at staging.capthca.ai (basic auth protected)
- Content system (`content/`) with markdown + YAML frontmatter
- SVG favicon + full SEO metadata + Open Graph tags
- Generated visual assets for both tracks

### Not Yet Done
- www.capthca.ai CNAME DNS record
- Cloudflare DNS migration
- Mobile slider drag-to-navigate
- Remove V4 references from copy
- Subscriber management scripts

### Known Limitations
- Rate limiter is in-memory (resets on container restart, not shared across instances)
- Turnstile CSP warning from widget iframe (cosmetic, Cloudflare-side)

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

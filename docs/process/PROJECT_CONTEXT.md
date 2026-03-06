# Project Context — CAPTHCA land

> This file provides a high-level snapshot of the project's current state.
> Updated at the end of every sprint. See `SPRINT_END_CHECKLIST.md`.

---

## Status

| Field | Value |
|-------|-------|
| **Status** | Active — Sprint 2 Closed, Sprint 3 Planning |
| **Last Sync** | 2026-03-07 |
| **Current Sprint** | Sprint 2 Closed |
| **Objective** | Dual-narrative landing page at capthca.ai with email capture |

---

## Architecture Summary

```
┌──────────────────────────────────────────────────┐
│              staging.capthca.ai                   │
│           (basic auth protected)                  │
│                                                    │
│  ┌─────────────┐  ┌───────────┐  ┌────────────┐  │
│  │  Duality     │  │  /light   │  │  /dark     │  │
│  │  Slider (/)  │──│  track    │  │  track     │  │
│  └──────┬──────┘  └─────┬─────┘  └─────┬──────┘  │
│         │               │              │          │
│         └───────────┬───┘──────────────┘          │
│                     │                              │
│              ┌──────┴──────┐                       │
│              │ /api/subscribe│                      │
│              │ + Turnstile  │                       │
│              │ + honeypot   │                       │
│              │ + rate limit │                       │
│              │ + SecretProv │                       │
│              └──────┬──────┘                       │
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
- **API:** Next.js API routes (single `/api/subscribe` endpoint for MVP)
- **Database:** Firestore (email collection with track preference, env-prefixed)
- **Hosting:** GCP Cloud Run (auto-scaling, standalone Next.js output)
- **CI/CD:** Cloud Build (cloudbuild.yaml → staging, cloudbuild-deploy.yaml → production)
- **Security:** Turnstile CAPTCHA, honeypot, rate limiter, CSP, HSTS, staging basic auth, SecretProvider
- **Secrets:** SecretProvider abstraction (`CAPTHCA_LAND_` prefix), GCP Secret Manager in prod/staging

---

## Infrastructure

| Component | Technology | Environment | Notes |
|-----------|-----------|-------------|-------|
| Frontend + API | Next.js 14 | Cloud Run | Standalone output, SSR |
| Database | Firestore | GCP (`capthca-489205`) | Env-prefixed collections (stg_/prd_/local_) |
| Domain | staging.capthca.ai | Cloud Run CNAME | Managed SSL cert |
| CI/CD | Cloud Build | GCP | Auto on push (staging), manual (prod) |
| Secrets | Secret Manager + SecretProvider | GCP | `CAPTHCA_LAND_*` env var naming |
| CAPTCHA | Cloudflare Turnstile | Cloudflare | Invisible mode |
| Images | next/image | Cloud Run | Optimization at serve time |

---

## Test Coverage

| Metric | Value |
|--------|-------|
| **Total Tests** | 30 |
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

---

## Current State

### Working
- Duality slider React component with mouse/touch support
- Light track: glassmorphism, gradient orbs, smooth scroll reveal, pull quotes
- Dark track: Matrix digital rain, glitch text, CRT scanlines, alert pulse, HUD brackets
- Email capture with Turnstile CAPTCHA + honeypot + rate limiting
- SecretProvider abstraction for all server-side secrets
- Firestore env-prefixed collections (stg_/prd_/local_)
- HSTS + CSP + security non-regression tests
- Subscriber data enrichment (IP, user agent, referer, language)
- CI pipeline (lint + typecheck + test + build)
- Staging deployment at staging.capthca.ai (basic auth protected)
- Content system (`content/`) with markdown + YAML frontmatter
- SVG favicon + full SEO metadata + Open Graph tags

### Not Yet Done
- Production deploy (capthca.ai DNS not configured)
- Cloudflare DNS migration
- Home page rebuild (DualitySlider cinematic redesign)
- Structured logging + health endpoint + metrics
- Analytics instrumentation
- Subscriber management scripts

### Known Limitations
- Rate limiter is in-memory (resets on container restart, not shared across instances)
- Turnstile CSP warning from widget iframe (cosmetic, Cloudflare-side)
- No health endpoint (Cloud Run uses default TCP probe)
- No structured logging (stdout only)

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

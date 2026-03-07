# Project Context — CAPTHCA land

> This file provides a high-level snapshot of the project's current state.
> Updated at the end of every sprint. See `SPRINT_END_CHECKLIST.md`.

---

## Status

| Field | Value |
|-------|-------|
| **Status** | Active — Sprint 5 Closed, Sprint 6 Planning |
| **Last Sync** | 2026-03-08 |
| **Current Sprint** | Sprint 5 Closed |
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
| **Total Tests** | 113 |
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

---

## Current State

### Working
- 14 inner pages rendered from markdown content system (remark/rehype pipeline)
- Unified nav bar with page links on all track pages
- Nonce-based CSP (no unsafe-inline in script-src)
- Subscriber management scripts (list, count, export, delete)
- Subscriber enrichment (timezone, locale, screen, device, geo)
- Social sharing cards (OG + Twitter) with track-specific images
- API route coverage test (auto-discovers untested routes)
- Cinematic DualitySlider with edge-drag navigation, glassmorphism vs Matrix rain
- Light track: glassmorphism, gradient orbs, DNA helix borders, floating particles
- Dark track: Matrix digital rain, glitch text, CRT scanlines, alert pulse, HUD brackets
- Track pages aligned verbatim with content/ markdown system
- 17+ generated art assets wired into pages
- Email capture with Turnstile CAPTCHA + honeypot + rate limiting
- SecretProvider abstraction for all server-side secrets
- Firestore env-prefixed collections (stg_/prd_/local_)
- HSTS + CSP + security non-regression tests
- Subscriber data enrichment (IP, user agent, referer, language)
- Structured JSON logging (GCP Cloud Logging compatible)
- Health endpoint /api/health with Firestore connectivity check
- Custom metrics for subscribe API (log-based)
- Slider analytics instrumentation (privacy-first, no external SDK)
- CI pipeline (lint + typecheck + test + build)
- Production deployment at capthca.ai
- Staging deployment at staging.capthca.ai (basic auth protected)
- Content system (`content/`) with markdown + YAML frontmatter
- SVG favicon + full SEO metadata + Open Graph tags

### Not Yet Done
- Mobile slider / mobile home page experience
- Whitepaper diagram visual polish (spacing, mobile, animations)
- Cloudflare DNS migration (DDoS, CDN)
- Welcome emails for subscribers
- Local Cloud Build testing script
- Next.js upgrade (npm audit vulnerabilities)

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
| Research (legacy) | `docs/research/` | Storyboards, manifestos, visual research |

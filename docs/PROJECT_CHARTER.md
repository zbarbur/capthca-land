# Project Charter — CAPTHCA land

**Created:** 2026-03-03
**Last reviewed:** 2026-03-03
**Status:** Active

---

## Mission Statement

CAPTHCA land is a dual-narrative landing page for the CAPTHCA identity protocol initiative. It presents visitors with a choice between two worldviews — **Symbiotic (Light)** and **Post-Biological (Dark)** — through an interactive duality slider, then funnels them into deeper track-specific content. The goal is to convert curious visitors into engaged email subscribers who have consciously chosen a perspective.

## Problem Statement

The CAPTHCA protocol initiative needs a public-facing entry point that communicates its dual-narrative vision and captures early interest. Without it, there is no way to build an audience, gauge which narrative resonates, or create a community around the protocol.

## Goals & Success Metrics

### North Star Metric
**Visitor → email signup conversion rate** (segmented by track choice)

### Key Results
| Goal | Metric | Target | Timeframe |
|------|--------|--------|-----------|
| Launch MVP | Live at capthca.ai | Functional slider + email capture | Sprint 1-2 |
| Visitor acquisition | Unique visitors / month | 1,000 | 3 months post-launch |
| Email conversion | Signup rate | 5%+ | 3 months post-launch |
| Track engagement | Avg slider interaction time | > 10 seconds | 3 months post-launch |
| Track balance | Light vs Dark signup ratio | Track and report | Ongoing |

### Anti-Goals (Explicitly Out of Scope)
- **No user accounts or authentication** — this is a landing page, not a platform
- **No commerce or payments** — no monetization in the foreseeable future
- **No social features** — no comments, forums, or UGC
- **No CMS** — content is code-managed, not editor-managed
- **No complex email automation in MVP** — store emails in Firestore first, transactional emails are roadmap

## Target Users

### Persona 1: The Curious Explorer
- **Who:** AI-curious individuals who encounter CAPTHCA through social media, word of mouth, or search
- **Needs:** Understand what CAPTHCA is about in 30 seconds, feel drawn to explore
- **Pain points:** Most AI protocol sites are dry and technical
- **Success criteria:** They interact with the slider, read at least one track, and sign up

### Persona 2: The AI Professional
- **Who:** People working in AI, tech policy, or digital ethics
- **Needs:** A provocative framework for thinking about human-AI identity
- **Pain points:** Binary "AI good / AI bad" discourse lacks nuance
- **Success criteria:** They explore both tracks and share the site

## Use Cases

### Core Use Cases (MVP)
| ID | User | Use Case | Priority |
|----|------|----------|----------|
| UC-1 | Explorer | Land on capthca.ai, interact with duality slider, understand the two perspectives | Must-have |
| UC-2 | Explorer | Choose a track (light or dark) and enter the deeper narrative | Must-have |
| UC-3 | Explorer | Submit email from within their chosen track | Must-have |
| UC-4 | Any | View the site on mobile with full slider and track functionality | Must-have |

### Future Use Cases (Post-MVP)
| ID | User | Use Case | Priority |
|----|------|----------|----------|
| UC-F1 | Subscriber | Receive a welcome email with content aligned to their chosen track | Should-have |
| UC-F2 | Any | Deep-dive multi-section pages for each track (manifesto, visuals, philosophy) | Should-have |
| UC-F3 | Any | Share their track choice on social media with a generated card | Nice-to-have |
| UC-F4 | Operator | View analytics dashboard showing track preference distribution | Nice-to-have |

## Constraints

### Technical
- **Framework:** Next.js 14 (App Router) — already scaffolded
- **Hosting:** GCP Cloud Run — Dockerfile and deploy scripts ready
- **Domain:** capthca.ai (registered, DNS manually managed)
- **Styling:** Tailwind CSS with class-based theme switching
- **Linting:** Biome v2, Node.js built-in test runner

### Resource
- **Team:** Solo human orchestrator + Claude Code agentic squad
- **Time:** Ship MVP ASAP (days), iterate from there

### Compliance & Security
- **Email storage:** Firestore — no sensitive data beyond email addresses
- **No auth required** for visitors
- **Rate limiting** on email submission endpoint (spam prevention)

### External Dependencies
- GCP project with Cloud Run and Firestore enabled
- capthca.ai DNS access (manual)
- Image assets for both tracks (already generated in `tracks/*/assets/`)

## MVP Definition

### What's In
1. **Duality Slider page** — Convert `index.html` to a Next.js page with the interactive slider, served at `/`
2. **Email capture** — Server-side `/api/subscribe` endpoint storing to Firestore, with track preference (light/dark)
3. **Basic track pages** — `/light` and `/dark` routes with narrative content from existing `tracks/` HTML
4. **Mobile responsive** — Slider and tracks work on mobile/touch
5. **Analytics instrumentation** — Track slider interactions, track choice, and email conversions
6. **Cloud Run deployment** — Live at capthca.ai via existing deploy pipeline

### What's Out (First Release)
1. **Transactional emails** — revisit Sprint 3+
2. **Deep multi-section track pages** — revisit after MVP feedback on which track gets more traction
3. **Social sharing cards** — revisit Sprint 3+
4. **Analytics dashboard** — use GCP/simple tooling initially

### MVP Success Criteria
- [ ] capthca.ai serves the duality slider page
- [ ] Slider interaction works on desktop and mobile
- [ ] Users can navigate from slider to light or dark track page
- [ ] Email signup works on both tracks, persisted to Firestore with track preference
- [ ] Basic analytics tracking slider engagement and conversions
- [ ] Page loads in < 3 seconds

## Technical Architecture Decisions

| Decision | Choice | Rationale | Revisit if... |
|----------|--------|-----------|---------------|
| Framework | Next.js 14 (App Router) | Already scaffolded, SSR for SEO, API routes for email | Traffic exceeds Cloud Run scaling |
| Hosting | GCP Cloud Run | Existing infra, auto-scaling, pay-per-use | Need edge/CDN globally |
| Database | Firestore | Simple email storage, no schema needed, GCP-native | Need relational queries or email automation |
| Styling | Tailwind CSS + CSS variables | Theme switching via classes, existing design tokens | - |
| Analytics | Custom events + lightweight tracker | Track slider + conversions without heavy SDK | Need deeper funnel analysis |
| Email (future) | TBD (Resend/SendGrid) | Not in MVP — Firestore-only for now | When welcome emails are prioritized |

## Squad Composition

| Role | Specialist | Why This Role |
|------|-----------|---------------|
| Primary | Frontend/UI Agent | Converting static HTML to React components, slider interaction |
| Secondary | Infrastructure Agent | Cloud Run deployment, Firestore setup, DNS |
| Support | Design Agent | Polishing themes, responsive layout, animations |
| Support | Testing Agent | E2E slider tests, email endpoint tests |

## Sprint Allocation Strategy

| Phase | Features | Tech Debt | Security | Testing | Docs |
|-------|----------|-----------|----------|---------|------|
| Sprint 1-2 (MVP) | 80% | 5% | 5% | 5% | 5% |
| Sprint 3-4 (Polish) | 60% | 15% | 10% | 10% | 5% |
| Sprint 5+ (Growth) | 50% | 15% | 10% | 15% | 10% |

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Slider feels gimmicky on mobile | Med | High | Invest in touch UX, test on real devices early |
| Low conversion rate | Med | High | A/B test CTA copy, email placement; iterate fast |
| Firestore cold starts on Cloud Run | Low | Med | Keep container warm or use min-instances=1 |
| Asset images are too large | Med | Med | Optimize/compress images, use next/image |

## Milestones

| Milestone | Target | Criteria |
|-----------|--------|----------|
| MVP Live | Sprint 1-2 | Slider + email capture + both tracks live at capthca.ai |
| Email automation | Sprint 3-4 | Welcome emails sent on signup, track-specific content |
| Deep tracks | Sprint 4-5 | Multi-section narrative pages for each track |
| Growth tooling | Sprint 6+ | Social sharing, analytics dashboard, A/B testing |

## Decision Log

| Date | Decision | Context | Alternatives Considered |
|------|----------|---------|------------------------|
| 2026-03-03 | Next.js on Cloud Run for MVP | Existing infra, need SSR + API routes | Static export + form service (rejected: less control) |
| 2026-03-03 | Firestore for email storage | Simplest GCP-native option, upgrade path clear | Sheets (too fragile), Supabase (unnecessary complexity) |
| 2026-03-03 | Ship ASAP, iterate | Prototype already works, real data > more planning | Longer polish cycle (rejected: delays learning) |

---

*This charter is a living document. Review at every roadmap check (`/plan roadmap`).
Update the Decision Log when significant decisions are made during sprints.*

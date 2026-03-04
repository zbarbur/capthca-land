# KANBAN — CAPTHCA land

> This file is the single source of truth for the project backlog.
> `TODO.md` contains only the active sprint's tasks.
> Items flow: **Backlog** --> **Doing** --> **Done**

---

## Sprint {N} — Doing

<!-- Move items here from Backlog when sprint starts. Clear this section at sprint end. -->

_(empty — no active sprint)_

---

## Backlog

### MVP (Sprint 1-2)
- [infra] Local dev stack — Tailwind + PostCSS build, hot reload, local Firestore emulator (M)
- [ui] Convert index.html duality slider to Next.js React component (L)
- [ui] Build light track page at /light with narrative content from tracks/light (M)
- [ui] Build dark track page at /dark with narrative content from tracks/dark (M)
- [ui] Mobile-responsive slider with touch support (M)
- [ui] Theme switching system — CSS variables + Tailwind class toggle (S)
- [api] POST /api/subscribe endpoint — validate email, store to Firestore with track preference (M)
- [infra] Firestore setup for email collection (S)
- [infra] Cloud Run deployment to capthca.ai (M)
- [infra] DNS configuration for capthca.ai → Cloud Run (S)
- [ui] Email capture forms on both tracks with inline validation (S)
- [analytics] Instrument slider interaction events (track choice, time spent) (M)
- [ui] Optimize images with next/image, compress track assets (S)
- [ui] SEO meta tags + Open Graph for social sharing (S)
- [security] Pre-launch security review — rate limiting, input validation, CORS, CSP headers (M)

### Post-MVP (Sprint 3+)
- [email] Welcome email on signup — track-specific content (M)
- [email] Email provider integration (Resend or SendGrid) (M)
- [ui] Deep multi-section narrative pages for each track (L)
- [ui] Social sharing cards with track-specific generated images (M)
- [analytics] Analytics dashboard — track preference distribution, conversion funnel (M)
- [ui] Animated transitions between slider positions (S)
- [ui] Sound/ambient audio per track (experimental) (M)

---

## Tech Debt

_(add tech debt items here)_

---

## Done

_(completed items will appear here)_

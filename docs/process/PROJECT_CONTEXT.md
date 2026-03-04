# Project Context — CAPTHCA land

> This file provides a high-level snapshot of the project's current state.
> Updated at the end of every sprint. See `SPRINT_END_CHECKLIST.md`.

---

## Status

| Field | Value |
|-------|-------|
| **Status** | Active — Pre-Sprint 1 |
| **Last Sync** | 2026-03-03 |
| **Current Sprint** | Sprint 0 (Inception) |
| **Objective** | Dual-narrative landing page at capthca.ai with email capture |

---

## Architecture Summary

```
┌──────────────────────────────────────────────────┐
│                  capthca.ai                       │
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
│              └──────┬──────┘                       │
│                     │                              │
└─────────────────────┼──────────────────────────────┘
                      │
               ┌──────┴──────┐
               │  Firestore   │
               │  (emails +   │
               │   track pref)│
               └─────────────┘
```

- **Frontend:** Next.js 14 (App Router) with SSR on Cloud Run
- **Styling:** Tailwind CSS with CSS variable theme switching (`.theme-light` / `.theme-dark`)
- **API:** Next.js API routes (single `/api/subscribe` endpoint for MVP)
- **Database:** Firestore (email collection with track preference)
- **Hosting:** GCP Cloud Run (auto-scaling, standalone Next.js output)
- **CI/CD:** Cloud Build (cloudbuild.yaml → staging, cloudbuild-deploy.yaml → production)

---

## Infrastructure

| Component | Technology | Environment | Notes |
|-----------|-----------|-------------|-------|
| Frontend + API | Next.js 14 | Cloud Run | Standalone output, SSR |
| Database | Firestore | GCP | Email + track preference storage |
| Domain | capthca.ai | Manual DNS | A record → Cloud Run |
| CI/CD | Cloud Build | GCP | Auto on push (staging), manual (prod) |
| Images | next/image | Cloud Run | Optimization at serve time |

---

## Test Coverage

| Metric | Value |
|--------|-------|
| **Total Tests** | 5 |
| **Test Runner** | Node.js built-in (`node --test`) |
| **Test Command** | `npm test` |
| **CI Command** | `npm run ci` |
| **Test Files** | `test/example.test.ts`, `test/infra/dependency-completeness.test.ts` |

---

## Sprint History

| Sprint | Theme | Status | Tests | Key Deliverables |
|--------|-------|--------|-------|-----------------|
| 0 | Project inception | Completed | 5 | Template init, charter, backlog |

---

## Current State

### Working
- Static duality slider prototype (index.html)
- CI pipeline (lint + typecheck + test)
- Deploy scripts (staging + production)
- Track content and assets (light + dark)

### In Progress
- Nothing yet — Sprint 1 not started

### Known Limitations
- No React components yet (static HTML only)
- No email capture backend
- Not deployed to capthca.ai
- No analytics instrumentation

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
| Process docs | `docs/process/` | Templates, checklists, standards |
| Component strategy | `docs/COMPONENT_STRATEGY.md` | Shared component architecture |
| Research | `docs/research/` | Storyboards, manifestos, visual research |

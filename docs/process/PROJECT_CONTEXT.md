# Project Context — CAPTHCA land

> This file provides a high-level snapshot of the project's current state.
> Updated at the end of every sprint. See `SPRINT_END_CHECKLIST.md`.

---

## Status

| Field | Value |
|-------|-------|
| **Status** | _Planning / Active / Maintenance_ |
| **Last Sync** | _YYYY-MM-DD_ |
| **Current Sprint** | _Sprint N_ |
| **Objective** | _One-sentence project objective_ |

---

## Architecture Summary

_Describe the high-level architecture of the project. Include:_
- _System components and their responsibilities_
- _How components communicate_
- _Key technology choices and rationale_
- _Data flow overview_

```
Example:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────>│   API       │────>│  Database    │
│  (Next.js)   │<────│  (Node.js)  │<────│ (Firestore)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## Infrastructure

| Component | Technology | Environment | Notes |
|-----------|-----------|-------------|-------|
| _Frontend_ | _e.g., Next.js 14_ | _e.g., Cloud Run_ | _e.g., Standalone output_ |
| _API_ | _e.g., Node.js_ | _e.g., Cloud Run_ | _e.g., Auto-scaling_ |
| _Database_ | _e.g., Firestore_ | _e.g., GCP_ | _e.g., Prefix-based multi-tenancy_ |
| _Search_ | _e.g., Typesense_ | _e.g., GCE VM_ | _e.g., Caddy reverse proxy_ |
| _CI/CD_ | _e.g., Cloud Build_ | _e.g., GCP_ | _e.g., cloudbuild.yaml_ |

---

## Test Coverage

| Metric | Value |
|--------|-------|
| **Total Tests** | _N_ |
| **Test Runner** | _Node.js built-in (`node --test`)_ |
| **Test Command** | `npm test` |
| **CI Command** | `npm run ci` |
| **Test Files** | _list key test directories_ |

---

## Sprint History

| Sprint | Theme | Status | Tests | Key Deliverables |
|--------|-------|--------|-------|-----------------|
| _1_ | _Project setup_ | _Completed_ | _N_ | _Initial scaffolding, CI pipeline_ |
| _2_ | _Core features_ | _Completed_ | _N_ | _Auth, basic CRUD_ |
| _..._ | _..._ | _..._ | _..._ | _..._ |

---

## Current State

_Describe what the project can do right now. What features are working? What is the user experience? What are the known limitations?_

### Working
- _Feature 1_
- _Feature 2_

### In Progress
- _Feature 3 (Sprint N)_

### Known Limitations
- _Limitation 1_
- _Limitation 2_

---

## Documentation Map

| Document | Location | Purpose |
|----------|----------|---------|
| Project rules | `CLAUDE.md` | Auto-loaded project conventions |
| Agent memory | `MEMORY.md` | Persistent lessons and state |
| Active sprint | `TODO.md` | Current sprint tasks and DoD |
| Backlog | `docs/process/KANBAN.md` | Prioritized work items |
| Sprint handovers | `docs/sprints/SPRINT{N}_HANDOVER.md` | Per-sprint knowledge transfer |
| Process docs | `docs/process/` | Templates, checklists, standards |
| Architecture | _docs/architecture/_ | _(if applicable)_ |
| Research | _docs/research/_ | _(if applicable)_ |

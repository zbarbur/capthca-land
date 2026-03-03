---
name: plan
description: Project inception and strategic planning. Create project charters, define MVP scope, review roadmaps, and balance sprint allocation across features, maintenance, and security.
---

# Plan Skill

You are performing project planning for {{PROJECT_NAME}}. The user invoked `/plan $ARGUMENTS`.

## Determine Mode

Parse arguments:

| Argument | Mode | When | Output |
|----------|------|------|--------|
| `project` | Project Inception | Once, before Sprint 1 | Project Charter |
| `roadmap` | Roadmap Review | Every 3-5 sprints or on demand | Roadmap Assessment |
| `sprint` | Sprint Allocation | At sprint start | Sprint balance recommendation |
| `scope [feature]` | Scope Analysis | When evaluating a feature | Scope breakdown with effort estimate |

## Mode: Project Inception (`/plan project`)

This is the foundational planning exercise. It produces a **Project Charter** — the decision-making anchor for everything that follows.

### Phase 1: Discovery Interview

Ask the user structured questions to understand the project. Don't assume — ask explicitly.

**Problem Space:**
1. What problem does this project solve?
2. Who experiences this problem? (target users/personas)
3. How is the problem currently solved? (existing alternatives, manual processes)
4. What happens if this project doesn't get built?

**Vision:**
5. What does success look like in 6 months? In 1 year?
6. What is the single most important metric this project should move? (north star)
7. What is explicitly NOT in scope? (anti-goals)

**Constraints:**
8. What technical constraints exist? (language, platform, integrations, compliance)
9. What resource constraints exist? (time, team size, budget)
10. What external dependencies exist? (APIs, approvals, data access)
11. Are there hard deadlines? (launch dates, compliance deadlines, events)

**Users & Use Cases:**
12. Who are the primary user types? (roles, personas)
13. For each user type: what are the 3-5 core things they need to do?
14. Which use case is the most critical to get right first?

**Technical Landscape:**
15. What systems/services will this integrate with?
16. What data will this project own, consume, and produce?
17. What security/compliance requirements exist? (auth, encryption, audit trails, regulations)
18. Are there performance requirements? (latency, throughput, availability)

### Phase 2: Synthesize Project Charter

Based on the discovery answers, produce `docs/PROJECT_CHARTER.md`:

```markdown
# Project Charter — {{PROJECT_NAME}}

**Created:** [date]
**Last reviewed:** [date]
**Status:** Active | Paused | Completed

---

## Mission Statement

[One paragraph — what this project does, for whom, and why it matters. This is the squad's decision-making compass.]

## Problem Statement

[What problem exists, who has it, and what the cost of inaction is.]

## Goals & Success Metrics

### North Star Metric
[The single most important measure of success]

### Key Results
| Goal | Metric | Target | Timeframe |
|------|--------|--------|-----------|
| [Goal 1] | [How to measure] | [Target value] | [By when] |
| [Goal 2] | [How to measure] | [Target value] | [By when] |
| [Goal 3] | [How to measure] | [Target value] | [By when] |

### Anti-Goals (Explicitly Out of Scope)
- [Thing we will NOT build and why]
- [Thing we will NOT optimize for and why]

## Target Users

### Persona 1: [Name/Role]
- **Who:** [Description]
- **Needs:** [What they need to accomplish]
- **Pain points:** [Current frustrations]
- **Success criteria:** [How they know the tool works for them]

### Persona 2: [Name/Role]
[Same structure]

## Use Cases

### Core Use Cases (MVP)
| ID | User | Use Case | Priority |
|----|------|----------|----------|
| UC-1 | [Persona] | [As a X, I need to Y, so that Z] | Must-have |
| UC-2 | [Persona] | [As a X, I need to Y, so that Z] | Must-have |
| UC-3 | [Persona] | [As a X, I need to Y, so that Z] | Must-have |

### Future Use Cases (Post-MVP)
| ID | User | Use Case | Priority |
|----|------|----------|----------|
| UC-F1 | [Persona] | [As a X, I need to Y, so that Z] | Should-have |
| UC-F2 | [Persona] | [As a X, I need to Y, so that Z] | Nice-to-have |

## Constraints

### Technical
- [Language/framework constraints and rationale]
- [Platform/infrastructure constraints]
- [Integration requirements]

### Resource
- [Team size and composition]
- [Time constraints]
- [Budget constraints]

### Compliance & Security
- [Regulatory requirements (GDPR, SOC2, HIPAA, etc.)]
- [Security requirements (encryption, auth, audit)]
- [Data residency requirements]

### External Dependencies
- [External APIs or services required]
- [Third-party approvals needed]
- [Data access requirements]

## MVP Definition

### What's In
[Concrete list of features/capabilities in the MVP]

1. [Feature 1] — [why it's essential]
2. [Feature 2] — [why it's essential]
3. [Feature 3] — [why it's essential]

### What's Out (First Release)
[What we intentionally defer — and when we expect to revisit]

1. [Deferred feature] — revisit in Sprint [N]
2. [Deferred feature] — revisit after MVP feedback

### MVP Success Criteria
- [ ] [Verifiable outcome 1]
- [ ] [Verifiable outcome 2]
- [ ] [Verifiable outcome 3]

## Technical Architecture Decisions

Decisions made at project inception that constrain future sprints:

| Decision | Choice | Rationale | Revisit if... |
|----------|--------|-----------|---------------|
| Language | [e.g., TypeScript] | [Why] | [Under what conditions we'd reconsider] |
| Framework | [e.g., Next.js 14] | [Why] | [Trigger for reassessment] |
| Database | [e.g., Firestore] | [Why] | [Scaling threshold] |
| Hosting | [e.g., Cloud Run] | [Why] | [Cost/traffic trigger] |
| Auth | [e.g., Session + API tokens] | [Why] | [Requirements change] |

## Squad Composition

| Role | Specialist | Why This Role |
|------|-----------|---------------|
| [Primary] | [From SQUAD_PLANNING.md] | [Why this specialist is needed] |
| [Secondary] | [From SQUAD_PLANNING.md] | [Why this specialist is needed] |
| [Support] | [From SQUAD_PLANNING.md] | [When to bring in] |

## Sprint Allocation Strategy

Recommended allocation across sprint capacity:

| Phase | Features | Tech Debt | Security | Testing | Docs |
|-------|----------|-----------|----------|---------|------|
| Sprints 1-3 (Foundation) | 70% | 10% | 10% | 5% | 5% |
| Sprints 4-6 (Build-out) | 60% | 15% | 10% | 10% | 5% |
| Sprints 7-9 (Hardening) | 40% | 20% | 15% | 15% | 10% |
| Sprint 10+ (Maturity) | 40% | 20% | 15% | 15% | 10% |

Adjust based on project phase and external pressures.

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [Risk 1] | Low / Med / High | Low / Med / High | [How we address it] |
| [Risk 2] | Low / Med / High | Low / Med / High | [How we address it] |

## Milestones

| Milestone | Target | Criteria |
|-----------|--------|----------|
| MVP | Sprint [N] | [What must be true] |
| Beta | Sprint [N] | [What must be true] |
| GA / v1.0 | Sprint [N] | [What must be true] |

## Decision Log

| Date | Decision | Context | Alternatives Considered |
|------|----------|---------|------------------------|
| [date] | [What was decided] | [Why it came up] | [What else was considered] |

---

*This charter is a living document. Review at every roadmap check (`/plan roadmap`).
Update the Decision Log when significant decisions are made during sprints.*
```

### Phase 3: Initialize Project Artifacts

After the charter is written and confirmed by the user:

1. **Populate KANBAN.md backlog** — translate MVP use cases into concrete backlog items
2. **Populate PROJECT_CONTEXT.md** — fill in architecture, infrastructure, and environment sections
3. **Write initial MEMORY.md** — key project decisions, environment details, tool references
4. **Suggest Sprint 1 scope** — recommend which backlog items to tackle first, considering dependencies

## Mode: Roadmap Review (`/plan roadmap`)

Periodic strategic checkpoint — are we still going the right direction?

### Step 1: Gather State

1. **Read the Project Charter** — `docs/PROJECT_CHARTER.md`
2. **Read current sprint status** — `TODO.md`
3. **Read KANBAN.md** — backlog size, tech debt accumulation
4. **Read sprint handovers** — recent deliverables and lessons
5. **Count sprints completed** vs milestones targeted

### Step 2: Assess Progress

For each goal in the charter:

```markdown
## Roadmap Review — Sprint [N]

**Date:** [date]
**Sprints completed:** [N]
**Next milestone:** [name] (target Sprint [M])

### Goal Progress

| Goal | Target | Current | Status | Notes |
|------|--------|---------|--------|-------|
| [Goal 1] | [Target] | [Current state] | On Track / At Risk / Behind | [Why] |
| [Goal 2] | [Target] | [Current state] | On Track / At Risk / Behind | [Why] |

### Use Case Coverage

| Use Case | Status | Sprint Delivered | Notes |
|----------|--------|-----------------|-------|
| UC-1 | Done / In Progress / Not Started | Sprint N | [Notes] |
| UC-2 | Done / In Progress / Not Started | — | [Blocker?] |

### Backlog Health

- **Backlog items:** [count] ([N] features, [N] tech debt, [N] security, [N] bugs)
- **Tech debt trend:** Growing / Stable / Shrinking
- **Oldest unaddressed debt:** [item] (since Sprint [N])
- **Security items pending:** [count]

### Sprint Allocation Actual vs Recommended

| Category | Recommended | Actual (last 3 sprints) | Assessment |
|----------|-------------|------------------------|------------|
| Features | [%] | [%] | Balanced / Over-investing / Under-investing |
| Tech Debt | [%] | [%] | ... |
| Security | [%] | [%] | ... |
| Testing | [%] | [%] | ... |
| Docs | [%] | [%] | ... |

### External Factors

- [Any new constraints, dependencies, or changes since last review]
- [Market changes, stakeholder feedback, compliance updates]

### Risks Updated

| Risk | Previous | Current | Change | Action |
|------|----------|---------|--------|--------|
| [Risk 1] | Med | High | ↑ | [What to do] |

### Recommendations

1. **[Highest priority adjustment]** — [rationale]
2. **[Next priority]** — [rationale]
3. **[Strategic suggestion]** — [rationale]

### Charter Updates Needed

- [ ] [Any goal that needs updating]
- [ ] [Any constraint that changed]
- [ ] [Any milestone that needs re-targeting]

### Next Review

Schedule next roadmap review at Sprint [N+3 to N+5].
```

### Step 3: Act on Findings

- If charter needs updates → edit `docs/PROJECT_CHARTER.md` with user approval
- If sprint allocation is imbalanced → factor into next `/sprint-start`
- If milestones slipped → reassess scope or timeline
- Add findings to MEMORY.md for sprint planning context

## Mode: Sprint Allocation (`/plan sprint`)

Lightweight mode for balancing the next sprint's content.

### Step 1: Read Current State

1. Read `docs/PROJECT_CHARTER.md` — allocation strategy for current phase
2. Read `docs/process/KANBAN.md` — all candidate items
3. Read recent handovers — what was the allocation in recent sprints

### Step 2: Categorize Backlog Items

For each item in KANBAN backlog and tech debt:

| Item | Category | Size | Priority | Urgency |
|------|----------|------|----------|---------|
| [Item] | Feature / Debt / Security / Test / Docs | S/M/L | High / Med / Low | Blocking / Soon / Eventually |

### Step 3: Recommend Sprint Composition

```markdown
## Sprint [N] Allocation Recommendation

**Phase:** [Foundation / Build-out / Hardening / Maturity]
**Recommended mix:** [from charter]

### Recommended Items

**Features ([%] of capacity):**
- [ ] [Item 1] (M) — [why now]
- [ ] [Item 2] (S) — [why now]

**Tech Debt ([%] of capacity):**
- [ ] [Item 3] (S) — [why now — e.g., blocking feature work]

**Security ([%] of capacity):**
- [ ] [Item 4] (S) — [why now — e.g., audit finding]

**Testing ([%] of capacity):**
- [ ] [Item 5] (S) — [why now — e.g., coverage gap in critical module]

### Items Deferred (and why)
- [Item X] — [reason: lower priority, blocked by Y, not aligned with current phase]

### Total: [N]S + [N]M + [N]L = [estimated sprint load]
```

## Mode: Scope Analysis (`/plan scope fleet identity profiles`)

Analyze a feature's scope before committing to build it.

### Step 1: Understand the Feature

1. Read the Project Charter — does this feature align with goals?
2. Search the codebase — what exists that this builds on?
3. Check KANBAN — is this already tracked?

### Step 2: Scope Breakdown

```markdown
## Scope Analysis: [Feature Name]

### Alignment
- **Charter goal:** [which goal this serves]
- **Use case:** [which UC this implements]
- **Priority:** Must-have / Should-have / Nice-to-have

### Breakdown

| Component | Description | Size | New/Modify |
|-----------|-------------|------|------------|
| [Data model] | [What needs to be designed] | S/M/L | New |
| [API endpoint(s)] | [What needs to be built] | S/M/L | New |
| [UI component(s)] | [What needs to be built] | S/M/L | New |
| [Business logic] | [What needs to be implemented] | S/M/L | New |
| [Tests] | [What needs to be tested] | S/M/L | New |
| [Migration] | [Data changes needed] | S/M/L | New |

### Dependencies
- **Requires:** [other features, infrastructure, or decisions]
- **Enables:** [what this unblocks for future work]

### Effort Estimate
- **Total:** [S / M / L / XL]
- **Sprint span:** [1 sprint / 2 sprints / needs decomposition]
- **Decomposition needed:** [Yes — suggest how to split / No — fits in one sprint]

### Suggested Task Breakdown (if multi-sprint)

**Sprint A:**
1. [Foundation task] (M)
2. [Data model task] (S)

**Sprint B:**
3. [API task] (M)
4. [UI task] (M)
5. [Integration test task] (S)

### Risks
- [Technical risk and mitigation]
- [Scope creep risk and boundary]

### Decision Needed
- [ ] [Any open question that must be answered before starting]
```

## Important Rules

- **The charter is the compass** — every sprint and feature should trace back to a charter goal. If it can't, either the charter needs updating or the work isn't justified.
- **Anti-goals are as important as goals** — explicitly stating what the project does NOT do prevents scope creep.
- **Ask, don't assume** — the discovery interview exists because requirements live in the user's head, not in the codebase.
- **MVP is a scalpel, not a machete** — minimum viable means the smallest thing that delivers value, not the cheapest thing you can build.
- **Review the charter regularly** — a charter that's never revisited becomes fiction. Use `/plan roadmap` every 3-5 sprints.
- **Sprint allocation is a guideline, not a law** — if a security incident occurs, 100% of the sprint goes to security. The percentages are defaults for normal operations.
- **Scope analysis prevents surprise large tasks** — always run `/plan scope` before committing a feature to a sprint if the effort is unclear.
- **Save the charter to `docs/PROJECT_CHARTER.md`** — it's a living document, version-controlled alongside the code.

# Context Maintenance — Memory, Handovers, Session Recovery

## The Three-Layer Context System

AI-assisted development requires structured context to maintain continuity across sessions. This system uses three layers, ordered by load priority:

| Layer | File | Loading | Purpose |
|---|---|---|---|
| Rules | `CLAUDE.md` | Auto-loaded every session | Project commands, code style, immutable rules |
| Memory | `MEMORY.md` | Auto-loaded (first 200 lines) | Project state, lessons learned, key decisions |
| Reference | `PROJECT_CONTEXT.md` | On-demand | Full architecture, test counts, sprint history |

### Why Three Layers?

- **Auto-loaded context has a budget.** Loading everything every session wastes context window on rarely-needed details.
- **Rules rarely change.** `CLAUDE.md` is project infrastructure — scripts, conventions, tool usage.
- **Memory evolves every sprint.** Lessons learned, environment details, current state.
- **Reference is deep context.** Architecture diagrams, full sprint history, module descriptions — only needed when diving deep.

## What Goes Where

### CLAUDE.md — Project Rules (Auto-Loaded)

This is the "constitution" of the project. It defines how to work, not what to work on.

**Include:**
- Required project scripts and commands (with "use this, not that" tables)
- Code style rules (linter, formatter, conventions)
- Test runner and test commands
- Deployment commands
- File/directory conventions
- Things that should NEVER be done (anti-commands)

**Exclude:**
- Sprint status, current tasks, lessons learned (these change — use MEMORY.md)
- Architecture details (use PROJECT_CONTEXT.md)
- Task planning (use TODO.md)

### MEMORY.md — Living State (Auto-Loaded, 200-Line Limit)

This is the "working memory" of the project. It captures what the AI agent needs to know right now.

**Include:**
- Project purpose (1-2 sentences)
- Key tool reference (condensed table, link to detail file)
- Current sprint status
- Lessons learned (per sprint, most recent first)
- Key architecture additions (recent, condensed)
- Environment details (URLs, IDs, credentials references)
- Important patterns and gotchas

**Exclude:**
- Full command documentation (use CLAUDE.md)
- Full architecture description (use PROJECT_CONTEXT.md)
- Task details (use TODO.md)
- Backlog (use KANBAN.md)

### PROJECT_CONTEXT.md — Deep Reference (On-Demand)

This is the "encyclopedia" — comprehensive but not needed every session.

**Include:**
- Full architecture description with diagrams
- Module inventory with descriptions
- Complete sprint history
- Test coverage numbers
- Infrastructure details
- Decision log (why we chose X over Y)

### TODO.md — Active Sprint Only

Contains only the current sprint's tasks with full specifications. No backlog. No completed sprints. Fresh each sprint.

### KANBAN.md — Backlog and Flow

Source of truth for backlog, tech debt, and sprint flow (Backlog -> Doing -> Done).

## Memory Maintenance Rules

### Keep Under 200 Lines

`MEMORY.md` is auto-loaded but truncated at 200 lines. If it grows beyond that, move detailed content into topic files.

```
MEMORY.md              ← Index (under 200 lines)
memory/
  tools-reference.md   ← Full tool documentation
  environments.md      ← Staging/production details
  architecture.md      ← Key architecture decisions
  lessons-sprint-N.md  ← Detailed lessons per sprint
```

### Organize by Topic, Not Chronology

```markdown
<!-- BAD — chronological, hard to find things -->
## 2024-01-15
- Fixed auth bug
- Deployed staging

## 2024-01-16
- Added rate limiting
- Fixed Docker build

<!-- GOOD — organized by topic, easy to scan -->
## Auth System
- Dual auth: session cookies + Bearer API tokens
- HMAC-SHA256 for sessions, SHA-256 for tokens

## Deployment
- Staging URL: https://staging.example.com
- Docker standalone output required
```

### Prune Aggressively

Every sprint, review MEMORY.md and remove:
- Lessons that are now encoded in CLAUDE.md rules
- Environment details that have not changed in 3+ sprints
- Architecture notes superseded by newer changes
- Anything that can be derived from the codebase itself

## Session Recovery Protocol

When starting a new session, context loads in this order:

1. **CLAUDE.md** (auto) — "How do I work in this project?"
2. **MEMORY.md** (auto) — "What is the current state?"
3. **TODO.md** (read on demand) — "What am I working on?"
4. **Latest sprint handover** (read on demand) — "What just happened?"
5. **PROJECT_CONTEXT.md** (read on demand) — "How does the full system work?"

Most sessions only need steps 1-3. Steps 4-5 are for deep dives or onboarding new contributors.

## Sprint Handover as Context Anchor

At the end of every sprint, write a handover document: `docs/sprints/SPRINT{N}_HANDOVER.md`

### What to Include

- **Completed work** — What shipped, with links to relevant code
- **Key decisions** — What was decided and why (not just what)
- **Known issues** — Bugs, tech debt, or risks discovered
- **Metrics** — Test count, deploy status, performance changes
- **Next sprint candidates** — What should be prioritized next

### Why Handovers Matter

- They are the **bridge between sessions.** A new session reads the handover to understand "where did we leave off?"
- They capture **decisions in context.** Three sprints later, "why did we choose X?" is answered in the handover, not in a git blame hunt.
- They prevent **context drift.** Without handovers, each session starts from zero and may repeat mistakes or redo work.

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| Chronological memory | Hard to find specific topics | Organize by topic with headers |
| Duplicating CLAUDE.md in MEMORY.md | Wastes context budget, risks drift | Reference CLAUDE.md, do not copy it |
| Stale entries | Misleading context, wrong decisions | Prune every sprint |
| Everything in MEMORY.md | Exceeds 200-line limit, truncated | Use topic files for overflow |
| No handovers | Each session starts from scratch | Write handover at every sprint end |
| Task details in MEMORY.md | Changes daily, clutters memory | Tasks live in TODO.md only |
| Backlog in TODO.md | Mixes active work with future work | Backlog lives in KANBAN.md only |
| Skipping memory update | Next session lacks critical context | Update MEMORY.md as part of sprint close |

## Memory Update Checklist (Sprint Close)

- [ ] Update sprint status in MEMORY.md
- [ ] Add lessons learned (3-5 bullet points, most impactful)
- [ ] Add key architecture additions (new modules, patterns)
- [ ] Remove stale entries (superseded lessons, old environment details)
- [ ] Verify line count is under 200
- [ ] Move overflow to topic files if needed
- [ ] Write sprint handover document
- [ ] Update PROJECT_CONTEXT.md with new metrics and architecture

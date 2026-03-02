# Session Bootstrap Protocol — {{PROJECT_NAME}}

## Overview

Claude Code agents have no memory between sessions. This protocol ensures every session starts with the right context, whether you are continuing a sprint or starting fresh.

---

## Auto-Loaded Context

These files are loaded automatically at the start of every Claude Code session:

| File | Content | Size Limit |
|------|---------|-----------|
| `CLAUDE.md` | Project rules, scripts, code style, commands | No hard limit, keep focused |
| `MEMORY.md` | Lessons learned, current state, key patterns | 200 lines max |

**You do not need to explicitly read these files.** They are injected into the agent's context automatically.

---

## On-Demand Context

Read these files when needed based on what you are doing:

| File | When to Read |
|------|-------------|
| `TODO.md` | When working on sprint tasks — shows current DoD and progress |
| `docs/sprints/SPRINT{N}_HANDOVER.md` | When resuming work from a previous session — read the latest one |
| `docs/process/PROJECT_CONTEXT.md` | When you need architecture overview or infrastructure details |
| `docs/process/KANBAN.md` | When planning a new sprint or checking backlog |

---

## Session Start: Continuing a Sprint

If you are resuming work on an active sprint:

1. **Context is auto-loaded** (CLAUDE.md + MEMORY.md)
2. **Read TODO.md** — identify which tasks are done, which are in progress
3. **Read the latest handover** — if the sprint has a handover from a previous session
4. **Identify the next task** — find the first unchecked task with no unmet dependencies
5. **Check the branch** — verify you are on the correct feature branch

```bash
# Verify branch and state
git branch --show-current
git status
npm run ci
```

---

## Session Start: Starting a New Sprint

If you are beginning a new sprint:

1. **Context is auto-loaded** (CLAUDE.md + MEMORY.md)
2. **Follow SPRINT_START_CHECKLIST.md** — do not skip any steps
3. **Read KANBAN.md** — review backlog and tech debt
4. **Read the previous sprint's handover** — understand what was done and what was deferred
5. **Plan the sprint** — write task specs in TODO.md

---

## Session Recovery: Interrupted Work

If a previous session was interrupted mid-task:

1. **Context is auto-loaded** (CLAUDE.md + MEMORY.md)
2. **Read TODO.md** — find the task that was in progress (partially checked DoD)
3. **Check git state:**
   ```bash
   git branch --show-current    # What branch are we on?
   git status                   # Any uncommitted changes?
   git log --oneline -5         # Recent commits?
   ```
4. **Assess the situation:**
   - If changes are committed but DoD is incomplete: continue from where it stopped
   - If changes are uncommitted: review them, decide whether to keep or discard
   - If on wrong branch: stash changes, switch to correct branch, apply
5. **Resume the task** — pick up from the first unchecked DoD item

---

## Context Refresh

When context feels stale or you are unsure about the current state:

```bash
# Quick state check
git branch --show-current
git status
git log --oneline -10
npm run ci
```

Then read:
1. `TODO.md` — sprint progress
2. `docs/process/PROJECT_CONTEXT.md` — overall project state
3. Latest `docs/sprints/SPRINT{N}_HANDOVER.md` — recent changes

---

## MEMORY.md Maintenance

MEMORY.md has a 200-line limit. When it grows too large:

1. **Move detailed content** into topic-specific files under a `memory/` directory
   - Example: `memory/tools-reference.md`, `memory/architecture-notes.md`
2. **Keep MEMORY.md as an index** — brief entries pointing to topic files
3. **Prune outdated entries** — remove lessons that are no longer relevant
4. **Consolidate similar entries** — merge related lessons into single entries

---

## Quick Reference

### "I just opened a new session and need to continue working"
```
1. (Auto-loaded: CLAUDE.md, MEMORY.md)
2. Read TODO.md
3. git branch --show-current && git status
4. Find next unchecked task
5. Start working
```

### "I need to start a new sprint"
```
1. (Auto-loaded: CLAUDE.md, MEMORY.md)
2. Read KANBAN.md
3. Read latest sprint handover
4. Follow SPRINT_START_CHECKLIST.md
```

### "I am not sure what is going on"
```
1. (Auto-loaded: CLAUDE.md, MEMORY.md)
2. git status && git log --oneline -10
3. Read TODO.md
4. Read PROJECT_CONTEXT.md
5. Read latest sprint handover
```

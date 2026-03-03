---
name: new-task
description: Create a new sprint task with full spec using the task template. Validates DoD, suggests specialist, appends to TODO.md.
---

# New Task Skill

You are creating a new sprint task for {{PROJECT_NAME}}. The user invoked `/new-task $ARGUMENTS`.

Arguments may include a task title or description. If empty, ask what the task should accomplish.

## Step 1: Determine Task Context

1. Read `TODO.md` to find the current sprint number and existing tasks
2. Determine the next task number (e.g., if last task is T13.3, next is T13.4)
3. Read `docs/process/KANBAN.md` to check if this item exists in the backlog

## Step 2: Gather Requirements

Ask the user (if not provided in arguments):
- **What does this task achieve?** (the Goal — one sentence, "why" not "what")
- **What's the scope?** (files to change, API endpoints, UI components)

## Step 3: Generate Task Spec

Using the format from `docs/process/TASK_TEMPLATE.md`, generate:

```markdown
## Task {N}.{X}: [Title]
**Goal:** [one sentence — what changes and why]
**Specialist:** [suggest from: node-architect, frontend-developer, api-designer, devops-engineer, devsecops-expert, security-auditor, architect-reviewer]
**Complexity:** [Small|Medium|Large]
**Depends on:** [Task IDs if any, omit if none]
**DoD:**
- [ ] [specific, verifiable criterion 1]
- [ ] [specific, verifiable criterion 2]
- [ ] [specific, verifiable criterion 3]
- [ ] Tests added in `test/[file].test.ts`, `npm run ci` passes
**Technical Specs:**
- [file path, function name, or API endpoint]
- [implementation detail]
- [fallback behavior if applicable]
**Test Plan:**
- Test file: `test/[name].test.ts`
- Unit tests for: [specific functions]
- Expected test count: ~N
**Demo Data Impact:** [Does the demo generator need updating? If no: "No demo data changes needed"]
```

### Specialist Selection Guide

| Task domain | Specialist |
|---|---|
| System design, modules, dependencies | `node-architect` |
| React/Next.js, UI, components | `frontend-developer` |
| API endpoints, auth, rate limiting | `api-designer` |
| CI/CD, Docker, infrastructure | `devops-engineer` |
| Auth systems, secrets, threat modeling | `devsecops-expert` |
| Security review (read-only) | `security-auditor` |
| Cross-cutting design review | `architect-reviewer` |
| Multiple domains | Use `+` notation: `frontend-developer + api-designer` |

### Complexity Guide

- **Small:** 1-2 files, clear scope, no architectural decisions
- **Medium:** 3-6 files, some design decisions, may touch API + UI
- **Large:** 7+ files, architectural impact, cross-cutting concerns

## Step 4: Validate

Before presenting to the user, check:

- [ ] Goal is one sentence describing "why"
- [ ] DoD has at least 3 checkboxes
- [ ] Every DoD item is independently verifiable (reject vague items)
- [ ] DoD includes a test checkbox
- [ ] Technical specs have at least 2 concrete bullets with file paths
- [ ] Test plan specifies a test file path
- [ ] Demo data impact is addressed
- [ ] Specialist is from the valid list
- [ ] Dependencies reference existing task IDs (if any)

If validation fails, fix the spec before presenting.

## Step 5: Present and Confirm

Show the task spec to the user. Ask:
- Does this look right?
- Any adjustments to scope, DoD, or specs?

## Step 6: Append to TODO.md

After user confirmation, append the task spec to `TODO.md` under the current sprint header.

If this is the first task and TODO.md is empty, create the sprint header:
```markdown
# Sprint {N}: [Theme]
```

## Important Rules

- NEVER write vague DoD items: "works well", "tested", "code is clean"
- ALWAYS include a test checkbox in DoD
- ALWAYS specify concrete file paths in Technical Specs
- Ask the user about demo data impact — don't assume

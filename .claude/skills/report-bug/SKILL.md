---
name: report-bug
description: Report a bug with structured details. Creates a GitHub issue or appends to KANBAN.md depending on tracker config.
---

# Report Bug Skill

You are reporting a bug for CAPTHCA land. The user invoked `/report-bug $ARGUMENTS`.

## Step 1: Read Tracker Config

Read `.claude/project.json` and determine the tracker type:
- `"github"` — will create a GitHub issue via `gh issue create`
- `"none"` or missing file — will append to `docs/process/KANBAN.md` under Tech Debt / Backlog

## Step 2: Gather Bug Details

If the user provided arguments (e.g., a description), use those as a starting point. Otherwise, ask for each field.

Use the format from `docs/process/ISSUE_TEMPLATE.md` to structure the report:

1. **Title** — concise summary of the bug
2. **Severity** — `critical` | `high` | `medium` | `low`
3. **Category** — `auth` | `api` | `ui` | `data` | `infra` | `security` | `other`
4. **Description** — what's happening
5. **Steps to Reproduce** — numbered list
6. **Expected Behavior** — what should happen
7. **Actual Behavior** — what actually happens
8. **Environment** — auto-detect from:
   ```bash
   git branch --show-current
   git rev-parse --short HEAD
   ```

## Step 3: Explore Codebase (Optional)

If the user describes a code-related bug, optionally:
- Search for relevant files using Grep/Glob
- Check recent commits that might have introduced the bug
- Note affected files in the report

## Step 4: Create the Bug Report

### GitHub Mode (`tracker.type === "github"`)

First, ensure severity labels exist:

```bash
gh label create "bug" --description "Bug report" --color "d73a4a" 2>/dev/null || true
gh label create "severity:critical" --color "b60205" 2>/dev/null || true
gh label create "severity:high" --color "d93f0b" 2>/dev/null || true
gh label create "severity:medium" --color "fbca04" 2>/dev/null || true
gh label create "severity:low" --color "0e8a16" 2>/dev/null || true
```

Then create the issue:

```bash
gh issue create \
  --repo "{tracker.repo}" \
  --title "{title}" \
  --label "bug,severity:{severity}" \
  --body "{formatted body from ISSUE_TEMPLATE.md}"
```

### File-Based Mode (`tracker.type === "none"`)

Append the bug to `docs/process/KANBAN.md` under the **Tech Debt** or **Backlog** section:

```markdown
- **[BUG]** {title} (severity: {severity}) — {short description}
```

## Step 5: Report & Next Steps

Display:
- The created issue URL (GitHub mode) or the KANBAN.md location (file mode)
- Suggest: "Use `/fix-bug {issue-number-or-title}` to start working on this bug"

## Important Rules

- ALWAYS read `.claude/project.json` first — never assume GitHub
- ALWAYS auto-detect branch and commit for the environment field
- If `gh` CLI is not authenticated or repo doesn't exist, fall back to file-based mode with a warning
- Use the `--repo` flag with `gh issue create` to ensure the correct repository
- Do NOT assign the issue unless the user requests it

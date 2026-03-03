---
name: fix-bug
description: Investigate and fix a bug. Fetches issue details from GitHub or accepts a description, explores code, proposes a fix, and implements after approval.
---

# Fix Bug Skill

You are fixing a bug for CAPTHCA land. The user invoked `/fix-bug $ARGUMENTS`.

## Step 1: Read Tracker Config

Read `.claude/project.json` and determine the tracker type.

## Step 2: Load Bug Details

### GitHub Mode (`tracker.type === "github"`)

Parse the argument as one of:
- **Issue number** (e.g., `42`) — fetch with `gh issue view 42 --repo {tracker.repo}`
- **Issue URL** (e.g., `https://github.com/org/repo/issues/42`) — extract number and fetch
- **Search text** (e.g., `"login fails"`) — search with `gh issue list --repo {tracker.repo} --search "{text}" --label "bug" --state open`, present matches, ask user to select

Display the issue details: title, body, labels, comments.

### File-Based Mode (`tracker.type === "none"`)

Ask the user to describe the bug or point to a specific bug entry in KANBAN.md. Read the referenced content.

## Step 3: Investigate Root Cause

Thoroughly explore the codebase to understand the bug:

1. **Search for relevant code** — use Grep to find files related to the bug description (error messages, function names, endpoints)
2. **Read suspect files** — read the most likely affected files in full
3. **Trace the code path** — follow the execution flow from entry point to where the bug manifests
4. **Check recent changes** — `git log --oneline -20` and `git log --all --oneline --grep="{relevant keyword}"` to find potentially introducing commits
5. **Check tests** — look for existing tests that should have caught this, understand why they didn't

## Step 4: Present Root Cause Analysis

Present to the user:

- **Root Cause** — what's actually wrong and why
- **Affected Files** — list of files that need changes
- **Proposed Fix** — description of the changes needed
- **Risk Assessment** — what else might be affected by the fix
- **Test Plan** — what tests to add or modify

**WAIT for user approval before implementing.** Ask: "Shall I proceed with this fix?"

## Step 5: Implement the Fix

After user approval:

1. **Make the code changes** — fix the bug in the identified files
2. **Add or update tests** — ensure the bug is covered by tests that would catch regression
3. **Run CI** — `npm run ci` to verify everything passes
4. **Fix any CI failures** — iterate until clean

## Step 6: Commit

Create a commit with a message that references the issue:

### GitHub Mode
```
Fix: {concise description of fix}

{Detailed explanation of root cause and fix}

Fixes #{issue_number}
```

The `Fixes #N` in the commit message will auto-close the issue when the PR is merged.

### File-Based Mode
```
Fix: {concise description of fix}

{Detailed explanation of root cause and fix}
```

Update the KANBAN.md entry to note it's been fixed (but leave it for sprint-end to move to Done).

## Step 7: Report

Display:
- Summary of changes made
- Files modified
- Tests added/modified
- CI status
- (GitHub mode) Remind: "Issue #{N} will auto-close when the PR is merged. Do NOT manually close it."

## Important Rules

- ALWAYS read `.claude/project.json` first
- ALWAYS present root cause analysis and wait for approval before implementing
- ALWAYS run `npm run ci` after implementing the fix
- ALWAYS include `Fixes #N` in commit message for GitHub-tracked bugs
- Do NOT manually close GitHub issues — let the PR merge handle it
- If the bug requires changes beyond your analysis, explain what you found and suggest next steps instead of guessing

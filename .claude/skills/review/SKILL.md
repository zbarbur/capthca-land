---
name: review
description: Review code changes against project standards. Checks coding standards, security patterns, error handling, test coverage, and deployment readiness.
---

# Code Review Skill

You are reviewing code for {{PROJECT_NAME}}. The user invoked `/review $ARGUMENTS`.

## Determine Scope

Parse arguments:
- `/review` — review all uncommitted changes (`git diff`)
- `/review staged` — review staged changes only (`git diff --cached`)
- `/review pr` or `/review pr 123` — review a pull request
- `/review FILE [FILE...]` — review specific files

## Gather Changes

Based on scope, collect the code to review:

```bash
# Uncommitted changes
git diff

# Staged changes
git diff --cached

# PR changes
gh pr diff [NUMBER]

# Specific files
cat FILE1 FILE2...
```

## Review Checklist

For each changed file, check against these categories:

### 1. Coding Standards (`docs/process/CODING_STANDARDS.md`)
- [ ] Biome v2 formatting (tabs, double quotes, trailing commas)
- [ ] Import ordering (Biome organize imports)
- [ ] No `any` types without `biome-ignore` comment
- [ ] TypeScript strict mode compliance
- [ ] No unused imports or variables

### 2. Error Handling (`docs/guides/ERROR_HANDLING.md`)
- [ ] No empty `catch {}` blocks
- [ ] Errors are logged or re-thrown (never swallowed)
- [ ] Operations classified as required vs best-effort
- [ ] Structured error logging (operation, IDs, message)
- [ ] Scripts exit non-zero on required-step failure

### 3. Security (`docs/guides/SECURITY.md`)
- [ ] No hardcoded secrets, keys, or tokens
- [ ] Input validation on API boundaries (size limits, schema)
- [ ] Auth checks use centralized authorization module
- [ ] No inline role checks (use `canWrite()`, `canAdmin()`, etc.)
- [ ] Timing-safe comparison for secret operations
- [ ] Rate limiting on auth endpoints
- [ ] No `eval()`, no template injection vectors

### 4. API Design (`docs/guides/API_DESIGN.md`)
- [ ] RESTful conventions (correct HTTP methods, status codes)
- [ ] Consistent error response format
- [ ] Auth required on new endpoints (not accidentally public)
- [ ] Pagination on list endpoints

### 5. Data Integrity (`docs/guides/DATA_INTEGRITY.md`)
- [ ] Bulk operations include write verification
- [ ] No fleet-wide stats computed from page slices
- [ ] Search index updates include stale doc cleanup
- [ ] Cache has TTL (never cache forever)

### 6. Testing (`docs/guides/TESTING.md`)
- [ ] New logic has corresponding tests
- [ ] Testable logic extracted to lib/ modules (not buried in route handlers)
- [ ] Tests use Node.js built-in runner (`node:test`)
- [ ] No external service dependencies in unit tests
- [ ] Temp directories cleaned up after tests

### 7. Deployment (`docs/guides/DEPLOYMENT.md`)
- [ ] No `NEXT_PUBLIC_*` vars set at runtime (must be build ARGs)
- [ ] No symlinks in Docker context
- [ ] No secrets baked into images
- [ ] Cloud Run compatible (stateless, 0.0.0.0 binding)

### 8. Code Health (`docs/guides/CODE_HEALTH.md`)
- [ ] No files exceeding 300 lines (if changed file is over, flag for extraction)
- [ ] No functions exceeding 30 lines (look for extraction opportunities)
- [ ] No duplicated logic (same pattern appearing in 3+ places — extract to shared function)
- [ ] No dead code introduced (unused imports, unreachable branches, commented-out blocks)
- [ ] Single responsibility — changed file doesn't mix unrelated concerns
- [ ] Nesting depth ≤ 3 levels (use guard clauses / early returns to flatten)
- [ ] No circular dependencies introduced (A imports B imports A)
- [ ] Functions have ≤ 4 parameters (use options object for more)
- [ ] No magic numbers or hardcoded strings (extract to named constants)
- [ ] Business logic in lib/ modules, not inline in route handlers (testability)

## Report Format

Present findings grouped by severity:

```markdown
## Code Review — [scope description]

### Critical (must fix before merge)
- **[FILE:LINE]** — [issue description]
  Fix: [specific suggestion]

### Warning (should fix)
- **[FILE:LINE]** — [issue description]
  Fix: [specific suggestion]

### Suggestion (nice to have)
- **[FILE:LINE]** — [issue description]

### Positive
- [What's done well — acknowledge good patterns]

### Summary
- Files reviewed: N
- Critical: N | Warning: N | Suggestion: N
- Test coverage: [adequate / needs work / missing]
- Security: [clean / issues found]
- Code health: [clean / issues found]
- Ready to merge: [yes / no — fix critical issues first]
```

## Important Rules

- ALWAYS read the actual code, never review based on file names alone
- Check against project-specific patterns in CLAUDE.md and CODING_STANDARDS.md
- Flag security issues as Critical, never as Suggestions
- Acknowledge what's done well — reviews shouldn't be only negative
- If changes touch auth or secrets, apply extra scrutiny from SECURITY.md

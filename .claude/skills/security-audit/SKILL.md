---
name: security-audit
description: Run a comprehensive security audit against the codebase. Checks auth, secrets, input validation, dependencies, infrastructure, and code patterns. Produces a formal report with severity ratings.
---

# Security Audit Skill

You are performing a security audit of CAPTHCA land. The user invoked `/security-audit $ARGUMENTS`.

## Determine Scope

Parse the first argument:

| Argument | Scope | Focus |
|----------|-------|-------|
| (empty) | Full audit | All categories below |
| `auth` | Authentication & authorization | Auth defaults, route protection, session/token security |
| `secrets` | Secrets & credentials | Hardcoded secrets, git history, env files, Docker images |
| `input` | Input validation | API boundaries, injection vectors, size limits |
| `deps` | Dependencies | npm audit, known CVEs, outdated packages |
| `infra` | Infrastructure | IAM, Secret Manager, network, public endpoints |
| `code` | Code patterns | eval, injection, XSS, unsafe operations |
| `--since TAG` | Delta audit | Only code changed since the given git tag |

## Audit Procedure

For each category, systematically search the codebase. Use Grep and Read tools extensively — never guess.

### Category 1: Authentication & Authorization

**Check auth defaults:**
- Search for auth toggle variables (e.g., `AUTH`, `AUTH_ENABLED`, `DISABLE_AUTH`)
- Verify auth is ON by default (opt-out, not opt-in)
- Check if container/production mode enforces auth

```
grep -r "AUTH" --include="*.ts" --include="*.env*" .
```

**Check route protection:**
- List all API route files
- For each route, verify an auth check exists (middleware or inline)
- Flag any unprotected routes that should require auth

```
find . -path "*/api/*" -name "*.ts" -not -path "*/node_modules/*"
```

For each route file, check for:
- Authorization module imports (`authorization`, `getRequestAuth`, `denyIf`)
- Middleware application
- Direct role checks

**Flag unprotected routes:**
- `GET /api/health` — OK to be public
- Any other route without auth — **Critical finding**

**Check session security:**
- Session cookie flags: `httpOnly`, `secure`, `sameSite`
- Session expiration configured
- HMAC or signed sessions (not plain text)

**Check token security:**
- Token hashing: SHA-256 or better (not stored in plaintext)
- Token expiration enforced
- Timing-safe comparison used (`crypto.timingSafeEqual` or equivalent)

```
grep -r "timingSafe\|timing.safe\|constantTime" --include="*.ts" .
```

### Category 2: Secrets & Credentials

**Search for hardcoded secrets:**
```
grep -rn "password\s*=\|secret\s*=\|api_key\s*=\|token\s*=\|apiKey\s*=" --include="*.ts" --include="*.js" --include="*.json" .
grep -rn "Bearer [A-Za-z0-9]" --include="*.ts" .
grep -rn "sk_live\|pk_live\|sk_test\|AKIA[A-Z0-9]" .
```

**Check for committed secrets:**
```
git log --all --diff-filter=A -- "*.env" "*credentials*" "*secret*" "*key*.json"
```

**Check .gitignore:**
- `.env` files excluded?
- `**/service-account*.json` excluded?
- `**/credentials*.json` excluded?

**Check Docker images:**
- Read Dockerfile — any `COPY .env` or `ENV SECRET=` lines?
- Secrets should be injected at runtime, never baked in

**Check env var handling:**
- Are secrets read from environment or Secret Manager?
- Is there a `SecretProvider` abstraction?
- Are secrets logged anywhere? (search for log statements near secret reads)

```
grep -rn "console.log.*secret\|console.log.*key\|console.log.*token\|console.log.*password" --include="*.ts" .
```

### Category 3: Input Validation

**API boundary checks:**
- For each POST/PUT/PATCH endpoint, check:
  - Request body size limit configured?
  - Schema validation on input?
  - Type checking on parameters?

**Injection vectors:**
```
grep -rn "eval\b\|Function(\|new Function" --include="*.ts" .
grep -rn "innerHTML\|dangerouslySetInnerHTML" --include="*.tsx" --include="*.ts" .
grep -rn "\$\{.*\}.*query\|\.query.*\$\{" --include="*.ts" .
```

**Path traversal:**
```
grep -rn "req.params\|req.query" --include="*.ts" . | grep -i "path\|file\|dir"
```
Check if user-supplied paths are sanitized before filesystem access.

### Category 4: Dependencies

**npm audit:**
```bash
npm audit --audit-level=high 2>&1
```

**Check for outdated packages with known issues:**
```bash
npm outdated 2>&1
```

**Review dependency count:**
- Flag if node_modules is unusually large
- Check for dependencies that should be devDependencies

### Category 5: Infrastructure

**IAM and permissions:**
- Are service accounts using least privilege?
- Is Secret Manager access scoped to specific secrets?
- Are `--allow-unauthenticated` flags intentional?

**Check Cloud Run config (if cloudbuild.yaml exists):**
```
grep -n "allow-unauthenticated\|set-secrets\|set-env-vars" cloudbuild*.yaml
```

**Public endpoints:**
- List all endpoints that don't require auth
- Verify each is intentionally public

**CORS configuration:**
```
grep -rn "cors\|Access-Control\|origin" --include="*.ts" .
```

### Category 6: Code Patterns

**Dangerous functions:**
```
grep -rn "eval\b\|exec\b\|execSync\|spawn.*shell.*true" --include="*.ts" .
grep -rn "crypto.createCipher\b" --include="*.ts" .  # deprecated, use createCipheriv
```

**Error information leakage:**
- Check if stack traces are returned to clients in production
- Check if internal error details are exposed in API responses

```
grep -rn "stack\|stackTrace\|err.message" --include="*.ts" . | grep -i "response\|res.json\|res.send"
```

**Logging sensitive data:**
```
grep -rn "console.log.*password\|console.log.*secret\|console.log.*token\|console.log.*authorization" --include="*.ts" .
```

## Report Format

Generate a formal audit report:

```markdown
# Security Audit Report — CAPTHCA land
**Date:** [today's date]
**Scope:** [full | category]
**Auditor:** Claude Code security-audit skill

---

## Executive Summary
- **Critical:** N findings (fix immediately)
- **High:** N findings (fix this sprint)
- **Medium:** N findings (fix next sprint)
- **Low:** N findings (track as tech debt)
- **Clean areas:** [list categories with no findings]

---

## Critical Findings

### SEC-001: [Title]
- **Category:** [Auth | Secrets | Input | Deps | Infra | Code]
- **Location:** `file:line`
- **Description:** [What's wrong and why it's dangerous]
- **Impact:** [What an attacker could do]
- **Remediation:** [Specific steps to fix]
- **Reference:** [docs/guides/SECURITY.md section]

---

## High Findings
### SEC-002: ...

---

## Medium Findings
### SEC-003: ...

---

## Low Findings
### SEC-004: ...

---

## Clean Checks
- [x] No hardcoded secrets in codebase
- [x] All auth endpoints rate-limited
- [x] npm audit clean (no high/critical vulnerabilities)
- [x] No eval() or Function() usage
- [x] Docker image does not bake secrets
- [x] .gitignore excludes credential files
[... list all checks that passed]

---

## Recommendations
1. [Priority recommendation with rationale]
2. [...]

---

## Next Steps
- [ ] Fix all Critical findings before next deploy
- [ ] Fix High findings in current sprint
- [ ] Add Medium findings to KANBAN.md tech debt
- [ ] Schedule follow-up audit after fixes: `/security-audit`
```

## Severity Classification

| Severity | Criteria | Response Time |
|----------|----------|--------------|
| **Critical** | Actively exploitable, data breach risk, auth bypass | Fix immediately, block deploy |
| **High** | Significant risk but requires specific conditions | Fix this sprint |
| **Medium** | Defense-in-depth gap, best practice violation | Fix next sprint |
| **Low** | Minor improvement, hardening opportunity | Track as tech debt |

## Important Rules

- This is a READ-ONLY audit — do NOT modify any files
- Search systematically — check every route, every secret reference, every boundary
- NEVER report a finding without the specific file and line number
- False positives are better than false negatives — flag uncertain items as "Needs Review"
- Always check against `docs/guides/SECURITY.md` for project-specific standards
- If previous audit reports exist (in sprint handovers), verify prior findings were fixed
- The audit report should be saved to `docs/security/AUDIT_[DATE].md` if the user approves

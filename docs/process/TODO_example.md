# TODO — CAPTHCA land

> Active sprint tasks only. Backlog lives in `docs/process/KANBAN.md`.

---

## Sprint 5 — Authentication & Security Hardening

### T5.1 — Implement API token system
- **Goal:** Add bearer token authentication so external integrations can call APIs without session cookies
- **Specialist:** devsecops-expert
- **Complexity:** L
- **Depends on:** None
- **DoD:**
  - [x] `POST /api/tokens` creates a new token (returns plaintext once, stores SHA-256 hash)
  - [x] `GET /api/tokens` lists active tokens (masked, no plaintext)
  - [x] `DELETE /api/tokens/:id` revokes a token
  - [x] `Authorization: Bearer <token>` header accepted on all `/api/*` routes
  - [x] Tokens scoped to tenant (cannot access other tenants' data)
  - [x] Token format: `proj_` prefix + 32 random bytes (base62)
  - [x] test/token-auth.test.ts: 8 tests covering create, validate, revoke, scope
  - [x] Tests pass (`npm test`)
  - [x] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New module: `lib/token-auth.ts` — generate, hash, validate, revoke
  - New collection: `{prefix}api_tokens` — `{ id, tenantId, name, tokenHash, createdAt, lastUsedAt }`
  - Token format: `proj_` + 32 bytes base62 = ~54 chars total
  - Hash: SHA-256 of full token string
  - Middleware: check `Authorization` header before cookie auth
- **Test Plan:**
  - Unit: token generation format, hash verification, revocation
  - Integration: middleware accepts valid token, rejects invalid/revoked
- **Demo Data Impact:**
  - Update demo generator to create one sample API token per demo tenant

### T5.2 — Add rate limiting middleware
- **Goal:** Prevent API abuse by enforcing per-key rate limits on all authenticated endpoints
- **Specialist:** devsecops-expert + api-designer
- **Complexity:** M
- **Depends on:** T5.1
- **DoD:**
  - [x] Middleware applied to all `/api/*` routes
  - [x] Returns 429 with `Retry-After` header when limit exceeded
  - [x] Rate limit headers on all responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
  - [x] Configurable via `RATE_LIMIT_MAX` env var (default: 100)
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
  - [ ] Deployed to staging and verified
- **Technical Specs:**
  - New file: `lib/rate-limiter.ts` — sliding window counter (in-memory Map)
  - Env vars: `RATE_LIMIT_MAX` (default: 100), `RATE_LIMIT_WINDOW_MS` (default: 60000)
  - 429 body: `{ "error": "rate_limit_exceeded", "retryAfter": <seconds> }`
- **Test Plan:**
  - test/rate-limiter.test.ts: counter increment, window reset, 429 response, header values
- **Demo Data Impact:**
  - None — rate limiting is transparent to data shape

### T5.3 — Security audit of auth flows
- **Goal:** Audit all authentication and authorization paths to identify vulnerabilities before production launch
- **Specialist:** security-auditor
- **Complexity:** M
- **Depends on:** T5.1, T5.2
- **DoD:**
  - [ ] Audit report written at `docs/audits/SPRINT5_AUTH_AUDIT.md`
  - [ ] All `/api/*` routes verified to require authentication
  - [ ] No route bypasses auth middleware
  - [ ] Token scope enforcement verified (tenant isolation)
  - [ ] Rate limiting verified on all endpoints
  - [ ] Session cookie settings reviewed (HttpOnly, Secure, SameSite)
  - [ ] Findings categorized by severity (Critical/High/Medium/Low)
  - [ ] Critical and High findings have fix recommendations
- **Technical Specs:**
  - Audit scope: `middleware.ts`, `lib/token-auth.ts`, `lib/rate-limiter.ts`, all route handlers
  - Check: every route in `app/api/` has auth gate
  - Check: cookie attributes in auth response
  - Check: CORS configuration
  - Output: markdown report with findings table
- **Test Plan:**
  - No new tests — audit produces a report, findings become tasks in next sprint
- **Demo Data Impact:**
  - None

### T5.4 — Dashboard token management page
- **Goal:** Build a UI page where users can create, view, and revoke their API tokens
- **Specialist:** frontend-developer
- **Complexity:** M
- **Depends on:** T5.1
- **DoD:**
  - [ ] `/settings/tokens` page accessible from dashboard navigation
  - [ ] Token list shows name, created date, last used, masked prefix
  - [ ] "Create Token" button opens modal with name input
  - [ ] After creation, plaintext token shown once with copy button
  - [ ] "Revoke" button with confirmation dialog
  - [ ] Loading skeleton while data fetches
  - [ ] Empty state when no tokens exist
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New page: `app/settings/tokens/page.tsx`
  - Components: `TokenList`, `CreateTokenModal`, `TokenRow`
  - API calls: `GET /api/tokens`, `POST /api/tokens`, `DELETE /api/tokens/:id`
  - Use SWR for data fetching and cache invalidation
- **Test Plan:**
  - Component tests: render list, create flow, revoke flow, empty state
- **Demo Data Impact:**
  - None — page reads from existing token data

---

## Sprint Summary

| Task | Status | Specialist |
|------|--------|-----------|
| T5.1 — API token system | Done | devsecops-expert |
| T5.2 — Rate limiting | In Progress | devsecops-expert + api-designer |
| T5.3 — Security audit | Not Started | security-auditor |
| T5.4 — Token management UI | Not Started | frontend-developer |

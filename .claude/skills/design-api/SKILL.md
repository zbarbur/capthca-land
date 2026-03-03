---
name: design-api
description: Design a new API endpoint or refactor existing ones. Enforces project conventions for naming, auth, error handling, rate limiting, and produces a ready-to-implement spec.
---

# Design API Skill

You are designing an API endpoint for {{PROJECT_NAME}}. The user invoked `/design-api $ARGUMENTS`.

Arguments may include an endpoint description (e.g., "list users for a tenant" or "webhook receiver for events").

## Step 1: Gather Context

1. **Read existing routes** to understand conventions:
   - Find all route files: look for `app/api/`, `src/routes/`, or similar patterns
   - Note: naming convention (plural nouns, nested resources), HTTP methods used, response format
   - Note: how auth is applied (middleware, per-route, centralized module)
   - Note: error response format (JSON shape, status codes used)

2. **Read project standards**:
   - `docs/guides/API_DESIGN.md` — conventions and patterns
   - `docs/guides/SECURITY.md` — auth requirements
   - `dashboard/lib/authorization.ts` (or equivalent) — RBAC pattern

3. **Clarify requirements** with the user if not provided:
   - What resource is this endpoint for?
   - Who should access it? (public, authenticated, admin-only, tenant-scoped)
   - What operations? (CRUD, search, action)

## Step 2: Design the Endpoint

Produce a spec following project conventions:

### Endpoint Specification

```markdown
## API Endpoint: [METHOD] /api/[resource]

### Purpose
[One sentence — what this endpoint does and why]

### Authentication
- [ ] Requires authentication: [yes/no]
- Auth method: [session cookie | Bearer token | both]
- Required role: [admin | editor | viewer | tenant_admin | tenant_viewer]
- Authorization check: `[function from authorization module]`

### Request
- Method: [GET | POST | PUT | PATCH | DELETE]
- Path: `/api/[resource]/[params]`
- Path params: [list with types]
- Query params: [list with types, defaults, validation]
- Body (if POST/PUT/PATCH):
```json
{
  "field": "type — description (required|optional)"
}
```
- Size limit: [e.g., 1MB for body]

### Response

**Success (200/201):**
```json
{
  "data": {},
  "meta": { "total": 0, "page": 1, "pageSize": 50 }
}
```

**Error (4xx/5xx):**
```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

### Status Codes
| Code | When |
|------|------|
| 200  | Success (GET, PUT, PATCH) |
| 201  | Created (POST) |
| 400  | Invalid input (validation failure) |
| 401  | Not authenticated |
| 403  | Authenticated but not authorized |
| 404  | Resource not found |
| 429  | Rate limited |
| 500  | Internal server error |

### Rate Limiting
- Per-IP: [N requests / window]
- Per-tenant: [N requests / window]

### Pagination (if list endpoint)
- Default page size: 50
- Max page size: 100
- Strategy: [offset | cursor]
- Sort: [default sort field and direction]

### Input Validation
- [field]: [validation rule — min/max, regex, enum values]

### Implementation Notes
- File: `[path to route handler]`
- Authorization: import `[function]` from `[authorization module]`
- Extract business logic to: `[lib/ module path]` (for testability)
```

## Step 3: Validate Against Standards

Check the spec against:

- [ ] RESTful naming — plural nouns, no verbs in URL (`/api/users` not `/api/getUsers`)
- [ ] Correct HTTP method — GET reads, POST creates, PUT replaces, PATCH updates, DELETE removes
- [ ] Auth required — new endpoints must require auth unless explicitly public
- [ ] Auth uses centralized module — no inline role checks
- [ ] Error format matches existing endpoints
- [ ] Pagination on list endpoints
- [ ] Rate limiting specified
- [ ] Input validation at boundary
- [ ] Business logic extracted to testable module (not inline in route handler)

## Step 4: Generate Test Plan

```markdown
### Test Plan
- Test file: `test/[resource].test.ts`
- Unit tests for business logic in `lib/[module].ts`:
  - [function 1]: [what to test]
  - [function 2]: [what to test]
- Auth tests:
  - Returns 401 without auth
  - Returns 403 with insufficient role
  - Returns 200 with correct role
- Validation tests:
  - Returns 400 for invalid input
  - Returns 400 for oversized body
- Expected test count: ~N
```

## Step 5: Present and Iterate

Show the complete spec to the user. Ask:
- Does the resource naming match your domain language?
- Are the roles/permissions correct?
- Any additional fields or query params needed?
- Should this be added to TODO.md as a task spec?

If the user confirms, offer to:
1. Append to TODO.md as a task's Technical Specs section
2. Generate the route handler skeleton
3. Generate the test file skeleton

## Important Rules

- ALWAYS read existing routes first — match their conventions exactly
- NEVER design a public endpoint without explicit user confirmation
- ALWAYS include auth, rate limiting, and input validation
- Extract logic to lib/ modules — route handlers should be thin
- Error response format must match existing endpoints

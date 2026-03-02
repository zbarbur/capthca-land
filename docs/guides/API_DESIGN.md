# API Design — REST Patterns, Tokens, Versioning

## RESTful Conventions

### Resource Naming

- Use plural nouns for collections: `/api/users`, `/api/tenants`
- Nest sub-resources: `/api/tenants/{tenantId}/hosts`
- Use kebab-case for multi-word resources: `/api/scan-results`
- Avoid verbs in URLs — use HTTP methods instead

### HTTP Methods

| Method | Purpose | Idempotent | Response |
|---|---|---|---|
| GET | Read resource(s) | Yes | 200 + body |
| POST | Create resource | No | 201 + created resource + Location header |
| PUT | Replace resource | Yes | 200 + updated resource |
| PATCH | Partial update | Yes | 200 + updated resource |
| DELETE | Remove resource | Yes | 204 (no body) |

### Status Codes

| Code | Meaning | When to use |
|---|---|---|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation failure, malformed input |
| 401 | Unauthorized | Missing or invalid auth credentials |
| 403 | Forbidden | Valid auth but insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource, version conflict |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled server failure |

## Error Response Format

All errors must return a consistent JSON structure:

```typescript
interface ErrorResponse {
	error: {
		code: string;     // machine-readable: "VALIDATION_ERROR", "NOT_FOUND"
		message: string;  // human-readable description
		details?: unknown; // optional field-level errors or context
	};
}

// Example
{
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Name must be between 1 and 256 characters",
		"details": { "field": "name", "constraint": "length", "max": 256 }
	}
}
```

Never expose stack traces, internal paths, or database errors in API responses.

## Token Lifecycle

API tokens follow a strict lifecycle that separates the secret from its stored representation.

### 1. Generate

```typescript
function generateToken(prefix: string): { token: string; hash: string } {
	const bytes = crypto.randomBytes(32);
	const token = `${prefix}_${bytes.toString("base64url")}`;
	const hash = crypto.createHash("sha256").update(token).digest("hex");
	return { token, hash }; // token shown once, hash stored
}
```

### 2. Create (Store)

Store the hash, metadata, and scopes — never the original token.

```typescript
interface StoredToken {
	hashSha256: string;
	name: string;
	tenantId: string;
	scopes: string[];       // ["fleet:read", "fleet:write"]
	createdAt: string;
	expiresAt: string;      // 90 days recommended, 1 year max
	lastUsedAt?: string;
	prefix: string;         // first 8 chars for identification
}
```

### 3. Validate

Hash the incoming token, look up the hash, check expiry and scopes.

### 4. List

Return metadata only — name, prefix (first 8 chars), created date, last used, scopes. Never return the token or its hash.

### 5. Revoke

Delete the hash record. The token is immediately invalid.

### 6. Rotate

Create a new token, keep the old token valid for a transition window (e.g., 24 hours), then revoke the old token. This prevents service disruption during rotation.

## Token Scoping

Tokens should be scoped at multiple levels:

- **Tenant-scoped** — Token can only access resources within its tenant
- **Permission-scoped** — Token has explicit capabilities (read, write, admin)
- **Resource-scoped** — Token can only access specific resource types

```typescript
// Check token has required scope
function requireScope(token: StoredToken, required: string): void {
	if (!token.scopes.includes(required) && !token.scopes.includes("admin")) {
		throw new HttpError(403, `Token missing required scope: ${required}`);
	}
}
```

## Rate Limiting Strategy

### Per-IP Limits (DDoS protection)

- Auth endpoints: 10 requests/minute
- General API: 100 requests/minute
- Generous for legitimate use, tight enough to block abuse

### Per-Tenant Limits (fair usage)

- Standard tier: 1,000 requests/minute
- Enterprise tier: 10,000 requests/minute

### Implementation: Sliding Window

Use a sorted set (Redis) or time-bucketed counters (Firestore) to track request counts within a sliding window. Return `429` with `Retry-After` header.

```typescript
// Response headers for rate-limited endpoints
res.setHeader("X-RateLimit-Limit", limit);
res.setHeader("X-RateLimit-Remaining", remaining);
res.setHeader("X-RateLimit-Reset", resetTimestamp);
```

## Centralized Authorization Module

Never scatter permission checks across route handlers. Create a single authorization module that every handler calls.

```typescript
// lib/authorization.ts — single source of truth for RBAC
type Capability = "fleet:read" | "fleet:write" | "admin:manage" | "reports:export";

const ROLE_CAPABILITIES: Record<string, Capability[]> = {
	viewer: ["fleet:read"],
	operator: ["fleet:read", "fleet:write", "reports:export"],
	admin: ["fleet:read", "fleet:write", "reports:export", "admin:manage"],
};

export function can(role: string, capability: Capability): boolean {
	return ROLE_CAPABILITIES[role]?.includes(capability) ?? false;
}

export function requireCapability(role: string, capability: Capability): void {
	if (!can(role, capability)) {
		throw new HttpError(403, `Role '${role}' lacks capability '${capability}'`);
	}
}
```

## Pagination

### Offset-Based (Simple)

```
GET /api/hosts?offset=0&limit=25
Response: { data: [...], total: 1542, offset: 0, limit: 25 }
```

Good for: small datasets, UI page numbers. Bad for: large datasets (offset scan is O(n)), concurrent writes cause drift.

### Cursor-Based (Scalable)

```
GET /api/hosts?limit=25&cursor=eyJsYXN0SWQiOiIxMjMifQ==
Response: { data: [...], nextCursor: "eyJsYXN0SWQiOiI0NTYifQ==", hasMore: true }
```

Good for: large datasets, real-time data. Cursor is an opaque base64-encoded token containing the last item's sort key.

## API Versioning

### URL Path Versioning (Recommended)

```
/api/v1/hosts
/api/v2/hosts
```

Clear, explicit, easy to route. Old versions can be deprecated with sunset headers.

### Header Versioning (Alternative)

```
Accept: application/vnd.myapp.v2+json
```

Cleaner URLs but harder to test in a browser and debug.

### Versioning Rules

- Never break existing clients without a version bump
- Additive changes (new fields, new endpoints) do not require a new version
- Removing fields, changing types, or changing behavior requires a new version
- Support at least N-1 versions
- Return `Sunset` header on deprecated versions with a date

# Security — Auth, Secrets, Input Validation, Audit

## Core Principle: Auth ON by Default

Authentication must be enabled by default. Every route is protected unless explicitly opted out. Never build a system where developers must remember to add auth — they will forget.

```typescript
// GOOD — middleware protects everything, explicit allowlist for public routes
const PUBLIC_ROUTES = ["/api/health", "/login", "/api/auth/callback"];

function authMiddleware(req: Request): boolean {
	const path = new URL(req.url).pathname;
	if (PUBLIC_ROUTES.some((r) => path.startsWith(r))) return true;
	return validateSession(req) || validateBearerToken(req);
}
```

## Dual Auth Architecture

Support two authentication mechanisms that coexist:

1. **Session cookies** — For browser-based users (dashboard, web UI)
2. **Bearer API tokens** — For programmatic access (CLI, scripts, integrations)

Both mechanisms resolve to the same internal identity (userId, tenantId, role). Authorization checks are auth-method-agnostic.

## Hashing Standards

| Purpose | Algorithm | Notes |
|---|---|---|
| Passwords | bcrypt or scrypt | Cost factor 12+, auto-salted |
| API tokens | SHA-256 | Fast lookup, token is the secret |
| Session cookies | HMAC-SHA256 | Signed payload, no server state |
| CSRF tokens | crypto.randomBytes(32) | One-time use |

**Never store plaintext passwords or API tokens.** Store only the hash. The original token is shown to the user once at creation time and never again.

## Timing-Safe Comparison

All secret and hash comparisons must use constant-time comparison to prevent timing attacks.

```typescript
import { timingSafeEqual } from "node:crypto";

function safeCompare(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
}
```

**In Edge Runtime** (where Node.js crypto is unavailable), use the Web Crypto API:

```typescript
async function safeCompareEdge(a: string, b: string): Promise<boolean> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw", encoder.encode("comparison-key"),
		{ name: "HMAC", hash: "SHA-256" }, false, ["sign"],
	);
	const sigA = await crypto.subtle.sign("HMAC", key, encoder.encode(a));
	const sigB = await crypto.subtle.sign("HMAC", key, encoder.encode(b));
	const arr1 = new Uint8Array(sigA);
	const arr2 = new Uint8Array(sigB);
	if (arr1.length !== arr2.length) return false;
	return arr1.every((byte, i) => byte === arr2[i]); // HMAC output is fixed-size
}
```

## Input Validation at API Boundaries

Validate all input at the API boundary — never trust data from the client.

```typescript
// Size limits — prevent abuse
const MAX_BODY_SIZE = 1024 * 1024; // 1MB
const MAX_NAME_LENGTH = 256;
const MAX_PAGE_SIZE = 100;

// Schema validation
function validateCreateRequest(body: unknown): CreateInput {
	if (!body || typeof body !== "object") throw new HttpError(400, "Invalid body");
	const { name, description } = body as Record<string, unknown>;
	if (typeof name !== "string" || name.length === 0 || name.length > MAX_NAME_LENGTH) {
		throw new HttpError(400, "Name must be 1-256 characters");
	}
	return { name, description: typeof description === "string" ? description : undefined };
}
```

## Rate Limiting

Implement rate limiting at two levels:

1. **Per-IP** — Prevents brute force from a single source (e.g., 100 requests/minute)
2. **Per-tenant** — Prevents a single tenant from monopolizing resources (e.g., 1000 requests/minute)

**Sliding window pattern** (using sorted sets or similar):

```typescript
interface RateLimiter {
	check(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number }>;
}
```

Return `429 Too Many Requests` with `Retry-After` header when limits are exceeded.

## Token Lifecycle

Tokens follow a strict lifecycle: **generate -> create -> validate -> list -> revoke -> rotate**

1. **Generate** — Create cryptographically random bytes, encode as base64url with prefix
2. **Create** — Hash the token (SHA-256), store hash + metadata (name, scopes, expiry)
3. **Validate** — Hash incoming token, look up hash, check expiry and scopes
4. **List** — Return metadata only (name, prefix, created, last used) — never the token
5. **Revoke** — Delete the hash record, token immediately becomes invalid
6. **Rotate** — Create new token, set transition window, revoke old token after cutover

**Token format:** `prefix_base64url` (e.g., `myapp_dGhpcyBpcyBhIHRva2Vu`)

**Expiration:** 90 days recommended, 1 year maximum. Never issue non-expiring tokens.

## Edge Runtime Constraints

Middleware running in Edge Runtime (Vercel, Cloudflare Workers, Next.js middleware) cannot use Node.js built-in modules. Use the Web Crypto API exclusively:

- `crypto.subtle.digest("SHA-256", data)` instead of `createHash("sha256")`
- `crypto.subtle.sign("HMAC", key, data)` instead of `createHmac("sha256", key)`
- `crypto.getRandomValues(new Uint8Array(32))` instead of `randomBytes(32)`

## Security Audit Checklist

- [ ] All routes require authentication (verify no unprotected endpoints)
- [ ] Password hashing uses bcrypt/scrypt with appropriate cost factor
- [ ] API tokens are hashed before storage (SHA-256)
- [ ] All secret comparisons use timing-safe functions
- [ ] Input validation on all API endpoints (size limits, type checks)
- [ ] Rate limiting configured for auth endpoints and API
- [ ] CORS headers restrict origins to known domains
- [ ] No secrets in Docker images, git history, or client bundles
- [ ] Session cookies use HttpOnly, Secure, SameSite=Strict
- [ ] Error responses do not leak internal details (stack traces, DB errors)
- [ ] Dependency audit (`npm audit`) has no critical/high vulnerabilities
- [ ] CSP headers configured for dashboard
- [ ] Admin actions require explicit role check, not just authentication

## OWASP Top 10 Quick Reference

1. **Broken Access Control** — Enforce RBAC on every endpoint, not just the UI
2. **Cryptographic Failures** — Use established algorithms, never roll your own
3. **Injection** — Parameterized queries, never string-concatenated SQL/NoSQL
4. **Insecure Design** — Threat model before building, not after
5. **Security Misconfiguration** — Principle of least privilege, no default credentials
6. **Vulnerable Components** — Regular `npm audit`, automated dependency updates
7. **Auth Failures** — Rate limit login, enforce MFA for admin, invalidate sessions on password change
8. **Data Integrity Failures** — Verify signatures, validate data provenance
9. **Logging Failures** — Log auth events, admin actions, data access (but never log secrets)
10. **SSRF** — Validate URLs, block internal network ranges, use allowlists

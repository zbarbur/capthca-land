# Security Review — Sprint 1 Pre-Launch

**Date:** 2026-03-04
**Reviewer:** Claude Code security-audit
**Scope:** Full application — slider, track pages, subscribe API

---

## Summary

| Category | Status | Notes |
|----------|--------|-------|
| Rate Limiting | PASS | 5 req/min per IP on /api/subscribe |
| Input Validation | PASS | Email regex + length + sanitization |
| CORS | PASS | Next.js default same-origin; no cross-origin API access needed |
| CSP Headers | PASS | Configured in next.config.mjs |
| XSS | PASS | React auto-escapes; no dangerouslySetInnerHTML |
| Secrets in Client | PASS | No API keys or credentials in client code |
| Firestore Access | PASS | Server-side only via firebase-admin (not client SDK) |
| Frame Protection | PASS | X-Frame-Options: DENY |

## Detailed Findings

### 1. Rate Limiting — `/api/subscribe`
- **Implementation:** In-memory sliding window, keyed by IP from `x-forwarded-for`
- **Limit:** 5 requests per 60 seconds per IP
- **Response:** 429 with `{ error: "rate_limit_exceeded" }`
- **Note:** In-memory rate limiter resets on container restart. Acceptable for MVP scale. Consider Redis-backed solution if abuse occurs.

### 2. Input Validation
- Email: regex check, `.trim().toLowerCase()`, max 254 characters
- Track: strict enum validation (`"light"` or `"dark"` only)
- JSON parsing wrapped in try/catch

### 3. Security Headers (via next.config.mjs)
- `Content-Security-Policy`: restricts scripts, styles, fonts, images, connections
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — disables camera, microphone, geolocation

### 4. No Client-Side Secrets
- Firestore is accessed via `firebase-admin` (server-side only)
- No API keys, tokens, or credentials in any client component
- `FIRESTORE_EMULATOR_HOST` and `GOOGLE_CLOUD_PROJECT` are server-only env vars

### 5. XSS Prevention
- All user input (email) is only used server-side in Firestore writes
- React auto-escapes all rendered content
- No use of `dangerouslySetInnerHTML`

## Recommendations for Post-MVP
- [ ] Add CAPTCHA/honeypot to subscribe form (ironic but necessary for spam prevention)
- [ ] Move rate limiter to Redis or Cloud Armor for multi-instance consistency
- [ ] Add request logging for abuse monitoring
- [ ] Consider stricter CSP (remove 'unsafe-inline' for scripts when possible)

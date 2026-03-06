# Sprint 3: Visual polish, observability, and production launch

> Theme: Ship capthca.ai to production with generated art, cinematic home page, and full observability.

---

## T3.1: Generate All Visual Assets from Art Direction
**Goal:** Use Nano Banana to generate 17 images defined in `content/shared/art-direction.md`
**Specialist:** Art / Image Generation
**Complexity:** Large
**DoD:**
- [ ] All 17 images generated and saved to correct paths (`public/tracks/*/assets/`, `public/assets/`)
- [ ] Images match art direction prompts (style, mood, dimensions)
- [ ] Images optimized for web (compressed, reasonable file sizes)
- [ ] `npm run ci` passes
**Technical Specs:**
- Read `content/shared/art-direction.md` for all 17 prompts with sizes and placements
- Use Nano Banana `/generate` command with `--yolo` flag
- Dark track: 7 images (hero + 6 section images) — cyberpunk/Matrix aesthetic
- Light track: 7 images (hero + 6 section images) — solarpunk/ethereal aesthetic
- Shared: 3 images (OG cards, favicon source, slider background)
- Save to paths specified in art-direction.md
- Compress with appropriate quality (hero images: high quality, section images: medium)
**Test Plan:**
- Manual: verify each image exists at expected path
- Manual: visual review against art direction descriptions
- CI: `npm run ci` passes (no broken imports)

---

## T3.2: Rebuild Home Page (DualitySlider) from Content Spec
**Goal:** Cinematic redesign of the home page slider from `content/home/duality-slider.md`
**Specialist:** Frontend (React / CSS)
**Complexity:** Large
**DoD:**
- [ ] DualitySlider rebuilt with glassmorphism vs Matrix rain halves
- [ ] Gradient collision zone at slider boundary
- [ ] Cinematic entrance animation on page load
- [ ] Hover expansion effect on each half
- [ ] Mobile vertical stack layout (responsive)
- [ ] CTAs link to /light and /dark respectively
- [ ] Content matches `content/home/duality-slider.md` verbatim
- [ ] `npm run ci` passes
**Technical Specs:**
- Read `content/home/duality-slider.md` for all copy and design direction
- Left half: light track preview (glassmorphism, gradient orbs, ethereal blur)
- Right half: dark track preview (Matrix rain, glitch text, CRT scanlines)
- Collision zone: gradient blend where halves meet, animated particles or glow
- Entrance: staggered fade-in with scale, 1-2s total duration
- Hover: hovered half expands (55/45 split), smooth transition
- Mobile: vertical stack, each half is full-width card, swipe or tap to choose
- Use existing components: MatrixRain, GlitchText, GradientOrbs
- Implement at `dashboard/app/page.tsx` (replace current slider)
**Test Plan:**
- Manual: desktop hover expansion, mobile vertical stack
- Manual: entrance animation plays once on load
- Manual: CTAs navigate to correct track pages
- CI: `npm run ci` passes

---

## T3.3: Structured JSON Logging
**Goal:** Replace all console.log/error with structured JSON logging compatible with Cloud Logging
**Specialist:** Backend / Observability
**Complexity:** Medium
**DoD:**
- [ ] Logger utility at `dashboard/lib/logger.ts` with `info`, `warn`, `error` methods
- [ ] All server-side console.log/error replaced with logger calls
- [ ] Log output is JSON with `severity`, `message`, `timestamp`, `metadata` fields
- [ ] Cloud Logging compatible (severity field matches GCP levels)
- [ ] Tests verify JSON output format
- [ ] `npm run ci` passes
**Technical Specs:**
- Create `dashboard/lib/logger.ts` with structured logger
- JSON format: `{ "severity": "INFO|WARNING|ERROR", "message": "...", "timestamp": "ISO8601", ...metadata }`
- GCP Cloud Logging picks up `severity` field automatically
- Replace `console.log` in: `subscribe/route.ts`, `secrets.ts`, any other server files
- Do NOT replace client-side console calls (components)
- Logger should accept metadata object for structured context (e.g., `{ email, track, ip }`)
**Test Plan:**
- Test file: `test/lib/logger.test.ts`
- Tests: JSON format validation, severity levels, metadata merging, timestamp format
- Expected: ~5 tests

---

## T3.4: Health Endpoint /api/health
**Goal:** Add health check endpoint that verifies Firestore connectivity
**Specialist:** Backend / API
**Complexity:** Small
**DoD:**
- [ ] GET /api/health returns `{ "status": "ok", "firestore": "connected" }` when healthy
- [ ] Returns 503 with `{ "status": "degraded", "firestore": "error", "message": "..." }` when Firestore is down
- [ ] Response includes `version` field from package.json or env var
- [ ] Tests cover healthy and degraded paths
- [ ] `npm run ci` passes
**Technical Specs:**
- Create `dashboard/app/api/health/route.ts`
- Firestore check: attempt a lightweight read (e.g., collection metadata or a canary doc)
- Use structured logger from T3.3 (or console if T3.3 not done yet)
- Include response time measurement
- No authentication required (public endpoint for Cloud Run probes)
**Test Plan:**
- Test file: `test/api/health.test.ts`
- Tests: healthy response, Firestore failure mock, response format, status codes
- Expected: ~4 tests

---

## T3.5: Custom Metrics for Subscribe API
**Goal:** Add counters for signups, errors, and rate limits on the subscribe endpoint
**Specialist:** Backend / Observability
**Complexity:** Medium
**DoD:**
- [ ] Metrics utility at `dashboard/lib/metrics.ts` with `increment` method
- [ ] Subscribe route emits: `subscribe.success`, `subscribe.error`, `subscribe.rate_limited`, `subscribe.invalid_input`
- [ ] Metrics logged as structured JSON (queryable in Cloud Logging)
- [ ] Tests verify metric emission for each event type
- [ ] `npm run ci` passes
**Technical Specs:**
- Create `dashboard/lib/metrics.ts` — lightweight counter that logs metrics as structured JSON
- Format: `{ "severity": "INFO", "metric": "subscribe.success", "value": 1, "labels": { "track": "light" } }`
- Cloud Monitoring can ingest these via log-based metrics
- Wire into `subscribe/route.ts` at each outcome: success, validation error, rate limited, Turnstile failure, server error
- Keep it simple — no external metrics library, just structured log lines
**Test Plan:**
- Test file: `test/lib/metrics.test.ts`
- Tests: increment emits correct JSON, labels included, each metric name valid
- Expected: ~5 tests

---

## T3.6: Request Logging for Abuse Monitoring
**Goal:** Log all API requests with structured metadata for abuse detection
**Specialist:** Backend / Security
**Complexity:** Small
**DoD:**
- [ ] All /api/* requests logged with: method, path, IP, user-agent, status code, response time
- [ ] Logs are structured JSON (Cloud Logging compatible)
- [ ] No PII beyond IP address in request logs
- [ ] Tests verify log format
- [ ] `npm run ci` passes
**Technical Specs:**
- Add request logging in `dashboard/middleware.ts` or a shared API utility
- Edge Runtime compatible (middleware runs on Edge)
- Log format: `{ "severity": "INFO", "type": "request", "method": "POST", "path": "/api/subscribe", "ip": "...", "userAgent": "...", "statusCode": 200, "responseTimeMs": 45 }`
- Consider: middleware can log request start, but may not have response status — evaluate best hook point
- Alternative: wrap API routes with a logging utility function
**Test Plan:**
- Test file: `test/infra/request-logging.test.ts`
- Tests: log format, required fields present, no PII leakage beyond IP
- Expected: ~3 tests

---

## T3.7: Instrument Slider Interaction Events
**Goal:** Track user interactions with the duality slider for analytics
**Specialist:** Frontend / Analytics
**Complexity:** Medium
**DoD:**
- [ ] Analytics utility at `dashboard/lib/analytics.ts` with `track` method
- [ ] Events tracked: `slider.view`, `slider.hover` (with side), `slider.choose` (with track), `slider.time_spent`
- [ ] Events sent to structured log or analytics endpoint
- [ ] No external analytics SDK (privacy-first approach)
- [ ] Tests verify event format and required fields
- [ ] `npm run ci` passes
**Technical Specs:**
- Create `dashboard/lib/analytics.ts` — client-side event tracker
- For MVP: send events to `/api/analytics` endpoint (or log to console in dev, beacon to server in prod)
- Create `dashboard/app/api/analytics/route.ts` — receives events, logs as structured JSON server-side
- Events: `{ "event": "slider.choose", "properties": { "track": "dark", "timeOnPage": 4500 } }`
- Wire into DualitySlider component (from T3.2, or current slider if T3.2 not done)
- Use `navigator.sendBeacon` for reliable delivery on page exit
**Test Plan:**
- Test file: `test/lib/analytics.test.ts`
- Tests: event format, required properties per event type, sanitization
- Expected: ~5 tests

---

## T3.8: Deploy Production to capthca.ai
**Goal:** Deploy production Cloud Run service and configure DNS for capthca.ai
**Specialist:** Infrastructure / DevOps
**Complexity:** Small
**DoD:**
- [ ] Production Cloud Run service running at capthca.ai
- [ ] DNS configured (A/AAAA or CNAME records)
- [ ] SSL certificate provisioned and active
- [ ] Smoke test: home page loads, /light and /dark accessible, subscribe form works
- [ ] `npm run ci` passes before deploy
**Technical Specs:**
- Use `bin/deploy-production.sh` (may need creation or update)
- Cloud Run service: `capthca-dashboard-prd` in project `capthca-489205`
- DNS: configure capthca.ai to point to Cloud Run service
- SSL: Google-managed certificate via Cloud Run domain mapping
- Environment: `CAPTHCA_LAND_ENV=production`, all `CAPTHCA_LAND_*` secrets from Secret Manager
- Firestore prefix: `prd_` (already configured)
- Remove basic auth for production (staging-only feature)
**Test Plan:**
- Manual: visit capthca.ai, verify SSL, test subscribe form
- Manual: verify Firestore writes go to `prd_subscribers`
- CI: `npm run ci` passes before deploy

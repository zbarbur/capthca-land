# Sprint 3 Handover

> Theme: Visual polish, observability, and production launch

## Completed Tasks

| Task | Status | Key Files |
|------|--------|-----------|
| T3.1 Generate visual assets | Done | `public/tracks/*/assets/`, `public/assets/` |
| T3.2 Rebuild DualitySlider | Done | `dashboard/app/components/DualitySlider.tsx`, `dashboard/app/page.tsx` |
| T3.3 Structured JSON logging | Done | `dashboard/lib/logger.ts`, `test/lib/logger.test.ts` |
| T3.4 Health endpoint | Done | `dashboard/app/api/health/route.ts`, `test/api/health.test.ts` |
| T3.5 Custom metrics | Done | `dashboard/lib/metrics.ts`, `test/lib/metrics.test.ts` |
| T3.6 Request logging | Done | `dashboard/middleware.ts`, `test/infra/request-logging.test.ts` |
| T3.7 Analytics instrumentation | Done | `dashboard/lib/analytics.ts`, `dashboard/app/api/analytics/route.ts` |
| T3.8 Production deploy | Done | `bin/deploy-production.sh`, `cloudbuild-deploy.yaml` |
| T3.9 Track pages + content | Done | `dashboard/app/dark/page.tsx`, `dashboard/app/light/page.tsx` |
| Slider edge-drag fix | Done | `dashboard/app/components/DualitySlider.tsx` |

## Deferred Items

None — all sprint tasks completed.

## Key Decisions

- Blue/green deployment for production (deploy with `--no-traffic`, then route traffic)
- Privacy-first analytics — no external SDK, custom `/api/analytics` endpoint with structured logs
- Structured JSON logging compatible with GCP Cloud Logging (severity field auto-parsed)
- Slider edge-drag thresholds widened (5%/95% during drag, 8%/92% on release) for usability

## Architecture Changes

- **Observability stack added:** logger.ts, metrics.ts, analytics.ts — all output structured JSON for Cloud Logging
- **Health endpoint:** `/api/health` with Firestore connectivity check (used by Cloud Run probes)
- **Production service:** `capthca-land-prod` on Cloud Run with domain mapping to `capthca.ai`
- **Content system:** `content/` directory with markdown + YAML frontmatter as source of truth for page copy

## Known Issues

- Mobile slider drag-to-navigate not implemented (mobile uses tap links instead)
- "V4" references in site copy need removal
- `www.capthca.ai` CNAME not yet configured in GoDaddy DNS
- Rate limiter is in-memory (resets on container restart)
- Turnstile CSP warning on track pages (cosmetic, Cloudflare-side)

## Test Coverage

- 63 tests across 14 suites, all passing
- Coverage areas: API contracts, security hardening, logging format, analytics, metrics, Firestore prefix, secrets

## Recommendations for Next Sprint

- Fix V4 references in copy (quick win)
- Set up www.capthca.ai CNAME
- Mobile slider UX improvements
- Consider Cloudflare DNS migration for CDN + DDoS protection
- Subscriber management tooling for operational needs

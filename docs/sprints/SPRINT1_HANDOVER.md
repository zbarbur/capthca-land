# Sprint 1 Handover — Dual-narrative MVP

> **Sprint Theme:** Slider, tracks, and email capture live at staging.capthca.ai
> **Duration:** Sprint 1 (completed 2026-03-04)
> **Branch:** `sprint1/main`

---

## Completed Tasks

| Task | Status | Key Files |
|------|--------|-----------|
| T1.1 — Local dev stack (Tailwind + Firestore) | Done | `bin/local-stack.sh`, `dashboard/tailwind.config.ts`, `dashboard/postcss.config.mjs` |
| T1.2 — Duality slider React component | Done | `dashboard/app/components/DualitySlider.tsx`, `dashboard/app/page.tsx` |
| T1.3 — Theme switching system | Done | `dashboard/app/components/ThemeProvider.tsx`, `dashboard/app/globals.css` |
| T1.4 — Mobile-responsive slider + touch | Done | `dashboard/app/components/DualitySlider.tsx` (touch handlers) |
| T1.5 — Light track page (/light) | Done | `dashboard/app/light/page.tsx` |
| T1.6 — Dark track page (/dark) | Done | `dashboard/app/dark/page.tsx` |
| T1.7 — Email subscribe API | Done | `dashboard/app/api/subscribe/route.ts`, `dashboard/lib/firestore.ts` |
| T1.8 — Email capture forms | Done | `dashboard/app/components/EmailCapture.tsx` |
| T1.9 — Security review | Done | `docs/security/SPRINT1_REVIEW.md`, rate limiter, CSP, Turnstile, honeypot |
| T1.10 — Cloud Run deployment | Partial | Staging deployed; production DNS deferred |

## Deferred Items

- **Production deploy** (T1.10 partial): `bin/deploy-production.sh` is ready but capthca.ai DNS not pointed to production Cloud Run service yet. Staging at staging.capthca.ai is live and verified.

---

## Key Decisions

- **Turnstile over reCAPTCHA**: Chose Cloudflare Turnstile for CAPTCHA — lighter, privacy-friendly, integrates with planned Cloudflare DNS migration
- **Staging auth via middleware**: Basic auth middleware (`dashboard/middleware.ts`) protects staging; will be replaced by Cloudflare Access after DNS migration
- **In-memory rate limiter**: Acceptable for single Cloud Run instance; Redis/Cloud Armor upgrade in backlog for multi-instance
- **Lazy Firestore init**: Firebase client initializes on first request, not at import time — required because Next.js evaluates API routes during build

---

## Architecture Changes

### New Components
- `DualitySlider.tsx` — interactive split-screen slider with mouse/touch support
- `ThemeProvider.tsx` — React context for theme switching (light/dark CSS variables)
- `EmailCapture.tsx` — email form with Turnstile CAPTCHA, honeypot, client validation
- `middleware.ts` — Edge Runtime basic auth for staging environments

### Infrastructure
- **GCP Project:** `capthca-489205` (Cloud Run, Firestore, Artifact Registry, Secret Manager)
- **Cloud Build:** `cloudbuild.yaml` (staging auto-deploy), `cloudbuild-deploy.yaml` (production manual)
- **Secrets:** `turnstile-secret-key`, `staging-auth-pass` in Secret Manager
- **Domain:** `staging.capthca.ai` → Cloud Run via CNAME to `ghs.googlehosted.com`
- **`ci:full` script:** Regular CI + `next build` for pre-deploy validation
- **`bin/domain-status.sh`:** CLI for checking domain mappings, DNS, and SSL status

### Security Layers
1. Rate limiting (in-memory, 5 req/IP/min)
2. Cloudflare Turnstile CAPTCHA verification
3. Honeypot field (hidden `name="website"`)
4. IP extraction fix (last `x-forwarded-for` entry for Cloud Run)
5. CSP headers (script-src, connect-src, frame-src for Turnstile)
6. Email sanitization (trim, lowercase, 254 char limit)

---

## Known Issues

- Turnstile console warnings on track pages (non-blocking, cosmetic)
- No favicon (returns 404) — backlog item B2
- Production DNS not configured — deferred to Sprint 2

---

## Test Coverage

| Metric | Value |
|--------|-------|
| Total Tests | 13 |
| Passing | 13 |
| Test Runner | Node.js built-in (`node --test`) |
| Key Test Files | `test/api/subscribe.test.ts`, `test/api/rate-limit.test.ts`, `test/ui/slider.test.ts`, `test/ui/theme.test.ts`, `test/ui/tracks.test.ts`, `test/ui/email-capture.test.ts` |

---

## Recommendations for Sprint 2

1. **Deploy production** — scripts are ready, just need DNS configuration
2. **Cloudflare DNS migration** (B1) — enables CDN, DDoS protection, Cloudflare Access for staging
3. **Add favicon** (B2) — quick win, currently 404
4. **Analytics instrumentation** — track slider interactions, email conversions
5. **SEO meta tags** — Open Graph for social sharing

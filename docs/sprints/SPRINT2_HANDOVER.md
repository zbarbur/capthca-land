# Sprint 2 Handover

## Sprint Theme
Security hardening, content polish, and SecretProvider wiring.

## Completed Tasks

| Task | Title | Size | Key Files |
|------|-------|------|-----------|
| T2.1 | Wire SecretProvider | S | `dashboard/lib/secrets.ts`, `subscribe/route.ts`, `middleware.ts`, `cloudbuild*.yaml` |
| T2.2 | Add favicon | S | `dashboard/app/icon.svg` |
| T2.3 | SEO meta tags + OG | S | `dashboard/app/layout.tsx`, `dark/page.tsx`, `light/page.tsx` |
| T2.4 | Add HSTS header | S | `dashboard/next.config.mjs` |
| T2.5 | Body size limit | S | `dashboard/app/api/subscribe/route.ts` |
| T2.6 | No input reflection | S | Verified via test — no code change needed |
| T2.7 | Firestore collection prefix | S | `dashboard/lib/firestore.ts`, `cloudbuild*.yaml`, `.env.*` |
| T2.8 | Security non-regression tests | S | `test/infra/security-hardening.test.ts`, `test/infra/firestore-prefix.test.ts` |
| T2.9 | Dark track design | M | `MatrixRain.tsx`, `GlitchText.tsx`, `ScrollReveal.tsx`, `dark/page.tsx`, `globals.css` |
| T2.10 | Dark track copy | M | `dark/page.tsx` — content already in page |
| T2.11 | Light track design | M | `GradientOrbs.tsx`, `ScrollReveal.tsx`, `light/page.tsx`, `globals.css` |
| T2.12 | Light track copy | M | `light/page.tsx` — content already in page |

**Bonus fixes:**
- Body size limit bumped 1024→4096 for Turnstile token compatibility
- Subscriber data enriched with IP, user agent, referer, accept-language
- Old unprefixed Firestore `subscribers` collection cleared

## Deferred Items
None — all 12 tasks completed.

## Key Decisions
- `CAPTHCA_LAND_` prefix for all env vars (namespacing over convenience)
- Copied `secrets.ts` into dashboard/ rather than configuring transpilePackages
- Edge Runtime constraint: middleware stays on raw `process.env` (no Buffer/SecretProvider)
- Body size limit raised to 4096 bytes to accommodate Turnstile tokens
- Dark track uses `steps()` CSS timing; light track uses `ease-out` — deliberate contrast

## Architecture Changes
- **SecretProvider pattern**: Interface + factory (`GCPSecretProvider` / `EnvSecretProvider`) at `dashboard/lib/secrets.ts`
- **Firestore prefix**: `getCollectionPrefix()` returns `prd_`, `stg_`, or `local_` based on `CAPTHCA_LAND_ENV`
- **New components**: `MatrixRain.tsx` (canvas), `GlitchText.tsx` (CSS pseudo-elements), `ScrollReveal.tsx` (IntersectionObserver), `GradientOrbs.tsx` (CSS radial gradients)
- **CSS animation system**: Dark track (glitch, alert pulse, CRT flicker, scan line) vs Light track (orb drift, hero float, smooth reveal, pull quote scale) — all with `prefers-reduced-motion` overrides

## Known Issues
- CSP `script-src` warning from Turnstile widget's internal iframe — Cloudflare-side, cannot fix from our CSP config (cosmetic, non-blocking)
- Turnstile console warnings on track pages (cosmetic)
- `gcloud` not in default PATH on dev machine — needs `source /opt/homebrew/share/google-cloud-sdk/path.zsh.inc`
- Nanobanana image generation untested due to Gemini API 503 (high demand)

## Lessons Learned
- Turnstile tokens are larger than expected (~2KB+) — body size limits need headroom
- CSP on Turnstile: the widget uses eval internally, our CSP allows it but the iframe still logs warnings

## Test Coverage

| Metric | Value |
|--------|-------|
| Total Tests | 30 |
| Suites | 9 |
| Pass | 30 |
| Fail | 0 |

New tests added: 17 (secrets: 7, firestore prefix: 5, security hardening: 5)

## Commits (18)
```
9bafe69 chore: add subscriber profiling enrichment to backlog
544e6b2 feat: enrich subscriber data with IP, user agent, referer, language
5f0bb69 fix: increase body size limit to 4096 for Turnstile tokens
153d2df feat: dark + light track design overhaul (T2.9, T2.11)
52f076f feat: add SEO meta tags and Open Graph metadata (T2.3)
e4bb204 feat: add SVG favicon — gold C on black (T2.2)
1cbd664 test: add security non-regression and Firestore prefix tests (T2.8)
13f4ab8 feat: add Firestore collection prefix for env isolation (T2.7)
0f03b8d feat: add body size limit on /api/subscribe (T2.5)
cc84ff0 feat: add HSTS header (T2.4)
a93c715 Merge branch 'feat/secret-provider-wiring' into sprint2/main
acf2548 Add track design and content tasks to Sprint 2 (T2.9-T2.12)
ad9f81b refactor: rename Cloud Build secret env vars to CAPTHCA_LAND_ prefix
b1ecd35 refactor: rename env vars to CAPTHCA_LAND_ prefix in .env files
f1eef55 docs: update Dockerfile runtime secrets comment
3769586 refactor: rename middleware env vars to CAPTHCA_LAND_ prefix
1430edd feat: wire SecretProvider into subscribe route for Turnstile secret
8e6f5a8 test: add SecretProvider unit tests
b246717 feat: copy SecretProvider into dashboard/lib for Next.js access
```

## Recommendations for Sprint 3
1. **Rebuild home page** — DualitySlider is the first impression; needs the cinematic treatment both tracks now have
2. **Logging & monitoring** — structured JSON logging, health endpoint, subscribe metrics before production deploy
3. **Production deploy** — capthca.ai DNS + Cloud Run service
4. **Subscriber tooling** — management scripts + profiling enrichment for early user insights

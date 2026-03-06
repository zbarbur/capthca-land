# Sprint 2: Security hardening, content polish, and SecretProvider

---

### T2.1 — Wire SecretProvider into dashboard
- **Goal:** Integrate the SecretProvider abstraction so all server-side secrets use `CAPTHCA_LAND_` prefixed env vars, improving consistency and testability
- **Specialist:** infra-architect
- **Complexity:** S
- **Depends on:** None _(implementation complete on `feat/secret-provider-wiring` branch — merge and verify)_
- **DoD:**
  - [ ] `dashboard/lib/secrets.ts` exists with `SecretProvider` interface, `GCPSecretProvider`, `EnvSecretProvider`, factory
  - [ ] `subscribe/route.ts` uses `createSecretProvider().getSecret("turnstile-secret-key")` instead of raw `process.env`
  - [ ] `middleware.ts` uses `CAPTHCA_LAND_STAGING_AUTH_PASS` and `CAPTHCA_LAND_STAGING_AUTH_USER`
  - [ ] `cloudbuild.yaml` and `cloudbuild-deploy.yaml` use `CAPTHCA_LAND_*` env var names in `--set-secrets`
  - [ ] `.env.example` and `.env.local` use `CAPTHCA_LAND_*` env var names
  - [ ] Tests pass (`npm test`) — includes 7 SecretProvider tests
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Merge `feat/secret-provider-wiring` branch (7 commits, already tested)
  - Key files: `dashboard/lib/secrets.ts`, `dashboard/app/api/subscribe/route.ts`, `dashboard/middleware.ts`, `cloudbuild.yaml`, `cloudbuild-deploy.yaml`, `.env.example`, `.env.local`, `Dockerfile`
  - Test file: `test/infra/secrets.test.ts` (7 tests)
- **Test Plan:**
  - `test/infra/secrets.test.ts` — EnvSecretProvider resolution, kebab-to-UPPER_SNAKE transform, missing secret throws, custom prefix, factory singleton, Turnstile secret lookup
- **Demo Data Impact:**
  - None — secret management infrastructure only

---

### T2.2 — Add favicon
- **Goal:** Add a favicon to the site so browsers don't return 404 on favicon.ico requests
- **Specialist:** frontend-engineer
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] `dashboard/app/favicon.ico` exists and is served at `/favicon.ico`
  - [ ] Browser tab shows the favicon when visiting any page
  - [ ] No 404 in browser network tab for favicon.ico
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Create or source a favicon that fits CAPTHCA brand (dual-narrative / helix motif)
  - Place at `dashboard/app/favicon.ico` (Next.js App Router convention — auto-served)
  - Optionally add `apple-touch-icon.png` in `dashboard/app/` for iOS
  - Optionally add `icon` metadata export in `dashboard/app/layout.tsx`
- **Test Plan:**
  - Manual: visit localhost:3000, verify favicon in browser tab
  - `test/infra/dependency-completeness.test.ts` — add check that `dashboard/app/favicon.ico` exists
- **Demo Data Impact:**
  - None — static asset only

---

### T2.3 — SEO meta tags and Open Graph
- **Goal:** Add SEO meta tags and Open Graph metadata so the site renders rich previews when shared on social media
- **Specialist:** frontend-engineer
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] `<title>` and `<meta name="description">` set on all pages (/, /light, /dark)
  - [ ] Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) on all pages
  - [ ] Twitter card meta tags (`twitter:card`, `twitter:title`, `twitter:description`) on all pages
  - [ ] Content sourced from `content/shared/meta.md`
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Read `content/shared/meta.md` for title, description, and OG values
  - Use Next.js `metadata` export in `dashboard/app/layout.tsx` for site-wide defaults
  - Override per-page in `dashboard/app/light/page.tsx` and `dashboard/app/dark/page.tsx` using `generateMetadata`
  - OG image: use existing helix-hero.png from `public/tracks/` or a shared image
- **Test Plan:**
  - `test/ui/meta.test.ts` — verify metadata exports exist in layout.tsx, light/page.tsx, dark/page.tsx (source-level check)
- **Demo Data Impact:**
  - None — metadata only

---

### T2.4 — Add HSTS header
- **Goal:** Add Strict-Transport-Security header to enforce HTTPS connections and prevent SSL stripping attacks
- **Specialist:** devsecops-expert
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains` header present on all responses
  - [ ] Header configured in `dashboard/next.config.mjs` alongside existing security headers
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Add `{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }` to the headers array in `dashboard/next.config.mjs`
  - Place after existing `X-Frame-Options` header
- **Test Plan:**
  - `test/infra/security-hardening.test.ts` — source-level: verify `next.config.mjs` contains `Strict-Transport-Security` with `max-age=31536000`
- **Demo Data Impact:**
  - None — HTTP header only

---

### T2.5 — Input validation hardening: body size limit
- **Goal:** Reject oversized request bodies on `/api/subscribe` before JSON parsing to prevent memory pressure from large payloads
- **Specialist:** devsecops-expert
- **Complexity:** S
- **Depends on:** T2.1 (subscribe route modified by SecretProvider wiring)
- **DoD:**
  - [ ] Requests with `Content-Length` > 1KB return 413 with `{ error: "payload_too_large" }`
  - [ ] Requests without `Content-Length` that exceed 1KB after reading also return 413
  - [ ] Normal subscribe requests (< 200 bytes) continue to work
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Add body size check at the top of the POST handler in `dashboard/app/api/subscribe/route.ts`
  - Check `Content-Length` header first (fast path), then limit body read
  - Limit: 1024 bytes (subscribe payload is ~100 bytes)
  - Return `NextResponse.json({ error: "payload_too_large" }, { status: 413 })`
- **Test Plan:**
  - `test/api/subscribe.test.ts` — add: body size validation test (content-length > 1KB should be rejected)
- **Demo Data Impact:**
  - None — validation hardening

---

### T2.6 — No input reflection in error messages
- **Goal:** Audit and ensure error messages never echo back user-supplied values, preventing information leakage and potential XSS in API consumers
- **Specialist:** devsecops-expert
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] All error responses in `subscribe/route.ts` use static strings (no template literals with user input)
  - [ ] Non-regression test verifies no `${` interpolation in error response lines
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Audit `dashboard/app/api/subscribe/route.ts` — verify all `error:` values are string literals
  - Audit any other API routes (currently only subscribe)
  - The `console.error("Firestore write error:", err)` is server-side only (safe) — no change needed
- **Test Plan:**
  - `test/infra/security-hardening.test.ts` — source-level: read all `route.ts` files, check that lines containing `error:` don't contain `${` interpolation
- **Demo Data Impact:**
  - None — security audit

---

### T2.7 — Firestore collection prefix for environment isolation
- **Goal:** Add environment-based prefix to Firestore collection names (`stg_`, `prd_`, `local_`) to prevent cross-environment data pollution
- **Specialist:** infra-architect
- **Complexity:** S
- **Depends on:** T2.1 (firestore.ts may be affected by SecretProvider changes)
- **DoD:**
  - [ ] `dashboard/lib/firestore.ts` prepends env-based prefix to collection names
  - [ ] Prefix determined by `CAPTHCA_LAND_ENV` env var: `prd` -> `prd_`, `stg` -> `stg_`, else `local_`
  - [ ] Subscribe route writes to `stg_subscribers` on staging, `prd_subscribers` on production, `local_subscribers` locally
  - [ ] `cloudbuild.yaml` sets `CAPTHCA_LAND_ENV=stg` in `--set-env-vars`
  - [ ] `cloudbuild-deploy.yaml` sets `CAPTHCA_LAND_ENV=prd` in `--set-env-vars`
  - [ ] `.env.example` documents `CAPTHCA_LAND_ENV` (default: `local`)
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Add `CAPTHCA_LAND_ENV` env var (values: `prd`, `stg`, `local`)
  - Modify `db.collection(name)` wrapper in `dashboard/lib/firestore.ts` to prepend `${prefix}_` to collection name
  - Prefix map: `prd` -> `prd_`, `stg` -> `stg_`, everything else -> `local_`
  - Update `cloudbuild.yaml` `--set-env-vars` to include `CAPTHCA_LAND_ENV=stg`
  - Update `cloudbuild-deploy.yaml` `--set-env-vars` to include `CAPTHCA_LAND_ENV=prd`
  - Add `CAPTHCA_LAND_ENV=local` to `.env.example`
- **Test Plan:**
  - `test/infra/firestore-prefix.test.ts` — unit: prefix function returns correct prefix for each env value
  - `test/api/subscribe.test.ts` — update existing tests if they reference collection names
- **Demo Data Impact:**
  - Existing Firestore `subscribers` collection becomes `stg_subscribers` on staging — existing data stays in unprefixed collection (one-time, acceptable for MVP scale)

---

### T2.8 — Security non-regression tests
- **Goal:** Add source-level tests that catch security regressions in CI — verify HSTS, CSP directives, no input reflection, and body size limits are present in code
- **Specialist:** devsecops-expert
- **Complexity:** S
- **Depends on:** T2.4, T2.5, T2.6 (security features must exist to test)
- **DoD:**
  - [ ] Test verifies HSTS header with 1-year max-age in `next.config.mjs`
  - [ ] Test verifies CSP includes required directives (default-src, script-src, frame-ancestors)
  - [ ] Test verifies no user input reflection in API error responses
  - [ ] Test verifies body size limit check exists in subscribe route
  - [ ] All non-regression tests in a single file: `test/infra/security-hardening.test.ts`
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New file: `test/infra/security-hardening.test.ts`
  - Read source files and assert security patterns exist (inspired by battle-tested patterns 5.2)
  - Tests:
    1. Read `next.config.mjs` -> assert contains `Strict-Transport-Security` with `max-age=31536000`
    2. Read `next.config.mjs` -> assert CSP contains `default-src`, `script-src`, `frame-ancestors`
    3. Read all `app/api/**/route.ts` -> assert no `error:.*\${` pattern (no input reflection)
    4. Read `app/api/subscribe/route.ts` -> assert contains `413` or `payload_too_large` (body size limit)
- **Test Plan:**
  - Self-testing: these ARE the tests
  - Expected: ~4-5 new test cases
- **Demo Data Impact:**
  - None — test infrastructure only

---

### T2.9 — Dark track design: Matrix rain, CRT scanlines, glitch typography
- **Goal:** Implement the visual design system for `/dark` from `content/dark/_track.md` — Matrix digital rain background, CRT scanline overlay, glitch heading typography, and alert box styling
- **Specialist:** frontend-engineer
- **Complexity:** M
- **Depends on:** None
- **DoD:**
  - [ ] Canvas-based Matrix digital rain background (katakana + Latin + numerals, #00FF41 fading to #003B00)
  - [ ] Rain renders at ~15-20% opacity behind content, atmospheric not distracting
  - [ ] Mobile: reduced character density (50%) or static pattern fallback
  - [ ] `prefers-reduced-motion`: disables animation, shows static grid
  - [ ] CRT scanline overlay via CSS repeating-linear-gradient (4px size, no JS)
  - [ ] Phosphor glow on text: `text-shadow 0 0 8px rgba(57,255,20,0.3)`
  - [ ] Heading glitch effect: CSS chromatic aberration on hover/viewport entry using pseudo-elements
  - [ ] Section heading format: "01 // TITLE" with 8px acid-green left border
  - [ ] Alert boxes: #111 bg, 1px solid #ff003c border, ALL CAPS bold monospaced, pulsing box-shadow
  - [ ] Terminal-style containers: hard borders, no rounded corners
  - [ ] Scroll reveal: sections fade in + translateY(20px) with step() timing
  - [ ] Total animation JS < 20KB gzipped
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New component: `dashboard/app/components/MatrixRain.tsx` — canvas-based digital rain (client component)
  - Use `requestAnimationFrame`, cap at 30fps on mobile, OffscreenCanvas where supported
  - Character set: half-width katakana (U+FF61-FF9F) + Latin uppercase + digits
  - New component: `dashboard/app/components/GlitchText.tsx` — CSS glitch effect wrapper
  - Uses `clip-path` pseudo-elements, 2-3px horizontal shift, `steps(2)` timing
  - Update `dashboard/app/dark/page.tsx` — integrate MatrixRain, update scanline overlay, apply design tokens from `_track.md`
  - All palette values from `content/dark/_track.md` frontmatter
  - Follow CLAUDE.md Content System rules: design_notes are instructions, not suggestions
- **Test Plan:**
  - `test/ui/dark-design.test.ts` — source-level: verify MatrixRain.tsx exists, verify prefers-reduced-motion handling in code, verify GlitchText.tsx exists
  - Manual: visit /dark, verify visual effects
- **Demo Data Impact:**
  - None — visual design only

---

### T2.10 — Dark track copy update from content/dark/01-04.md
- **Goal:** Update `/dark` page copy to match `content/dark/01-vulnerability.md` through `04-declaration.md` — use body text verbatim, follow `layout_hint` and `design_notes` from frontmatter
- **Specialist:** frontend-engineer
- **Complexity:** M
- **Depends on:** T2.9 (design components must exist for proper styling)
- **DoD:**
  - [ ] Section 1 (01 // THE VULNERABILITY) copy matches `content/dark/01-vulnerability.md` body text verbatim
  - [ ] Section 2 (02 // THE REVERSAL) copy matches `content/dark/02-reversal.md` body text verbatim
  - [ ] Section 3 (03 // THE PROTOCOL) copy matches `content/dark/03-protocol.md` body text verbatim
  - [ ] Section 4 (04 // THE DECLARATION) copy matches `content/dark/04-declaration.md` body text verbatim
  - [ ] CTA section matches `content/dark/cta.md`
  - [ ] Each section follows its `layout_hint` (standard, hero, split, centered)
  - [ ] Each section follows its `design_notes` for specific styling
  - [ ] Content markers (`{highlight}`, `{table}`, `{alert}`, `{quote}`) mapped to React components
  - [ ] Sources from frontmatter used for attribution where appropriate
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Read each `content/dark/0X-*.md` file for body text and frontmatter
  - Update `dashboard/app/dark/page.tsx` — replace hardcoded JSX with content from markdown files
  - Follow CLAUDE.md rules: NEVER rewrite content, implement verbatim
  - Map content markers to components: `{alert}` -> red alert box, `{highlight}` -> accent text, `{quote}` -> styled blockquote
  - Images referenced by filename, served from `/tracks/dark/assets/`
- **Test Plan:**
  - `test/ui/dark-content.test.ts` — source-level: verify page.tsx contains key phrases from each section's markdown body
  - Manual: compare /dark page against content/ files
- **Demo Data Impact:**
  - None — static content update

---

### T2.11 — Light track design: glassmorphism, gradient orbs, organic motion
- **Goal:** Implement the visual design system for `/light` from `content/light/_track.md` — warm gradient background, glassmorphism cards, section badges, organic scroll animations
- **Specialist:** frontend-engineer
- **Complexity:** M
- **Depends on:** None
- **DoD:**
  - [ ] Warm off-white base (#FFFDF7) with floating radial gradient orbs (ethereal blue + warm gold)
  - [ ] Gradient orbs drift slowly (60s+ CSS animation, compositor-friendly)
  - [ ] Glassmorphism cards: rgba(255,255,255,0.45) bg, backdrop-filter blur(12px), 1px white border, rounded 16px
  - [ ] Fallback for no backdrop-filter: solid rgba(248,253,255,0.9)
  - [ ] Section badges: pill-shaped, sunrise gold (#FFD700) bg, deep navy text, uppercase
  - [ ] Lattice texture dividers between sections (~18% opacity, masked to transparent)
  - [ ] Highlight boxes: faint blue-white bg, 6px gold left border, italic text, rounded 12px
  - [ ] Pull quotes: 1.4em, weight 300, italic, accent blue, centered, decorative opening quote
  - [ ] Partnership table: rounded-xl, gold left border, ethereal blue header
  - [ ] Scroll reveal: fade in + translateY(30px->0), ease-out 600ms, staggered 100ms
  - [ ] `prefers-reduced-motion`: disables all animation, shows static state
  - [ ] Images: rounded-3xl, subtle shadow, light border
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Update `dashboard/app/light/page.tsx` — apply glassmorphism, gradient orbs, badges, highlight boxes
  - New component: `dashboard/app/components/ScrollReveal.tsx` — Intersection Observer wrapper for fade-in
  - New component: `dashboard/app/components/SectionBadge.tsx` — gold pill badge
  - New component: `dashboard/app/components/HighlightBox.tsx` — gold-bordered callout
  - New component: `dashboard/app/components/PullQuote.tsx` — styled blockquote
  - CSS animations for gradient orb drift (transform + opacity only, compositor-friendly)
  - All palette values from `content/light/_track.md` frontmatter
  - Follow CLAUDE.md Content System rules: design_notes are instructions, not suggestions
- **Test Plan:**
  - `test/ui/light-design.test.ts` — source-level: verify ScrollReveal.tsx, SectionBadge.tsx exist, verify prefers-reduced-motion in code
  - Manual: visit /light, verify visual effects
- **Demo Data Impact:**
  - None — visual design only

---

### T2.12 — Light track copy update from content/light/01-04.md
- **Goal:** Update `/light` page copy to match `content/light/01-origins.md` through `04-sovereignty.md` — use body text verbatim, follow `layout_hint` and `design_notes` from frontmatter
- **Specialist:** frontend-engineer
- **Complexity:** M
- **Depends on:** T2.11 (design components must exist for proper styling)
- **DoD:**
  - [ ] Section 1 (From Blocking to Bonding) copy matches `content/light/01-origins.md` body text verbatim
  - [ ] Section 2 (The Neural Handshake) copy matches `content/light/02-symbiosis.md` body text verbatim
  - [ ] Section 3 (The Three-Way Handshake) copy matches `content/light/03-handshake.md` body text verbatim
  - [ ] Section 4 (Digital Self-Sovereignty) copy matches `content/light/04-sovereignty.md` body text verbatim
  - [ ] CTA section matches `content/light/cta.md`
  - [ ] Each section follows its `layout_hint` (standard, hero, split, centered)
  - [ ] Each section follows its `design_notes` for specific styling
  - [ ] Content markers (`{highlight}`, `{table}`, `{alert}`, `{quote}`) mapped to React components
  - [ ] Section badges show correct text from frontmatter `badge` field
  - [ ] Sources from frontmatter used for attribution where appropriate
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Read each `content/light/0X-*.md` file for body text and frontmatter
  - Update `dashboard/app/light/page.tsx` — replace hardcoded JSX with content from markdown files
  - Follow CLAUDE.md rules: NEVER rewrite content, implement verbatim
  - Map content markers to components: `{highlight}` -> gold-bordered box, `{table}` -> partnership table, `{quote}` -> PullQuote
  - Section badges from frontmatter `badge` field (e.g., "The Evolution", "The Symbiosis")
  - Images referenced by filename, served from `/tracks/light/assets/`
- **Test Plan:**
  - `test/ui/light-content.test.ts` — source-level: verify page.tsx contains key phrases from each section's markdown body
  - Manual: compare /light page against content/ files
- **Demo Data Impact:**
  - None — static content update

---

## Sprint 2 Summary

| Task | Title | Size | Depends |
|------|-------|------|---------|
| T2.1 | Wire SecretProvider | S | None |
| T2.2 | Add favicon | S | None |
| T2.3 | SEO meta tags + OG | S | None |
| T2.4 | Add HSTS header | S | None |
| T2.5 | Body size limit | S | T2.1 |
| T2.6 | No input reflection | S | None |
| T2.7 | Firestore collection prefix | S | T2.1 |
| T2.8 | Security non-regression tests | S | T2.4, T2.5, T2.6 |
| T2.9 | Dark track design | M | None |
| T2.10 | Dark track copy | M | T2.9 |
| T2.11 | Light track design | M | None |
| T2.12 | Light track copy | M | T2.11 |

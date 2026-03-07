# Sprint 4: Content depth, subscriber tooling, and hardening

> Theme: Build out the full inner-page experience from content/, add subscriber ops tooling, and tighten security.

---

### T4.1 — Implement content system (markdown rendering pipeline)
- **Goal:** Build a reusable pipeline that reads markdown+frontmatter from `content/` and renders it into React components, so pages are driven by content files rather than hardcoded JSX
- **Specialist:** Frontend (React / Content)
- **Complexity:** M
- **Depends on:** None
- **DoD:**
  - [x] Content loader utility at `dashboard/lib/content.ts` reads `.md` files with YAML frontmatter
  - [x] Frontmatter fields parsed: `track`, `slug`, `title`, `badge`, `layout_hint`, `design_notes`, `sources`
  - [x] Markdown body rendered to React elements with support for content markers: `{highlight}`, `{table}`, `{alert}`, `{quote}`
  - [x] Content markers map to styled React components matching track design language
  - [x] Tests verify frontmatter parsing, markdown rendering, and content marker mapping
  - [x] Tests pass (`npm test`)
  - [x] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New file: `dashboard/lib/content.ts` — reads markdown, parses YAML frontmatter (use `gray-matter` or lightweight parser)
  - New file: `dashboard/components/ContentRenderer.tsx` — renders parsed markdown to React with content marker support
  - Content markers: `{highlight}` → highlighted box, `{table}` → styled table, `{alert}` → alert box, `{quote}` → pull quote
  - Track-aware styling: dark track markers get HUD/terminal treatment, light track get glassmorphism treatment
  - Must work with Next.js App Router (server components where possible)
  - Read `content/CONTENT_SYSTEM.md` for full spec
- **Test Plan:**
  - `test/lib/content.test.ts` — frontmatter parsing, markdown rendering, marker extraction
  - Expected: ~8 tests
- **Demo Data Impact:**
  - None — content files already exist in `content/`

---

### T4.2 — Scaffold all inner page routes (7 pages x 2 tracks)
- **Goal:** Create Next.js routes for all 14 inner pages using the content system, so each page renders its corresponding markdown file
- **Specialist:** Frontend (React / Routing)
- **Complexity:** M
- **Depends on:** T4.1
- **DoD:**
  - [x] Routes exist: `/dark/{slug}` and `/light/{slug}` for all 7 slugs (how-it-works, about, faq, philosophy, whitepaper, use-cases, human-vs-machine)
  - [x] Each page renders content from its corresponding `content/{track}/pages/{slug}.md` file
  - [x] Pages use correct layout per `layout_hint` frontmatter (standard, split, centered)
  - [x] Navigation between inner pages and back to track landing page works
  - [x] Pages have correct SEO metadata (title, description) from frontmatter
  - [x] All 14 pages load without errors
  - [x] Tests pass (`npm test`)
  - [x] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Dynamic route: `dashboard/app/[track]/[slug]/page.tsx` or individual route files per page
  - Use `generateStaticParams` to pre-render all 14 pages at build time
  - Shared layout: `dashboard/app/[track]/layout.tsx` — applies track theme class (`.theme-dark` / `.theme-light`)
  - Each page calls content loader from T4.1, passes result to ContentRenderer
  - Nav component: links to sibling pages within the same track + back to track landing
  - SEO: use frontmatter `title` and first paragraph as description in metadata export
- **Test Plan:**
  - `test/pages/inner-pages.test.ts` — route existence, content loading, metadata presence
  - Expected: ~6 tests
- **Demo Data Impact:**
  - None — pages are content-driven

---

### T4.3 — Per-page design polish (track-specific styling + header images)
- **Goal:** Apply full track design language to all inner pages — HUD frames and terminal aesthetics for dark, glassmorphism and warm gradients for light — plus header banner images
- **Specialist:** Frontend (React / CSS / Art)
- **Complexity:** L
- **Depends on:** T4.2
- **DoD:**
  - [x] Dark track pages: HUD corner brackets on images, acid-green borders, monospace callouts, terminal-style FAQ blocks
  - [x] Light track pages: glassmorphism cards, rounded corners (16px), gold accent borders, pull quotes with warm styling
  - [x] Header banner images generated and placed per `content/shared/image-placement.md` specs
  - [x] Header images: wide banners (2048x512) for how-it-works, about, philosophy, human-vs-machine per track
  - [x] Whitepaper pages have cover images (1024x1024)
  - [x] FAQ and use-cases pages use track design language without header images (per spec)
  - [x] Images use `next/image` with lazy loading, responsive sizing
  - [x] `sources` from frontmatter rendered as attribution/references section
  - [x] Mobile responsive — header banners reduce to 30vh or hidden on small screens
  - [x] Tests pass (`npm test`)
  - [x] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Read `content/shared/image-placement.md` for exact image specs and placement rules
  - Generate header images using Nano Banana per image-placement.md descriptions
  - Dark track image framing: CSS pseudo-elements for HUD corner brackets
  - Light track image framing: `border-radius: 16px`, faint glassmorphism border
  - Layout variants based on `layout_hint`: `standard` (single column), `split` (text left, diagram right), `centered` (narrow column)
  - Alert boxes: dark = red border ALL CAPS, light = gold border subtle
  - Sources section: rendered at page bottom as numbered references
  - Responsive: `srcSet` 1x/2x, mobile fallback for banners
- **Test Plan:**
  - Manual: visual review of all 14 pages across both tracks
  - Manual: responsive check (mobile, tablet, desktop)
  - CI: `npm run ci` passes
- **Demo Data Impact:**
  - None — visual layer only

---

### T4.4 — Animated transitions between slider positions
- **Goal:** Add smooth animated transitions when the duality slider moves between positions, enhancing the cinematic feel of the home page
- **Specialist:** Frontend (React / Animation)
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [x] Slider position changes animate smoothly (not instant jumps)
  - [x] Transition includes visual effects (e.g., gradient blend, particle burst, or ripple at the boundary)
  - [x] Animation respects `prefers-reduced-motion` (falls back to instant transition)
  - [x] No performance regression — animation runs at 60fps on mid-range devices
  - [x] Tests pass (`npm test`)
  - [x] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Modify `dashboard/app/components/DualitySlider.tsx`
  - Add CSS transitions or requestAnimationFrame-based interpolation for slider position
  - Collision zone effect: gradient blend, glow pulse, or particle effect at the slider boundary during movement
  - Use `will-change: transform` for GPU-accelerated transitions
  - Respect `prefers-reduced-motion: reduce` media query
- **Test Plan:**
  - Manual: visual verification of smooth transitions
  - Manual: test with `prefers-reduced-motion` enabled
  - CI: `npm run ci` passes
- **Demo Data Impact:**
  - None — animation only

---

### T4.5 — Social sharing cards with track-specific images
- **Goal:** Generate and wire track-specific Open Graph images so shared links show the correct visual for each track and inner page
- **Specialist:** Frontend (SEO / Design)
- **Complexity:** M
- **Depends on:** T4.2
- **DoD:**
  - [x] OG images exist: `og-dark.png`, `og-light.png` (track-specific), `og-image.png` (default)
  - [x] Dark track pages use `og-dark.png` as social card
  - [x] Light track pages use `og-light.png` as social card
  - [x] Home page uses `og-image.png` (split dark/light composition)
  - [x] Inner pages include page title in OG metadata
  - [x] Twitter card meta tags present (`twitter:card`, `twitter:image`)
  - [x] Tests verify OG tags on all route types
  - [x] Tests pass (`npm test`)
  - [x] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Generate OG images per `content/shared/image-placement.md` specs (1200x630)
  - Update metadata exports in: `dashboard/app/layout.tsx`, `dashboard/app/[track]/[slug]/page.tsx`
  - Track pages: `openGraph.images` points to track-specific OG image
  - Inner pages: `openGraph.title` from frontmatter, `openGraph.description` from first paragraph
  - Add `twitter:card: summary_large_image` meta tags
  - Existing `og-image.png` may need regeneration to match current design
- **Test Plan:**
  - `test/seo/social-cards.test.ts` — verify OG tags on home, track, and inner pages
  - Expected: ~5 tests
- **Demo Data Impact:**
  - None — metadata only

---

### T4.6 — Subscriber management scripts
- **Goal:** CLI scripts to pull, export, list, and delete subscribers from Firestore for operational management
- **Specialist:** Backend / Tooling
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [x] `bin/subscribers.sh list` — lists subscribers with track, email, signup date
  - [x] `bin/subscribers.sh export` — exports to CSV (email, track, created_at, metadata)
  - [x] `bin/subscribers.sh count` — shows count per track
  - [x] `bin/subscribers.sh delete <email>` — removes a subscriber (with confirmation prompt)
  - [x] Scripts respect `CAPTHCA_LAND_ENV` for collection prefix (stg_/prd_/local_)
  - [x] Tests pass (`npm test`)
  - [x] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New file: `bin/subscribers.sh` — shell wrapper that calls a Node.js script
  - New file: `scripts/subscribers.ts` — Firestore operations using admin SDK
  - Uses `getCollectionPrefix()` from `dashboard/lib/firestore.ts` for env-aware collection names
  - CSV export: `email,track,created_at,ip,user_agent,referer,language`
  - Delete requires `--confirm` flag or interactive "are you sure?" prompt
  - Defaults to `CAPTHCA_LAND_ENV=local` if not set
- **Test Plan:**
  - `test/scripts/subscribers.test.ts` — unit: CSV formatting, collection prefix usage
  - Expected: ~4 tests
- **Demo Data Impact:**
  - Update `bin/gen-demo.sh` to generate sample subscribers for script testing

---

### T4.7 — Subscriber profiling enrichment
- **Goal:** Enrich subscriber records at signup time with timezone, locale, screen size, geo (IP-based), and device type for analytics insights
- **Specialist:** Backend / Analytics
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [x] Subscribe endpoint captures: timezone, locale, screen dimensions, device type
  - [x] Client-side form sends enrichment fields alongside email and track
  - [x] Geo data derived server-side from IP (country, region) using a lightweight lookup
  - [x] New fields stored in Firestore subscriber document
  - [x] No external API calls for geo (use header-based or lightweight DB approach)
  - [x] Tests verify enrichment fields are stored
  - [x] Tests pass (`npm test`)
  - [x] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Modify subscribe form components to collect: `Intl.DateTimeFormat().resolvedOptions().timeZone`, `navigator.language`, `screen.width`/`screen.height`
  - Modify `dashboard/app/api/subscribe/route.ts` to accept and store new fields
  - Device type: derive from user-agent (mobile/tablet/desktop) server-side
  - Geo: use `cf-ipcountry` header (Cloudflare) or `x-appengine-country` (GCP) — no external API
  - Firestore document shape adds: `timezone`, `locale`, `screenSize`, `deviceType`, `country`
  - Keep body size limit in mind (currently 4096) — enrichment adds ~200 bytes
- **Test Plan:**
  - `test/api/subscribe-enrichment.test.ts` — verify new fields accepted and stored
  - Expected: ~5 tests
- **Demo Data Impact:**
  - Update `bin/gen-demo.sh` to include enrichment fields in sample subscribers

---

### T4.8 — Optimize images with next/image
- **Goal:** Convert all track page images to use Next.js `<Image>` component for automatic optimization, lazy loading, and responsive sizing
- **Specialist:** Frontend (Performance)
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [x] All `<img>` tags in track pages replaced with `next/image` `<Image>` component
  - [x] Hero images use `priority` prop (above-fold)
  - [x] Section images use lazy loading (default behavior)
  - [x] Images have explicit `width`/`height` or `fill` with `sizes` prop
  - [x] Alt text present on every image (per image-placement.md descriptions)
  - [x] No layout shift (CLS) from image loading
  - [x] Tests pass (`npm test`)
  - [x] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Audit `dashboard/app/dark/page.tsx` and `dashboard/app/light/page.tsx` for `<img>` tags
  - Replace with `import Image from "next/image"` and `<Image>` component
  - Hero images: `priority={true}`, explicit dimensions
  - Section images: default lazy, with `sizes` prop for responsive breakpoints
  - Follow `content/shared/image-placement.md` for alt text
  - Compress source images if any exceed 200KB (hero) / 100KB (section) per spec
- **Test Plan:**
  - Manual: Lighthouse performance audit before/after
  - Manual: verify no layout shift on page load
  - CI: `npm run ci` passes
- **Demo Data Impact:**
  - None — image optimization only

---

### T4.9 — Tighten CSP — remove 'unsafe-inline' for scripts
- **Goal:** Remove `'unsafe-inline'` from the CSP `script-src` directive to prevent inline script injection attacks
- **Specialist:** Security / Frontend
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [x] CSP `script-src` no longer includes `'unsafe-inline'`
  - [x] All inline scripts converted to external files or use nonce-based CSP
  - [x] Turnstile widget still functions correctly
  - [x] No console CSP violations on any page (home, light, dark)
  - [x] Existing CSP security test updated to verify no `'unsafe-inline'`
  - [x] Tests pass (`npm test`)
  - [x] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Modify CSP in `dashboard/middleware.ts` or `dashboard/next.config.mjs`
  - Option A: nonce-based CSP — generate per-request nonce, pass to `<script nonce={}>` tags
  - Option B: hash-based CSP — compute SHA-256 of each inline script, add to CSP
  - Nonce approach preferred for Next.js (works with App Router `<Script>` component)
  - Turnstile: may need `nonce` passed to widget render call
  - Test all pages for CSP violations in browser console
- **Test Plan:**
  - Update `test/infra/security-hardening.test.ts` — verify `'unsafe-inline'` absent from `script-src`
  - Manual: verify Turnstile works on all pages, no console CSP errors
  - Expected: ~2 updated tests
- **Demo Data Impact:**
  - None — security configuration only

---

### T4.10 — API route coverage check
- **Goal:** Add a test that verifies every API route (`route.ts`) has corresponding test coverage, preventing untested endpoints from shipping
- **Specialist:** Testing / Quality
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [x] Test discovers all `dashboard/app/api/**/route.ts` files dynamically
  - [x] Test verifies each route has at least one corresponding test file in `test/`
  - [x] Test fails if a new API route is added without tests
  - [x] Current routes all have coverage (health, subscribe, analytics)
  - [x] Tests pass (`npm test`)
  - [x] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New file: `test/coverage/api-route-coverage.test.ts`
  - Use `fs.readdirSync` or glob to find all `**/api/**/route.ts` files under `dashboard/app/`
  - For each route, check that a matching test file exists (e.g., `api/health/route.ts` → `test/api/health*.test.ts`)
  - Mapping convention: route path segments map to test file path or test file name
  - Allow explicit exceptions via a `KNOWN_UNTESTED` array (should be empty)
- **Test Plan:**
  - Self-testing: the test itself verifies coverage
  - Expected: ~3 tests (route discovery, coverage check, no exceptions needed)
- **Demo Data Impact:**
  - None — test infrastructure only

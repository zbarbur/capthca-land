# TODO — CAPTHCA land

> Sprint 6: Content consolidation, mobile UX, and housekeeping
> Branch: `sprint6/main`

---

### T6.1 — Mobile experience overhaul
- **Goal:** Deliver a fully responsive mobile experience across the entire site — replace the unusable desktop slider with a mobile-optimized home page, and audit/fix mobile layout issues on landing pages, inner pages, diagrams, and navigation
- **Specialist:** frontend-developer
- **Complexity:** L
- **Depends on:** None
- **DoD:**
  - [ ] Mobile breakpoint (`< 768px`) renders a dedicated mobile layout instead of the drag slider
  - [ ] Both tracks presented with hero visuals, hook text, and CTA buttons on mobile home
  - [ ] `/light` and `/dark` landing pages render correctly on mobile (no horizontal overflow, readable typography, proper spacing)
  - [ ] All inner pages (`[track]/[slug]`) are mobile-readable (content width, font sizes, image scaling)
  - [ ] All 13 whitepaper diagram components are responsive (no overflow, readable at 375px width)
  - [ ] TrackLayout navigation works on mobile (back link, page links, touch targets ≥ 44px)
  - [ ] Atmosphere effects (MatrixRain, GradientOrbs, DNAHelix) don't degrade mobile performance
  - [ ] Lighthouse mobile performance score ≥ 80 on home, landing, and one inner page
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Modify `DualitySlider.tsx` — mobile detection via CSS breakpoint, stacked or swipeable mobile layout
  - Audit all landing page sections for mobile overflow, table responsiveness, image sizing
  - Audit `ContentRenderer` output for mobile readability (max-width, padding, font scaling)
  - Audit `components/diagrams/` — add responsive wrappers or `overflow-x: auto` where needed
  - Review `TrackLayout.tsx` — ensure nav links are accessible on small screens
  - Reduce atmosphere effect intensity on mobile (fewer particles, simpler gradients) if perf issues found
- **Test Plan:**
  - `test/pages/mobile-home.test.ts` — mobile layout component exists, breakpoint logic, both track CTAs render
  - `test/pages/mobile-responsive.test.ts` — diagram components have responsive styles, no fixed-width elements > 375px
- **Demo Data Impact:**
  - None — no new fields or endpoints

---

### T6.2 — Ambient sound per track
- **Goal:** Add optional ambient audio to each track (light and dark) that plays on user interaction, enhancing the immersive experience with a mute/unmute toggle
- **Specialist:** frontend-developer
- **Complexity:** M
- **Depends on:** None
- **DoD:**
  - [ ] Audio toggle button visible on both track landing pages and inner pages
  - [ ] Dark track plays a distinct ambient loop; light track plays a different one
  - [ ] Audio does NOT autoplay — requires user interaction to start (browser policy compliant)
  - [ ] Mute state persists across page navigations (via localStorage or context)
  - [ ] Toggle is accessible (aria-label, keyboard operable)
  - [ ] Audio files are ≤ 500KB each (compressed, loopable)
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New component: `dashboard/app/components/AmbientAudio.tsx` — uses `HTMLAudioElement` with loop, manages play/pause state
  - Audio files: `dashboard/public/tracks/dark/assets/ambient-dark.mp3`, `dashboard/public/tracks/light/assets/ambient-light.mp3`
  - Integrate into `TrackLayout.tsx` so it appears on all track pages
  - Store mute preference in `localStorage` key `capthca-audio-muted`
  - Consider `AudioContext` for crossfade on the home slider (stretch)
- **Test Plan:**
  - `test/components/ambient-audio.test.ts` — component renders toggle, respects muted prop, aria-label present
- **Demo Data Impact:**
  - None — no new fields or endpoints

---

### T6.3 — CTA section on every page
- **Goal:** Add a track-specific email capture CTA section at the bottom of every page (landing + inner) using content from shared markdown, ensuring Turnstile loads correctly without CSP or duplicate-widget issues
- **Specialist:** frontend-developer + devsecops-expert
- **Complexity:** M
- **Depends on:** None
- **DoD:**
  - [ ] CTA section renders at bottom of `/light`, `/dark`, and all `[track]/[slug]` inner pages
  - [ ] Content is loaded from `content/light/cta.md` and `content/dark/cta.md`
  - [ ] Track-specific styling (glassmorphism for light, terminal/HUD for dark)
  - [ ] Turnstile widget renders once per page (no duplicate widget errors)
  - [ ] CSP nonce is correctly applied — no console errors
  - [ ] Email submission works from CTA on inner pages (verified via `bin/api-test.sh`)
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Refactor `EmailCapture.tsx` to accept content props (heading, subheading, success message) instead of hardcoded text
  - New `CTASection.tsx` component that reads from `content/*/cta.md` via content pipeline and wraps `EmailCapture`
  - Add `CTASection` to `TrackLayout.tsx` (inner pages) and landing pages (`/light`, `/dark`)
  - Ensure only one Turnstile `<script>` tag and one widget per page — may need to share widget instance or lazy-load
  - Test Turnstile on inner pages for CSP nonce pass-through
- **Test Plan:**
  - `test/components/cta-section.test.ts` — CTA renders on inner pages, content loaded from markdown, no duplicate Turnstile scripts
  - Manual: verify email submission from an inner page on staging
- **Demo Data Impact:**
  - None — uses existing subscribe endpoint

---

### T6.4 — Remove dead files and audit for orphans
- **Goal:** Clean up files from the pre-Next.js era that are no longer used, reducing repo clutter and eliminating confusion about what's canonical
- **Specialist:** architect-reviewer
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] Root `index.html` removed
  - [ ] `tracks/dark/index.html` and `tracks/light/index.html` removed
  - [ ] `tracks/*/assets/` removed (images already in `dashboard/public/tracks/`)
  - [ ] `tracks/*/STORYBOARD_*.md` removed
  - [ ] `docs/TRACKS.md` removed (superseded by content system)
  - [ ] Audit completed: any other orphaned files identified and removed or documented
  - [ ] No remaining references to deleted files in codebase (`grep` clean)
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Delete: `index.html`, `tracks/*/index.html`, `tracks/*/assets/`, `tracks/*/STORYBOARD_*.md`, `docs/TRACKS.md`
  - Audit root-level files: check `BATTLE_TESTED_PATTERNS.md`, `IMPLEMENTATION_NOTES.md`, `WHITEPAPER_SUMMARY.txt`, `generate_whitepaper.py`, whitepaper PDFs
  - Audit `docs/research/` — check if manifesto/storyboard files are still referenced
  - Grep for any imports/references to deleted paths
- **Test Plan:**
  - `test/cleanup/orphan-files.test.ts` — verify deleted files don't exist, no dangling references
- **Demo Data Impact:**
  - None — no new fields or endpoints

---

### T6.5 — Wire landing pages into content system
- **Goal:** Refactor `/light`, `/dark`, home slider, and EmailCapture to read copy from `content/*.md` files at build time, eliminating the dual-maintenance problem of hardcoded JSX copy
- **Specialist:** frontend-developer + node-architect
- **Complexity:** M
- **Depends on:** T6.3 (CTA refactor happens first, EmailCapture changes needed)
- **DoD:**
  - [ ] `/light` page reads section content from `content/light/01-origins.md` through `04-sovereignty.md`
  - [ ] `/dark` page reads section content from `content/dark/01-vulnerability.md` through `04-declaration.md`
  - [ ] `DualitySlider` reads copy from `content/home/duality-slider.md`
  - [ ] Visual output is identical before and after (screenshot comparison or visual inspection)
  - [ ] No hardcoded prose remains in landing page JSX (only structural markup)
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Extend `dashboard/lib/content.ts` with `getLandingSections(track)` — returns ordered array of rendered sections with frontmatter
  - Landing pages become server components that call `getLandingSections()` at build time
  - `DualitySlider` — extract text values from parsed frontmatter of `content/home/duality-slider.md` and pass as props
  - Preserve all existing design (animations, layout, track-specific components) — only the text source changes
  - Handle content markers (`{highlight}`, `{table}`, `{alert}`) in landing page context
- **Test Plan:**
  - `test/lib/content-landing.test.ts` — `getLandingSections` returns correct count and frontmatter for both tracks
  - `test/pages/landing-content.test.ts` — landing pages import from content system, no hardcoded prose strings
- **Demo Data Impact:**
  - None — no new fields or endpoints

---

### T6.6 — Next.js upgrade to fix audit vulnerabilities
- **Goal:** Upgrade Next.js to the latest 14.x patch (or 15.x if compatible) to resolve 9 npm audit vulnerabilities (8 low, 1 high) identified in CI
- **Specialist:** devops-engineer + node-architect
- **Complexity:** M
- **Depends on:** T6.5 (content wiring should be stable before framework upgrade)
- **DoD:**
  - [ ] Next.js upgraded to latest secure version
  - [ ] `npm audit --audit-level=high` returns 0 high/critical vulnerabilities
  - [ ] All 113+ existing tests pass
  - [ ] `npm run ci` passes (lint + typecheck + test + audit)
  - [ ] Middleware (Edge Runtime) still works — CSP nonce, auth, HSTS
  - [ ] Build succeeds: `cd dashboard && npm run build`
  - [ ] Staging deploy succeeds via `bin/deploy-staging.sh`
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Run `cd dashboard && npm update next` (or `npm install next@latest` if major version bump needed)
  - Check breaking changes in Next.js changelog for current → target version
  - Verify `output: "standalone"` still works for Docker builds
  - Verify Edge Runtime middleware compatibility (no Node.js APIs in middleware.ts)
  - Update `@types/react`, `@types/react-dom` if needed
  - Run full build + test cycle
- **Test Plan:**
  - Existing test suite (113 tests) covers middleware, CSP, API routes, content pipeline
  - Manual: verify staging deploy, check middleware headers, test Turnstile
- **Demo Data Impact:**
  - None — framework upgrade only

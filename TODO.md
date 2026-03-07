# Sprint 5: Inner page atmosphere — track personality on every page

> Theme: Bring track-specific visual language to all content pages with per-page variations, integrate images via frontmatter, and deploy to staging.

---

### T5.1 — Dark inner page atmosphere with per-page variations
- **Goal:** Apply dark track visual language to all 7 inner pages, with unique atmospheric variations per page so each feels distinct while cohesive
- **Specialist:** Frontend (CSS / Animation)
- **Complexity:** L
- **Depends on:** None
- **DoD:**
  - [ ] All 7 dark inner pages have MatrixRain background (shared, reduced opacity vs landing)
  - [ ] CRT scanline overlay present on all dark pages
  - [ ] Per-page variations: about (dense/minimal whitespace), faq (terminal prompt style), how-it-works (HUD split layout), philosophy (proof-by-contradiction layout), human-vs-machine (clinical/stats), use-cases (threat→solution cards), whitepaper (classified doc style)
  - [ ] Section prefix numbering rendered (`XX // TITLE` format) using `section_prefix` frontmatter
  - [ ] Alternating section backgrounds (`#0a0e27` / `#111`) on applicable pages
  - [ ] `{alert}` boxes render with red border, ALL CAPS, monospaced
  - [ ] `{quote}` blocks render with acid-green mono styling
  - [ ] Animations respect `prefers-reduced-motion`
  - [ ] Tests pass (`npm run ci`)
- **Technical Specs:**
  - Extend `[track]/[slug]/page.tsx` to conditionally render MatrixRain + CRT overlay for dark track
  - Create per-page CSS classes keyed on slug (e.g., `.dark-page-faq`, `.dark-page-philosophy`)
  - Read `section_prefix` from frontmatter, render headings as `{prefix} // {TITLE}`
  - Alternating sections: use CSS `nth-of-type` or add class to ContentRenderer sections
  - FAQ: style `h2` elements as terminal prompts (`> QUESTION`)
  - Philosophy: wider spacing, proof-style logical flow
  - Use-cases: card-based grid with acid-green left borders
  - All variations defined in `globals.css` under `.theme-dark .content-body.page-{slug}`
- **Test Plan:**
  - `test/pages/dark-atmosphere.test.ts` — verify slug-specific classes applied, section_prefix rendered
  - Expected: ~5 tests

---

### T5.2 — Light inner page atmosphere with per-page variations
- **Goal:** Apply light track visual language to all 7 inner pages, with unique atmospheric variations per page
- **Specialist:** Frontend (CSS / Animation)
- **Complexity:** L
- **Depends on:** None
- **DoD:**
  - [ ] All 7 light inner pages have GradientOrbs background (shared, subtle)
  - [ ] Per-page variations: about (lattice-detail.png behind heading, trust-establishing), faq (accordion cards with gold borders), how-it-works (split layout with gold flow arrows), philosophy (essay layout, New Yorker feel), human-vs-machine (comparison table centerpiece), use-cases (glassmorphism cards), whitepaper (academic/institutional)
  - [ ] Glassmorphism cards on applicable pages (use-cases, faq, how-it-works)
  - [ ] `{highlight}` boxes render with gold left border and warm background
  - [ ] `{quote}` blocks render with gold italic, centered, decorative
  - [ ] Typography: serif headlines where specified, generous whitespace on philosophy
  - [ ] Animations respect `prefers-reduced-motion`
  - [ ] Tests pass (`npm run ci`)
- **Technical Specs:**
  - Extend `[track]/[slug]/page.tsx` to conditionally render GradientOrbs for light track
  - Create per-page CSS classes keyed on slug (e.g., `.light-page-faq`, `.light-page-philosophy`)
  - FAQ: collapsible accordion pattern with gold left border, 12px border-radius
  - How-it-works: CSS grid for split layout (text left, diagram right)
  - Philosophy: max-width narrower (~650px), generous line-height, pull-quote styling
  - Use-cases: card grid with glassmorphism (`backdrop-filter: blur`)
  - About: lattice-detail.png as faded background behind header area
  - All variations defined in `globals.css` under `.theme-light .content-body.page-{slug}`
- **Test Plan:**
  - `test/pages/light-atmosphere.test.ts` — verify slug-specific classes applied
  - Expected: ~5 tests

---

### T5.3 — Content image integration via frontmatter
- **Goal:** Auto-place existing images at positions specified in `design_notes` frontmatter, so cowork can manage image placement by editing markdown
- **Specialist:** Frontend (React / Content System)
- **Complexity:** M
- **Depends on:** T5.1, T5.2
- **DoD:**
  - [ ] New frontmatter field `images` supported as structured array: `{src, after, style}`
  - [ ] Images auto-injected into rendered HTML at positions matching `after` heading text
  - [ ] Dark track images wrapped with HUD corner brackets
  - [ ] Light track images wrapped with glassmorphism border (16px radius)
  - [ ] Images use `next/image` with lazy loading and responsive `sizes`
  - [ ] All existing HUD/flow images placed on their respective pages
  - [ ] Tests verify image injection from frontmatter
  - [ ] Tests pass (`npm run ci`)
- **Technical Specs:**
  - Extend `PageFrontmatter` interface to include `images?: {src: string; after: string; style: string}[]`
  - Post-process HTML in `renderMarkdown` or `ContentRenderer` to inject `<Image>` after matching `<h2>`/`<h3>`
  - Image styles: `hud-frame` (corner brackets + scan-line), `glassmorphism` (rounded + blur border), `full-width` (no frame)
  - Images served from `/tracks/{track}/assets/` or `/tracks/{track}/`
  - Update content files with `images` frontmatter for: how-it-works (4 images), about (lattice-detail), whitepaper (mockup)
- **Test Plan:**
  - `test/lib/content-images.test.ts` — verify image injection, frontmatter parsing
  - Expected: ~4 tests

---

### T5.4 — Content guide for cowork
- **Goal:** Write a concise reference guide so Claude Code (cowork) can independently manage content pages
- **Specialist:** Documentation
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] `content/CONTENT_GUIDE.md` exists with frontmatter spec, marker syntax, rules
  - [ ] Covers: file structure, frontmatter fields, content markers, image placement, track differences
  - [ ] Includes example of a complete page file
  - [ ] Tests pass (`npm run ci`)
- **Technical Specs:**
  - New file: `content/CONTENT_GUIDE.md`
  - Document all frontmatter fields (track, slug, title, badge, layout_hint, design_notes, sources, section_prefix, images)
  - Document marker syntax with examples ({highlight}, {table}, {alert}, {quote})
  - Document image placement frontmatter (after T5.3)
  - Include rules: verbatim copy, markers on own lines, GFM table syntax
  - Reference `content/CONTENT_SYSTEM.md` for full system spec
- **Test Plan:**
  - No automated tests — documentation only

---

### T5.5 — Academic paper scaffold in content system
- **Goal:** Add route and placeholder for an academic paper content type, ready for cowork to populate
- **Specialist:** Frontend (Routing)
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] Route exists: `/light/academic-paper` and `/dark/academic-paper`
  - [ ] Placeholder content files exist: `content/light/pages/academic-paper.md` and `content/dark/pages/academic-paper.md`
  - [ ] Pages render with appropriate track styling
  - [ ] Nav bar includes "Paper" link
  - [ ] Tests updated to expect 8 slugs per track (was 7)
  - [ ] Tests pass (`npm run ci`)
- **Technical Specs:**
  - Create `content/light/pages/academic-paper.md` and `content/dark/pages/academic-paper.md` with frontmatter + placeholder body
  - Add `{ slug: "academic-paper", label: "Paper" }` to PAGES array in TrackLayout
  - Update test assertions from 7 to 8 slugs per track
  - `generateStaticParams` auto-discovers new pages (no code change needed)
- **Test Plan:**
  - Existing `test/pages/inner-pages.test.ts` updated for 8 slugs
  - Expected: update 2 assertions

---

### T5.6 — npm audit in CI pipeline
- **Goal:** Add non-blocking dependency vulnerability check to CI
- **Specialist:** Infrastructure / Testing
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] `npm audit` runs as part of CI pipeline
  - [ ] Audit failures are reported but do not block CI (non-blocking / warning only)
  - [ ] Output includes severity summary (critical, high, moderate, low)
  - [ ] Tests pass (`npm run ci`)
- **Technical Specs:**
  - Add `audit` script to root `package.json`: `npm audit --audit-level=none || true`
  - Or add to `ci` script chain: `npm run lint && npm run typecheck && npm run test && npm audit --audit-level=critical || echo 'Audit warnings present'`
  - Dashboard audit: `cd dashboard && npm audit --audit-level=none || true`
  - Report output but don't fail the pipeline
- **Test Plan:**
  - Manual: verify `npm run ci` completes even with audit warnings
  - No automated test needed

---

### T5.7 — Deploy Sprint 4+5 to staging
- **Goal:** Deploy current state to staging.capthca.ai and verify
- **Specialist:** Infrastructure / DevOps
- **Complexity:** S
- **Depends on:** T5.1, T5.2, T5.3
- **DoD:**
  - [ ] `bin/deploy-staging.sh` runs successfully
  - [ ] staging.capthca.ai loads home page, both track pages, and at least 2 inner pages
  - [ ] Content renders with track atmosphere (MatrixRain on dark, GradientOrbs on light)
  - [ ] Social cards verifiable via OG debugger
  - [ ] No console errors on any page
  - [ ] Tests pass locally before deploy (`npm run ci`)
- **Technical Specs:**
  - Run `bin/deploy-staging.sh`
  - Smoke test: home, /dark, /light, /dark/about, /light/about, /dark/faq, /light/how-it-works
  - Verify Turnstile still works on both tracks
  - Check staging basic auth still active
- **Test Plan:**
  - Manual: browser verification of all page types
  - Manual: OG debugger check

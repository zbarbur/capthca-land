# Sprint 5 Handover — Inner Page Atmosphere

**Theme:** Bring track-specific visual language to all content pages with per-page variations, integrate images via frontmatter, and deploy to staging.

**Branch:** `sprint5/main`
**Duration:** Sprint 5 (closed 2026-03-08)
**Tests:** 113 (24 suites), 0 failures

---

## Completed Tasks

| Task | Status | Key Files |
|------|--------|-----------|
| T5.1 Dark inner page atmosphere | Done | `globals.css`, `[track]/[slug]/page.tsx` |
| T5.2 Light inner page atmosphere | Done | `globals.css`, `GradientOrbs.tsx`, `DNAHelix.tsx` |
| T5.3 Content image integration | Done | `lib/content.ts`, `ContentRenderer.tsx` |
| T5.4 Content guide for cowork | Done | `content/CONTENT_GUIDE.md` |
| T5.5 Academic paper scaffold | Done | `content/*/pages/academic-paper.md`, `TrackLayout.tsx` |
| T5.6 npm audit in CI | Done | `package.json` (ci script) |
| T5.7 Deploy to staging | Done | `.gcloudignore`, `Dockerfile` |
| (Extra) Whitepaper diagrams | Done | `components/diagrams/` (13 components), `DiagramRenderer.tsx` |
| (Extra) Visual polish | Done | `GradientOrbs.tsx`, `DNAHelix.tsx` |

## Deferred Items

None — all planned tasks completed. Whitepaper diagram polish deferred to Sprint 6.

---

## Key Decisions

1. **Whitepaper diagrams added mid-sprint**: Cowork updated whitepaper content with 13 `{diagram:xxx}` markers. Decision was to implement all 13 interactive diagram components immediately rather than defer. This added significant unplanned scope.
2. **GradientOrbs `withBackground` prop**: Fixed light atmosphere invisibility by having GradientOrbs own its white background on inner pages (avoids body bg covering fixed-position orbs).
3. **Per-page orb variation via slug hash**: Instead of frontmatter-driven orb positions, used a simple string hash of the slug to select from 7 predefined position configs.
4. **DiagramRenderer architecture**: HTML split at `{diagram:xxx}` markers with `next/dynamic` lazy loading for each component, rather than DOM portal approach.
5. **Recharts for charts**: Added as a dependency for 4 chart components (donut, bar, area, stacked bar).

---

## Architecture Changes

- **Diagram system**: New `{diagram:xxx}` content marker → `<div data-diagram="xxx"></div>` in HTML → `DiagramRenderer` splits HTML and renders React components inline via `next/dynamic`.
- **13 diagram components** in `components/diagrams/`: 4 Recharts charts + 9 custom CSS/SVG components, all with light/dark dual-track theming.
- **Theme constants**: `components/diagrams/theme.ts` centralizes light/dark color palettes for all diagrams.
- **`useCountUp` hook**: Scroll-triggered count-up animation for stats dashboard.
- **Content pipeline extended**: `transformContentMarkers()` now handles `{diagram:xxx}` markers before other content markers.
- **Docker build**: `content/` directory now copied into builder stage for `generateStaticParams`.
- **Cloud Build**: `.gcloudignore` updated to include `content/**/*.md` files (tests need them).

---

## Known Issues

1. **Whitepaper diagram components need visual polish** — Components render correctly but styling could be refined (spacing, mobile responsiveness, animation polish).
2. **Cloud Build/Docker gaps** — `.gcloudignore` and Dockerfile weren't updated when content system was introduced in Sprint 4. This caused multiple build failures before being caught.
3. **UI required multiple iteration passes** — Atmosphere visibility (GradientOrbs behind body bg), DNA helix overlap, content width, orb colors — all needed live debugging.
4. **Some regressions during development** — Double opacity on MatrixRain, 404 from stale `.next` cache, light atmosphere invisible.
5. **No local Cloud Build testing** — Build failures only discovered after submitting to Cloud Build. Need a way to test the build environment locally.

---

## Lessons Learned

1. **`.gcloudignore` and `.dockerignore` must be reviewed when adding new directories** — The `*.md` glob in `.gcloudignore` silently excluded content files. The Dockerfile didn't copy `content/` for `generateStaticParams`. Both were only caught at deploy time.
2. **CSS stacking context is non-obvious** — `fixed z-0` elements are painted above the canvas background but below the body's `background-color`. The `withBackground` prop pattern was the cleanest fix.
3. **Adding unplanned scope mid-sprint causes churn** — The 13 whitepaper diagrams were a significant addition. Would have been cleaner as a Sprint 6 task with proper planning.
4. **Live visual debugging is iterative** — Atmosphere effects (opacity, z-index, positioning) required multiple rounds of user feedback. Plan for this in UI-heavy sprints.
5. **Stale `.next` cache causes phantom errors** — `rm -rf dashboard/.next` should be the first debugging step for rendering issues.
6. **Need local Cloud Build testing** — A `bin/test-cloud-build.sh` script that simulates the Cloud Build steps locally would prevent deploy-time surprises.

---

## Test Coverage

| Metric | Value |
|--------|-------|
| Total Tests | 113 |
| Suites | 24 |
| Pass | 113 |
| Fail | 0 |
| Duration | ~1.5s |

New test files:
- `test/pages/dark-atmosphere.test.ts` (5 tests)
- `test/pages/light-atmosphere.test.ts` (5 tests)
- `test/lib/content-images.test.ts` (4 tests)
- `test/lib/content-renderer.test.ts` (5 tests)

---

## Recommendations for Next Sprint

1. **Whitepaper diagram polish** — Refine spacing, mobile layouts, animations, and track-specific styling.
2. **Local Cloud Build testing** — Create `bin/test-cloud-build.sh` to simulate build steps locally.
3. **Content system regression tests** — Add tests that verify the full render pipeline (markdown → HTML → diagrams) works end-to-end.
4. **Next.js upgrade** — Current version has 9 npm audit vulnerabilities (8 low, 1 high). Consider upgrading.
5. **Production deploy** — Sprint 5 changes need production deployment.

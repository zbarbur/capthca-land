# Sprint 6 Handover — Content consolidation, mobile UX, and housekeeping

**Dates:** 2026-03-08
**Branch:** `sprint6/main`
**Deployed:** staging.capthca.ai + capthca.ai (production)

---

## Completed Tasks

| Task | Status | Key Files |
|------|--------|-----------|
| T6.1 — Mobile experience overhaul (L) | Done | `DualitySlider.tsx`, `TrackLayout.tsx`, `globals.css` |
| T6.2 — Ambient sound per track (M) | Done | `AmbientAudio.tsx`, `TrackLayout.tsx` |
| T6.3 — CTA section on every page (M) | Done | `CTASection.tsx`, `EmailCapture.tsx`, `content.ts` |
| T6.4 — Remove dead files (S) | Done | Deleted `index.html`, `tracks/*/index.html`, `docs/TRACKS.md` |
| T6.5 — Wire landing pages into content system (M) | Done | `light/page.tsx`, `dark/page.tsx`, `page.tsx`, `content.ts` |
| T6.6 — Next.js upgrade (M) | Done | `package.json` (14.2.29 → 14.2.35) |

**Unplanned work:**
- Vertical mobile slider (replaced stacked layout after user testing)
- LightMotes hydration mismatch fix
- Mobile nav scrollbar fix

---

## Deferred Items

None — all planned tasks completed.

---

## Key Decisions

- **Vertical slider on mobile** — after testing the stacked layout, switched to a vertical drag slider that mirrors the desktop horizontal slider. Hero words face each other across the divider with CTAs pushing outward.
- **Conservative Next.js upgrade** — stayed on 14.x (14.2.35) rather than jumping to 15. All 9 audit vulns require 15.5.10+ and the project is not exposed to them. Next.js 15 migration added to backlog as an L task.
- **Audio placeholder** — AmbientAudio component is fully wired but uses placeholder MP3 paths. Real audio files to be sourced separately.

---

## Architecture Changes

### Mobile Vertical Slider
`DualitySlider.tsx` now has axis-aware drag logic — uses `clientY`/`height` on mobile, `clientX`/`width` on desktop. The mobile layout uses height-based clipping (light half clips from top) with content positioned in respective halves (light in upper, dark in lower). `LightMotes` accepts `isMobile` prop instead of reading `window` during render to prevent hydration mismatches.

### Content System Wiring
Landing pages (`/light`, `/dark`) are now server components that call `getLandingSections(track)` — reads numbered section files (01-*.md through 04-*.md) from content/. Home page calls `getSliderContent()` which parses `content/home/duality-slider.md`. No hardcoded prose remains in landing page JSX.

### CTA Section
New `CTASection` async server component reads `content/*/cta.md` via `getCTAContent()`. `EmailCapture` refactored to accept optional content props with backward-compatible defaults. CTA renders on landing pages and all inner pages.

### Ambient Audio
New `AmbientAudio` client component in `TrackLayout` — HTML5 audio with loop, localStorage mute persistence (`capthca-audio-muted`), track-specific styling. Requires user interaction to play (browser policy compliant).

### Navigation
`TrackLayout` now includes a hamburger menu for mobile (`md:hidden` toggle, dropdown with 44px touch targets). Desktop nav unchanged.

---

## Known Issues

- Ambient audio uses placeholder MP3 paths — needs real audio files (≤ 500KB each, loopable)
- Next.js 14.x audit vulns (9 total, 8 low, 1 high) — all require 15.5.10+, project not exposed

---

## Lessons Learned

1. **Stale `.next` cache causes 404s and hydration errors** — when switching branches or making major component changes, always clean `.next` before testing (`rm -rf dashboard/.next`). The dev server hot-reload doesn't always pick up structural changes.
2. **SSR hydration mismatches from `window` access during render** — any component that reads `window` directly during render (not in `useEffect`) will produce different DOM on server vs. client. Always use state initialized to a safe default, set via `useEffect` after mount.
3. **Automated browser testing needed** — manual mobile testing via DevTools is slow and error-prone. Should explore Playwright or Cypress for automated visual/interaction testing on mobile viewports. Added to future consideration.
4. **Worktree-based parallel execution works well** — independent tasks (T6.1-T6.4) ran in parallel worktrees successfully, but cherry-pick merge ordering matters when tasks touch the same files.

---

## Test Coverage

- **197 tests** across **34 suites** — all passing
- New test files: `mobile-home.test.ts` (14 tests), `mobile-responsive.test.ts` (19 tests), `ambient-audio.test.ts` (13 tests), `cta-section.test.ts` (10 tests), `content-landing.test.ts` (12 tests), `landing-content.test.ts` (10 tests)

---

## Recommendations for Next Sprint

- Source ambient audio files (light: warm/organic, dark: industrial/synthetic)
- Explore Playwright for automated mobile viewport testing
- Consider Lighthouse CI integration for performance regression detection
- Next.js 15 migration when ready (L task, needs thorough evaluation)

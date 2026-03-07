# Sprint 4 Handover

## Sprint Theme

**Content depth, subscriber tooling, and hardening** — Build out the full inner-page experience from the content system, add subscriber operations tooling, and tighten security posture.

## Completed Tasks

| Task | Title | Status | Key Files |
|------|-------|--------|-----------|
| T4.1 | Content system (markdown pipeline) | Done | `dashboard/lib/content.ts`, `dashboard/components/ContentRenderer.tsx`, `test/lib/content.test.ts` |
| T4.2 | Inner page routes (14 pages) | Done | `dashboard/app/[track]/[slug]/page.tsx`, `dashboard/components/InnerPageNav.tsx` |
| T4.3 | Track-specific styling + images | Done (partial) | `dashboard/app/globals.css` (content marker styles), images in `public/tracks/` |
| T4.4 | Slider collision glow animation | Done | `dashboard/app/components/DualitySlider.tsx` |
| T4.5 | Social sharing cards | Done | Metadata in `dark/page.tsx`, `light/page.tsx`, `[track]/[slug]/page.tsx` |
| T4.6 | Subscriber management scripts | Done | `scripts/subscribers.ts`, `bin/subscribers.sh` |
| T4.7 | Subscriber profiling enrichment | Done | `dashboard/app/api/subscribe/route.ts`, `dashboard/app/components/EmailCapture.tsx` |
| T4.8 | Image optimization | Done | `sizes` prop on all `fill` images in track pages |
| T4.9 | Nonce-based CSP | Done | `dashboard/middleware.ts`, `dashboard/app/layout.tsx` |
| T4.10 | API route coverage check | Done | `test/coverage/api-route-coverage.test.ts` |

## Additional Fixes (during sprint)

- Content pipeline: added `remark-gfm` for GFM table support, moved marker post-processing after markdown rendering
- Nav bar: integrated page links into TrackLayout (shared nav for landing + inner pages), reordered with About first, added dot separators
- Turbopack: removed `--turbo` from dev script due to path-with-spaces incompatibility

## Deferred Items

- **T4.3 atmosphere**: Inner pages lack track-specific backgrounds/animations (MatrixRain, GradientOrbs, HUD frames). Content renders but without the visual atmosphere of the landing pages. Added to backlog as 3 high-priority items.

## Key Decisions

- **Static generation** over runtime for inner pages (`generateStaticParams`)
- **remark/rehype pipeline** for markdown rendering (unified ecosystem)
- **Post-process markers** — content markers (`{highlight}`, `{table}`, etc.) are processed after HTML rendering so they don't interfere with markdown parsing
- **Nonce-based CSP** over hash-based — generated per-request in Edge Runtime middleware via `crypto.randomUUID()`
- **Header-based geo** — country from `cf-ipcountry`/`x-appengine-country` headers, no external API calls

## Architecture Changes

- **Content pipeline**: `content/{track}/pages/*.md` → `gray-matter` → `unified` (remark-parse + remark-gfm + remark-rehype + rehype-raw + rehype-sanitize + rehype-stringify) → post-process markers → HTML
- **Dynamic routing**: `[track]/[slug]` coexists with static `/dark` and `/light` routes (Next.js static takes priority)
- **CSP moved to middleware**: All security headers now in `dashboard/middleware.ts` (was in `next.config.mjs`), nonce passed via `x-nonce` header to layout
- **Nav unified**: TrackLayout now handles all navigation (back link + page links), InnerPageNav component still exists but unused
- **rehype-sanitize schema extended**: Custom allowlist for content marker classes + GFM table elements

## Known Issues

- Inner pages lack track atmosphere (no backgrounds, animations) — in backlog
- Turbopack incompatible with paths containing spaces (dev machine path)
- `scripts/` not in root `tsconfig.json` include — LSP shows false diagnostics for subscriber scripts

## Lessons Learned

- Turbopack and stale `.next` builds cause issues during testing — always clean `.next` cache before debugging rendering problems
- Content markers wrapping markdown in HTML divs pre-parse breaks table/bold rendering — must post-process markers after the markdown pipeline
- `remark-parse` alone doesn't support GFM tables — need `remark-gfm` explicitly

## Test Coverage

| Metric | Value |
|--------|-------|
| Total Tests | 94 |
| Suites | 20 |
| Failures | 0 |
| New tests this sprint | 31 |

## Recommendations for Next Sprint

1. **Inner page atmosphere** is the top priority — the content renders but feels flat without track-specific backgrounds and animations
2. **Staging deploy** — hasn't been updated since Sprint 3, should deploy after atmosphere work
3. **Consider removing Turbopack** from package.json dev script permanently (or add a `.next` clean step)
4. **Clean up InnerPageNav** — component is now unused since TrackLayout handles navigation

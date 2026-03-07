# Content System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static-generation content pipeline that reads markdown from `content/` and renders 14 track-specific inner pages.

**Architecture:** remark/rehype pipeline with custom content marker plugin, gray-matter for frontmatter, rehype-sanitize for defense-in-depth. Pages statically generated via `generateStaticParams`. Track-specific CSS scoped by `.theme-dark` / `.theme-light`.

**Tech Stack:** gray-matter, unified, remark-parse, remark-rehype, rehype-stringify, rehype-raw, rehype-sanitize, Next.js 14 App Router

**Design doc:** `docs/plans/2026-03-07-content-system-design.md`

**Security note:** All rendered HTML is sanitized via rehype-sanitize with an allowlist schema before output. Content is source-controlled and authored internally; sanitization provides defense-in-depth against accidental XSS.

---

## Task 1: Install dependencies

**Files:**
- Modify: `dashboard/package.json`

**Step 1: Install markdown pipeline packages**

Run:
```bash
cd dashboard && npm install gray-matter unified remark-parse remark-rehype rehype-stringify rehype-raw rehype-sanitize
```

**Step 2: Verify install**

Run: `cd dashboard && node -e "require('gray-matter'); require('unified'); console.log('OK')"`
Expected: `OK`

**Step 3: Commit**

```bash
git add dashboard/package.json dashboard/package-lock.json
git commit -m "chore: add markdown pipeline dependencies (gray-matter, unified, remark, rehype)"
```

---

## Task 2: Content loader — frontmatter parsing + slug discovery

**Files:**
- Create: `dashboard/lib/content.ts`
- Test: `test/lib/content.test.ts`

**Step 1: Write the failing tests**

```typescript
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPageSlugs, getPageContent } from "../../dashboard/lib/content.ts";

describe("content loader", () => {
	it("getPageSlugs returns all 7 slugs for light track", async () => {
		const slugs = await getPageSlugs("light");
		assert.equal(slugs.length, 7);
		assert.ok(slugs.includes("how-it-works"));
		assert.ok(slugs.includes("faq"));
		assert.ok(slugs.includes("philosophy"));
		assert.ok(slugs.includes("about"));
		assert.ok(slugs.includes("whitepaper"));
		assert.ok(slugs.includes("use-cases"));
		assert.ok(slugs.includes("human-vs-machine"));
	});

	it("getPageSlugs returns all 7 slugs for dark track", async () => {
		const slugs = await getPageSlugs("dark");
		assert.equal(slugs.length, 7);
		assert.ok(slugs.includes("faq"));
	});

	it("getPageContent returns frontmatter and html for a valid page", async () => {
		const page = await getPageContent("light", "about");
		assert.equal(page.frontmatter.track, "light");
		assert.equal(page.frontmatter.slug, "about");
		assert.equal(page.frontmatter.title, "Our Mission");
		assert.equal(page.frontmatter.layout_hint, "standard");
		assert.ok(page.html.length > 0);
	});

	it("getPageContent throws for nonexistent slug", async () => {
		await assert.rejects(
			() => getPageContent("light", "nonexistent"),
			{ message: /not found/i },
		);
	});

	it("frontmatter includes sources array when present", async () => {
		const page = await getPageContent("dark", "faq");
		assert.ok(Array.isArray(page.frontmatter.sources));
		assert.ok(page.frontmatter.sources.length > 0);
	});
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern "content loader"`
Expected: FAIL — module not found

**Step 3: Implement content loader**

Create `dashboard/lib/content.ts` with:
- `gray-matter` for YAML frontmatter extraction
- `unified` + `remark-parse` + `remark-rehype` + `rehype-raw` + `rehype-sanitize` + `rehype-stringify` pipeline
- Pre-processing step that converts `{highlight}`, `{alert}`, `{quote}`, `{table}` markers to HTML divs/blockquotes with class names before markdown parsing
- Custom `rehype-sanitize` allowlist schema permitting standard markdown elements plus content marker classes (`content-highlight`, `content-alert`, `content-quote`, `content-table`)
- Three exported functions: `getPageSlugs(track)`, `getPageContent(track, slug)`, `getTrackMeta(track)` (see design doc for types)
- Content root resolved from `process.cwd()/../content`

**Step 4: Run tests to verify they pass**

Run: `npm test -- --test-name-pattern "content loader"`
Expected: 5 PASS

**Step 5: Commit**

```bash
git add dashboard/lib/content.ts test/lib/content.test.ts
git commit -m "feat: content loader with frontmatter parsing and markdown rendering (T4.1)"
```

---

## Task 3: Content marker rendering tests

**Files:**
- Modify: `test/lib/content.test.ts`

**Step 1: Add content marker tests**

Append to the existing describe block:

```typescript
	it("renders {highlight} markers as content-highlight divs", async () => {
		const page = await getPageContent("light", "about");
		assert.ok(page.html.includes('class="content-highlight"'));
	});

	it("renders {alert} markers as content-alert divs", async () => {
		const page = await getPageContent("dark", "faq");
		assert.ok(page.html.includes('class="content-alert"'));
	});

	it("renders standard markdown elements (headings, paragraphs, links)", async () => {
		const page = await getPageContent("light", "how-it-works");
		assert.ok(page.html.includes("<h2"));
		assert.ok(page.html.includes("<p"));
	});
```

**Step 2: Run tests**

Run: `npm test -- --test-name-pattern "content loader"`
Expected: 8 PASS

**Step 3: Commit**

```bash
git add test/lib/content.test.ts
git commit -m "test: add content marker rendering tests (T4.1)"
```

---

## Task 4: ContentRenderer component

**Files:**
- Create: `dashboard/components/ContentRenderer.tsx`

**Step 1: Create the component**

Build a server component that:
- Accepts `html` (sanitized string from content loader) and `frontmatter` (PageFrontmatter type)
- Selects layout width from `layout_hint`: standard=850px, split=1100px, centered=650px
- Renders page header with optional `badge` and `title` from frontmatter
- Renders sanitized HTML body in a `.content-body` div (HTML is pre-sanitized by rehype-sanitize at build time)
- Renders `sources` as numbered reference list in a footer section

**Step 2: Verify lint**

Run: `npm run lint`
Expected: No errors (warnings OK)

**Step 3: Commit**

```bash
git add dashboard/components/ContentRenderer.tsx
git commit -m "feat: ContentRenderer component with layout variants and sources (T4.1)"
```

---

## Task 5: Inner page dynamic route + static params

**Files:**
- Create: `dashboard/app/[track]/[slug]/page.tsx`

**Step 1: Create the page route**

Build a server component page that:
- Exports `generateStaticParams` returning 14 combinations (7 slugs x 2 tracks) via `getPageSlugs`
- Exports `generateMetadata` using frontmatter title
- Validates track is "light" or "dark", calls `notFound()` otherwise
- Loads content via `getPageContent(track, slug)`, calls `notFound()` on error
- Wraps `ContentRenderer` in `TrackLayout` (theme from track param)

**Important:** Do NOT create `dashboard/app/[track]/layout.tsx`. The existing `dashboard/app/dark/page.tsx` and `dashboard/app/light/page.tsx` are static landing pages. If `[track]/layout.tsx` exists, it would wrap the landing pages with a duplicate TrackLayout. Instead, wrap TrackLayout inside the `[slug]/page.tsx` component directly.

**Step 2: Verify lint**

Run: `npm run lint`
Expected: No errors

**Step 3: Build check**

Run: `cd dashboard && USE_MEMORY_STORE=true npm run build`
Expected: Build succeeds, 14 inner pages statically generated

**Step 4: Commit**

```bash
git add dashboard/app/\[track\]/\[slug\]/page.tsx
git commit -m "feat: dynamic inner page routes with static generation (T4.2)"
```

---

## Task 6: Inner page navigation component

**Files:**
- Create: `dashboard/components/InnerPageNav.tsx`
- Modify: `dashboard/app/[track]/[slug]/page.tsx`

**Step 1: Create navigation component**

Build a client component that:
- Accepts `track` prop ("light" | "dark")
- Lists all 7 inner page links for the given track
- Highlights the active page based on `usePathname()`
- Includes a back link to the track landing page (`/{track}`)
- Uses track-appropriate styling (mono font, accent colors)

**Step 2: Wire into inner page route**

Add `<InnerPageNav track={params.track} />` above ContentRenderer in the page component.

**Step 3: Verify lint**

Run: `npm run lint`
Expected: No errors

**Step 4: Commit**

```bash
git add dashboard/components/InnerPageNav.tsx dashboard/app/\[track\]/\[slug\]/page.tsx
git commit -m "feat: inner page navigation component (T4.2)"
```

---

## Task 7: Inner page route tests

**Files:**
- Create: `test/pages/inner-pages.test.ts`

**Step 1: Write tests**

```typescript
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { getPageContent, getPageSlugs } from "../../dashboard/lib/content.ts";

const EXPECTED_SLUGS = [
	"how-it-works", "about", "faq", "philosophy",
	"whitepaper", "use-cases", "human-vs-machine",
];

describe("inner pages", () => {
	it("route file exists for dynamic inner pages", () => {
		const routePath = path.resolve("dashboard/app/[track]/[slug]/page.tsx");
		assert.ok(fs.existsSync(routePath), "Dynamic route file should exist");
	});

	it("all 7 content files exist for light track", async () => {
		const slugs = await getPageSlugs("light");
		for (const expected of EXPECTED_SLUGS) {
			assert.ok(slugs.includes(expected), `Missing light/${expected}`);
		}
	});

	it("all 7 content files exist for dark track", async () => {
		const slugs = await getPageSlugs("dark");
		for (const expected of EXPECTED_SLUGS) {
			assert.ok(slugs.includes(expected), `Missing dark/${expected}`);
		}
	});

	it("every content file has required frontmatter fields", async () => {
		for (const track of ["light", "dark"] as const) {
			const slugs = await getPageSlugs(track);
			for (const slug of slugs) {
				const page = await getPageContent(track, slug);
				assert.ok(page.frontmatter.title, `${track}/${slug} missing title`);
				assert.ok(page.frontmatter.layout_hint, `${track}/${slug} missing layout_hint`);
				assert.ok(page.html.length > 0, `${track}/${slug} has empty html`);
			}
		}
	});

	it("landing page routes are not affected by dynamic route", () => {
		const darkLanding = path.resolve("dashboard/app/dark/page.tsx");
		const lightLanding = path.resolve("dashboard/app/light/page.tsx");
		assert.ok(fs.existsSync(darkLanding), "Dark landing page should still exist");
		assert.ok(fs.existsSync(lightLanding), "Light landing page should still exist");
	});

	it("generateMetadata produces title from frontmatter", async () => {
		const page = await getPageContent("dark", "faq");
		assert.equal(page.frontmatter.title, "PROTOCOL FAQ");
	});
});
```

**Step 2: Run tests**

Run: `npm test -- --test-name-pattern "inner pages"`
Expected: 6 PASS

**Step 3: Run full CI**

Run: `npm run ci`
Expected: All tests pass (~77 total)

**Step 4: Commit**

```bash
git add test/pages/inner-pages.test.ts
git commit -m "test: inner page route and content validation tests (T4.2)"
```

---

## Task 8: Track-specific content styles in globals.css

**Files:**
- Modify: `dashboard/app/globals.css`

**Step 1: Add content marker styles**

Append track-scoped styles for content markers and prose typography:

- `.content-body` base: headings, paragraphs, lists, code blocks, tables, links, blockquotes
- `.theme-dark .content-body .content-highlight`: green (#00FF41) left border, rgba(0,0,0,0.6) bg, monospace
- `.theme-light .content-body .content-highlight`: gold (#FFD700) left border, glassmorphism bg (rgba(248,253,255,0.7), backdrop-blur)
- `.theme-dark .content-body .content-alert`: red/orange border, ALL CAPS first line, terminal feel
- `.theme-light .content-body .content-alert`: warm amber bg, subtle border
- `.theme-dark .content-body .content-quote`: green text, monospace, left border
- `.theme-light .content-body .content-quote`: gold italic, large text, centered
- `.theme-dark .content-body .content-table`: green borders, monospace, dark bg
- `.theme-light .content-body .content-table`: rounded corners, subtle row striping

**Step 2: Verify styles don't break existing pages**

Run: `cd dashboard && USE_MEMORY_STORE=true npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add dashboard/app/globals.css
git commit -m "feat: track-specific content marker styles (T4.3 partial)"
```

---

## Task 9: Full CI verification

**Step 1: Run full CI**

Run: `npm run ci`
Expected: All tests pass, lint clean, typecheck clean

**Step 2: Run build**

Run: `cd dashboard && USE_MEMORY_STORE=true npm run build`
Expected: Build succeeds with 14 statically generated inner pages

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: CI and build fixes for content system"
```

---

## Summary

| Task | What | Sprint Task |
|------|------|-------------|
| 1 | Install deps | T4.1 |
| 2 | Content loader + tests | T4.1 |
| 3 | Content marker tests | T4.1 |
| 4 | ContentRenderer component | T4.1 |
| 5 | Dynamic route + static params | T4.2 |
| 6 | Navigation component | T4.2 |
| 7 | Inner page tests | T4.2 |
| 8 | Track-specific CSS | T4.3 partial |
| 9 | Full CI verification | T4.1 + T4.2 |

T4.3 remaining work (header image generation, HUD frames, glassmorphism borders, responsive banners) needs a separate plan once the base content system is working.

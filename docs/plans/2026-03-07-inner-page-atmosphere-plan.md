# Inner Page Atmosphere Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring track-specific visual atmosphere to all 14 inner pages with per-page CSS variations, layout hint extensions, section prefix numbering, and frontmatter-driven image placement.

**Architecture:** CSS-first per-page variations via `.page-{slug}` classes on ContentRenderer wrapper, combined with `.theme-dark`/`.theme-light` body class. Layout hints (`terminal`, `accordion`, `essay`) handle structural differences. Background effects (MatrixRain, GradientOrbs) added in the page route at reduced opacity. Images auto-injected via `images` frontmatter field.

**Tech Stack:** Next.js 14 App Router, CSS (globals.css), React server/client components, unified markdown pipeline

**Security note:** All HTML content is pre-sanitized by rehype-sanitize at build time. Content is source-controlled markdown, not user input. Image placeholders are injected after sanitization into trusted, source-controlled content only.

---

### Task 1: Small independents — Content guide, academic paper scaffold, npm audit

These three tasks (T5.4, T5.5, T5.6) have no dependencies. Execute them first.

#### T5.4 — Content guide for cowork

**Files:**
- Create: `content/CONTENT_GUIDE.md`

**Step 1: Write the guide**

Create `content/CONTENT_GUIDE.md` with these sections:
- File structure: `content/{track}/pages/{slug}.md`
- Frontmatter fields: all fields with types and descriptions
- Content markers: `{highlight}`, `{table}`, `{alert}`, `{quote}` with syntax examples
- Rules: markers on own lines, blank lines before/after, GFM table syntax, verbatim copy
- Example: complete page file with frontmatter + body
- Track differences: dark uses `section_prefix`, light uses warmer tone
- Image placement: `images` frontmatter array (document after T5.3, leave placeholder)

**Step 2: Commit**

```bash
git add content/CONTENT_GUIDE.md
git commit -m "docs: content guide for cowork — frontmatter spec, markers, rules"
```

#### T5.5 — Academic paper scaffold

**Files:**
- Create: `content/light/pages/academic-paper.md`
- Create: `content/dark/pages/academic-paper.md`
- Modify: `dashboard/app/components/TrackLayout.tsx:7-14` — add to PAGES array
- Modify: `test/pages/inner-pages.test.ts` — update slug count from 7 to 8
- Modify: `test/lib/content.test.ts` — update slug count from 7 to 8

**Step 1: Create light academic paper placeholder**

```markdown
---
track: light
slug: academic-paper
title: "Research Paper"
badge: "Academic"
layout_hint: standard
design_notes: |
  Academic paper layout. Clean, institutional. Serif headlines, generous margins.
  This page will be populated by cowork with full research content.
sources: []
---

## Coming Soon

This academic paper is currently being researched and written. Check back for the full publication exploring the cryptographic foundations and identity philosophy behind CAPTHCA.
```

**Step 2: Create dark academic paper placeholder**

```markdown
---
track: dark
slug: academic-paper
title: "RESEARCH // PUBLICATION"
badge: "CLASSIFIED"
layout_hint: standard
section_prefix: "99"
design_notes: |
  Academic paper in dark terminal style. Dense, monospaced, classified document feel.
  This page will be populated by cowork with full research content.
sources: []
---

## > PUBLICATION PENDING

Research documentation in progress. Cryptographic proofs, protocol specifications, and formal verification results will be published here upon completion.
```

**Step 3: Add to PAGES array in TrackLayout**

In `dashboard/app/components/TrackLayout.tsx`, add to the PAGES array after whitepaper:

```typescript
const PAGES = [
	{ slug: "about", label: "About" },
	{ slug: "how-it-works", label: "How It Works" },
	{ slug: "philosophy", label: "Philosophy" },
	{ slug: "use-cases", label: "Use Cases" },
	{ slug: "human-vs-machine", label: "Human vs Machine" },
	{ slug: "whitepaper", label: "Whitepaper" },
	{ slug: "academic-paper", label: "Paper" },
	{ slug: "faq", label: "FAQ" },
];
```

**Step 4: Update test assertions**

In `test/pages/inner-pages.test.ts`, change `7` to `8` in both slug count assertions.
In `test/lib/content.test.ts`, change `7` to `8` in both slug count assertions.

**Step 5: Run tests**

```bash
npm run ci
```

Expected: all tests pass with 8 slugs per track.

**Step 6: Commit**

```bash
git add content/light/pages/academic-paper.md content/dark/pages/academic-paper.md dashboard/app/components/TrackLayout.tsx test/pages/inner-pages.test.ts test/lib/content.test.ts
git commit -m "feat: academic paper scaffold — placeholder pages + nav link (T5.5)"
```

#### T5.6 — npm audit in CI

**Files:**
- Modify: `package.json` — add audit to ci chain

**Step 1: Update ci script**

Add audit at the end, non-blocking:

```json
"ci": "npm run lint && npm run typecheck && npm run test && (cd dashboard && npm audit --audit-level=critical || echo '⚠ npm audit: warnings present (non-blocking)')"
```

**Step 2: Run CI**

```bash
npm run ci
```

Expected: passes, audit output shown but doesn't block.

**Step 3: Commit**

```bash
git add package.json
git commit -m "feat: add non-blocking npm audit to CI pipeline (T5.6)"
```

---

### Task 2: ContentRenderer — slug prop + layout hint extensions

This is the foundation for both atmosphere tasks (T5.1, T5.2).

**Files:**
- Modify: `dashboard/components/ContentRenderer.tsx`
- Modify: `dashboard/app/[track]/[slug]/page.tsx` — pass slug prop
- Modify: `dashboard/lib/content.ts` — add section prefix post-processing
- Create: `dashboard/components/AccordionContent.tsx`
- Test: `test/pages/content-renderer.test.ts`

**Step 1: Write failing tests**

Create `test/pages/content-renderer.test.ts`:

```typescript
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPageContent } from "../../dashboard/lib/content.ts";

describe("content renderer features", () => {
	it("page-{slug} class is present in ContentRenderer output", async () => {
		const page = await getPageContent("dark", "about");
		assert.ok(page.frontmatter.slug === "about");
	});

	it("section_prefix exists on dark about page", async () => {
		const page = await getPageContent("dark", "about");
		assert.equal(page.frontmatter.section_prefix, "00");
	});

	it("section prefix is injected into h2 tags when present", async () => {
		const page = await getPageContent("dark", "about");
		assert.ok(page.html.includes("00 //"));
	});

	it("layout_hint is available on all pages", async () => {
		const page = await getPageContent("light", "faq");
		assert.ok(["standard", "split", "centered", "terminal", "accordion", "essay"].includes(page.frontmatter.layout_hint));
	});

	it("new layout hints are recognized", async () => {
		const lightFaq = await getPageContent("light", "faq");
		const darkFaq = await getPageContent("dark", "faq");
		assert.equal(lightFaq.frontmatter.layout_hint, "accordion");
		assert.equal(darkFaq.frontmatter.layout_hint, "terminal");
	});
});
```

**Step 2: Run tests to verify they fail**

```bash
npm test 2>&1 | grep -E "content renderer"
```

Expected: failures on section prefix injection and layout hint assertions.

**Step 3: Update content frontmatter files**

Update `content/dark/pages/faq.md` frontmatter: change `layout_hint` to `terminal`
Update `content/light/pages/faq.md` frontmatter: change `layout_hint` to `accordion`
Update `content/light/pages/philosophy.md` frontmatter: change `layout_hint` to `essay`

**Step 4: Add section prefix post-processing to content.ts**

In `dashboard/lib/content.ts`, add a new function after `transformContentMarkers`:

```typescript
/**
 * Inject section prefix numbering into h2 tags.
 * Transforms <h2>Title</h2> into <h2><span class="section-prefix">00 //</span> TITLE</h2>
 */
export function injectSectionPrefix(html: string, prefix: string): string {
	let counter = 0;
	return html.replace(/<h2>(.*?)<\/h2>/g, (_match, title) => {
		const num = counter === 0 ? prefix : `${prefix}.${counter}`;
		counter++;
		return `<h2><span class="section-prefix">${num} //</span> ${title.toUpperCase()}</h2>`;
	});
}
```

Call it in `getPageContent` after `renderMarkdown`:

```typescript
let html = await renderMarkdown(content);
if (data.section_prefix) {
	html = injectSectionPrefix(html, data.section_prefix);
}
```

**Step 5: Add slug prop to ContentRenderer**

In `dashboard/components/ContentRenderer.tsx`, add `slug` prop and extend layout hints:

```typescript
export function ContentRenderer({
	html,
	frontmatter,
	slug,
}: {
	html: string;
	frontmatter: PageFrontmatter;
	slug: string;
}) {
	const layoutClass =
		{
			standard: "max-w-[850px]",
			split: "max-w-[1100px]",
			centered: "max-w-[650px]",
			terminal: "max-w-[850px]",
			accordion: "max-w-[850px]",
			essay: "max-w-[650px]",
		}[frontmatter.layout_hint] ?? "max-w-[850px]";
```

Update the content div className to include slug and layout:

```html
className={`content-body prose page-${slug} layout-${frontmatter.layout_hint}`}
```

**Step 6: Pass slug in page route**

In `dashboard/app/[track]/[slug]/page.tsx`:

```typescript
<ContentRenderer html={page.html} frontmatter={page.frontmatter} slug={params.slug} />
```

**Step 7: Create AccordionContent component**

Create `dashboard/components/AccordionContent.tsx` — a client component that transforms h2+content pairs into collapsible sections for the light FAQ. Uses DOM manipulation in useEffect to wrap h2 siblings in `.accordion-panel` divs with click-to-toggle behavior.

**Step 8: Wire AccordionContent into ContentRenderer**

For `accordion` layout hint, render AccordionContent instead of plain div. AccordionContent gets the same `page-{slug} layout-accordion` classes.

**Step 9: Run tests**

```bash
npm run ci
```

**Step 10: Commit**

```bash
git add dashboard/components/ContentRenderer.tsx dashboard/components/AccordionContent.tsx dashboard/app/[track]/[slug]/page.tsx dashboard/lib/content.ts content/dark/pages/faq.md content/light/pages/faq.md content/light/pages/philosophy.md test/pages/content-renderer.test.ts
git commit -m "feat: ContentRenderer slug prop, layout hints (terminal/accordion/essay), section prefix"
```

---

### Task 3: Dark atmosphere — backgrounds + per-page CSS (T5.1)

**Files:**
- Modify: `dashboard/app/[track]/[slug]/page.tsx` — add MatrixRain + CRT for dark
- Modify: `dashboard/app/globals.css` — dark per-page variations
- Test: `test/pages/dark-atmosphere.test.ts`

**Step 1: Write failing tests**

Create `test/pages/dark-atmosphere.test.ts` — verify MatrixRain import in page route, CRT overlay presence, per-page CSS classes for all 7 slugs, section-prefix class, reduced opacity.

**Step 2: Add atmosphere to inner page route**

In `dashboard/app/[track]/[slug]/page.tsx`, add conditional rendering:
- Dark: MatrixRain at 30% opacity + CRT scanline overlay (same pattern as landing but lighter)
- Light: GradientOrbs at 40% opacity
- Content wrapped in `relative z-[1]` div to sit above backgrounds

**Step 3: Add dark per-page CSS to globals.css**

7 variation blocks:
- `.page-about`: dense monospace, alternating section backgrounds
- `.page-faq`: terminal prompt `>` prefix on h2, mono font
- `.page-how-it-works`: HUD-style h3 with acid-green left border
- `.page-philosophy`: wide spacing, proof-style quotes
- `.page-human-vs-machine`: clinical data table, mono stats
- `.page-use-cases`: threat/solution cards with green borders
- `.page-whitepaper`: classified doc border, red accent headings

Plus `.section-prefix` styling (acid-green, mono, bold).

**Step 4: Run tests, commit**

---

### Task 4: Light atmosphere — per-page CSS (T5.2)

**Files:**
- Modify: `dashboard/app/globals.css` — light per-page variations
- Test: `test/pages/light-atmosphere.test.ts`

GradientOrbs already added in Task 3.

**Step 1: Write failing tests**

Verify GradientOrbs import, light per-page CSS classes, accordion CSS, essay layout.

**Step 2: Add light per-page CSS to globals.css**

7 variation blocks:
- `.page-about`: warm line-height
- `.page-faq`: accordion trigger/panel styles (glassmorphism cards, gold border, chevron, max-height transition)
- `.page-how-it-works`: glassmorphism h3 cards
- `.page-philosophy`: serif h2/h3, 1.9 line-height, decorative quote marks
- `.page-human-vs-machine`: warm table with alternating rows, gold header
- `.page-use-cases`: glassmorphism card styling on paragraphs after h2
- `.page-whitepaper`: serif headlines, academic feel

**Step 3: Run tests, commit**

---

### Task 5: Content image integration via frontmatter (T5.3)

**Files:**
- Modify: `dashboard/lib/content.ts` — extend PageFrontmatter, add image injection
- Modify: `dashboard/components/ContentRenderer.tsx` — render injected images
- Modify: content frontmatter files — add `images` arrays
- Modify: `dashboard/app/globals.css` — image frame styles
- Test: `test/lib/content-images.test.ts`

**Step 1: Write failing tests**

Verify images array in frontmatter, image entry fields (src/after/style), placeholder injection in HTML.

**Step 2: Extend PageFrontmatter with ContentImage interface**

```typescript
export interface ContentImage {
	src: string;
	after: string;
	style: string;
}
```

**Step 3: Add image placeholder injection**

Post-process HTML after section prefix injection. Find h2/h3 matching the `after` text and inject a `<div class="content-image-placeholder" data-src="..." data-style="...">` after it.

**Step 4: Render images in ContentRenderer**

Replace placeholder divs with `<img>` tags wrapped in frame classes. Use `<img>` (not next/image) since we're injecting into HTML strings. All content is source-controlled and trusted.

Image frame CSS:
- `.content-img-hud`: border + corner bracket pseudo-elements
- `.content-img-glass`: 16px radius, blur border, box-shadow
- `.content-img-full`: minimal 4px radius

**Step 5: Update content frontmatter**

Add `images` arrays to how-it-works (4 HUD/flow images per track), about, whitepaper, philosophy where images exist.

**Step 6: Run tests, commit**

---

### Task 6: Update content guide + final polish

Update `content/CONTENT_GUIDE.md` with image placement documentation. Commit.

---

### Task 7: Deploy to staging (T5.7)

1. Run `npm run ci`
2. Run `bin/deploy-staging.sh`
3. Smoke test all pages in browser
4. Verify no console errors
5. Report results

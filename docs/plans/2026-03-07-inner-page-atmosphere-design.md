# Inner Page Atmosphere Design

**Goal:** Bring track-specific visual language to all 14 inner pages with per-page variations, so each page feels distinct while cohesive with its track.

## Architecture

### Background & Overlay System

The `[track]/[slug]/page.tsx` route adds track-specific atmosphere:

- **Dark pages:** MatrixRain (30% opacity) + CRT scanline overlay
- **Light pages:** GradientOrbs (40% opacity), no additional overlay

Atmosphere lives in the page route, not ContentRenderer. ContentRenderer is purely about content.

### Per-page CSS Variation System

ContentRenderer gets a `slug` prop. Wrapper renders as `<div class="content-body page-{slug}">`.

Combined with `.theme-dark` / `.theme-light` on `<body>`:

```css
.theme-dark .content-body { /* all dark pages */ }
.theme-dark .content-body.page-faq { /* dark FAQ only */ }
.theme-light .content-body.page-philosophy { /* light philosophy only */ }
```

### Per-page Variation Map

| Page | Dark Variation | Light Variation |
|------|---------------|-----------------|
| about | Dense, minimal whitespace, alternating bg sections | Lattice-detail.png faded behind header, warm spacing |
| faq | Terminal prompt `>` on questions, instant reveal | Accordion cards, gold border, 12px radius |
| how-it-works | HUD-style, acid-green borders on diagrams | Gold flow arrows, glassmorphism step cards |
| philosophy | Wider spacing, proof-style logical blocks | Essay layout, narrow max-width (~650px), serif headlines |
| human-vs-machine | Clinical stats, red/green data table | Warm comparison table, alternating row colors |
| use-cases | Threat→solution cards, acid-green left borders | Glassmorphism cards with gold borders |
| whitepaper | Classified doc style, red accents | Academic/institutional, serif headline |

### Layout Hint Extensions

Existing: `standard`, `split`, `centered` (max-width only).

New hints:
- **`terminal`** (dark FAQ): h2 as command prompts (`> QUESTION`), monospace answers, no animation
- **`accordion`** (light FAQ): collapsible cards with gold border, 12px radius, ease-out animation
- **`essay`** (light philosophy): 650px max-width, line-height 1.8, serif h2/h3

Content files updated to use new hints where needed.

### Section Prefix Numbering

Dark pages with `section_prefix` frontmatter render headings as `XX // TITLE`. Prefix increments per section (`00 // TITLE`, `00.1 // SUBTITLE`). Light pages don't use prefixes.

## Files

**Modified:**
- `dashboard/app/[track]/[slug]/page.tsx` — add MatrixRain/GradientOrbs conditionally
- `dashboard/components/ContentRenderer.tsx` — slug prop, page-{slug} class, section prefix, layout hints
- `dashboard/app/globals.css` — per-page CSS variations
- 4 content frontmatter files — update layout_hint values

**New:**
- `dashboard/components/AccordionContent.tsx` — client component for light FAQ

**Unchanged:**
- TrackLayout, MatrixRain, GradientOrbs, CRT overlay (reused as-is)
- Content markdown body text

## Data Flow

```
content/{track}/pages/{slug}.md
  → gray-matter (frontmatter + body)
  → unified pipeline (markdown → HTML)
  → post-process: markers, section prefixes
  → ContentRenderer(html, frontmatter, slug)
    → layout_hint drives structure
    → page-{slug} class drives CSS variations
  → [track]/[slug]/page.tsx wraps in atmosphere + TrackLayout
```

## Excluded (YAGNI)

- Per-page animation speed controls in frontmatter
- Dynamic background color config in frontmatter
- Custom component registry per page
- Whitepaper content generation (cowork handles separately)

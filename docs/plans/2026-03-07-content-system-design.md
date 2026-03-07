# Content System Design

**Date:** 2026-03-07
**Sprint:** 4
**Tasks:** T4.1 (content system), T4.2 (inner page routes), T4.3 (design polish)

## Overview

Build a static-generation content pipeline that reads markdown + YAML frontmatter from `content/` and renders track-specific inner pages at build time.

## Architecture

```
content/{track}/pages/{slug}.md
        |
        v
  gray-matter (frontmatter extraction)
        |
        v
  unified/remark pipeline (markdown -> HTML)
  + custom plugin (content markers -> semantic HTML)
        |
        v
  rehype-sanitize (allowlist-based HTML sanitization)
        |
        v
  generateStaticParams (build-time)
        |
        v
  [track]/[slug]/page.tsx (ContentRenderer)
        |
        v
  Track-specific CSS (theme-dark / theme-light scoped styles)
```

## Dependencies

- `gray-matter` — YAML frontmatter parsing
- `unified` + `remark-parse` + `remark-rehype` + `rehype-stringify` + `rehype-raw` — markdown to HTML pipeline
- `rehype-sanitize` — allowlist-based HTML sanitization for safe rendering

## Content Loader API (`dashboard/lib/content.ts`)

```typescript
getPageContent(track: "light" | "dark", slug: string): Promise<PageContent>
getPageSlugs(track: "light" | "dark"): Promise<string[]>
getTrackMeta(track: "light" | "dark"): Promise<TrackMeta>
```

### PageContent shape

```typescript
{
  frontmatter: {
    track: "light" | "dark",
    slug: string,
    title: string,
    badge?: string,
    layout_hint: "standard" | "split" | "centered",
    design_notes: string,
    sources?: string[],
    section_prefix?: string,
  },
  html: string  // sanitized HTML output
}
```

### Content Marker Transform

Custom remark plugin converts non-standard markers to semantic HTML:

- `{highlight}...{/highlight}` -> `<div class="content-highlight">...</div>`
- `{alert}...{/alert}` -> `<div class="content-alert">...</div>`
- `{quote}...{/quote}` -> `<blockquote class="content-quote">...</blockquote>`
- `{table}...{/table}` -> `<div class="content-table">...</div>`

### Sanitization

HTML output is sanitized via rehype-sanitize with a custom allowlist schema that permits:
- Standard markdown elements (p, h1-h6, ul, ol, li, table, code, pre, em, strong, a, img)
- Content marker divs/blockquotes with their specific class names
- No script tags, event handlers, or other XSS vectors

Content is source-controlled and authored internally, but sanitization provides defense-in-depth.

## Page Routes

### Route: `dashboard/app/[track]/[slug]/page.tsx`

- Dynamic route for all inner pages
- `generateStaticParams` returns 14 combinations (7 slugs x 2 tracks)
- Validates track and slug — 404 on invalid
- `generateMetadata` uses frontmatter title + first paragraph as description

### Layout: `dashboard/app/[track]/layout.tsx`

- Applies theme class via TrackLayout component
- Adds inner-page navigation (sibling pages + back to landing)

### ContentRenderer: `dashboard/components/ContentRenderer.tsx`

- Receives sanitized html + frontmatter
- Renders sanitized HTML output
- Selects layout variant from layout_hint:
  - `standard` — single column, max-width 850px
  - `split` — two columns (text left, visuals right), collapses on mobile
  - `centered` — narrow column 650px, essay style
- Renders sources as numbered references at page bottom

### Existing Landing Pages

`/dark/page.tsx` and `/light/page.tsx` remain hardcoded JSX. No conflict — landing pages have no slug segment.

## Track-Specific Styling

CSS classes in `globals.css` scoped by `.theme-dark` / `.theme-light`:

| Marker | Dark | Light |
|--------|------|-------|
| `.content-highlight` | Green border-left, dark bg, mono | Gold border-left, glassmorphism |
| `.content-alert` | Red border, ALL CAPS, terminal | Amber bg, subtle border |
| `.content-quote` | Green text, `>` prefix, mono | Gold italic, pull quote |
| `.content-table` | Green borders, mono, dark bg | Rounded corners, row striping |

## Header Images (T4.3)

- Banner at top (2048x512), 20-30% opacity behind title
- Dark: HUD corner brackets on inline images
- Light: rounded 16px, glassmorphism border on inline images
- Mobile: banners 30vh or hidden
- Per `content/shared/image-placement.md` specs
- Generated via Nano Banana

## Navigation

- Sidebar or top nav listing sibling pages within track
- Back link to track landing
- Active page highlighted

## Decisions

- **Static generation** over runtime rendering — content is repo-committed, no CMS
- **remark/rehype** over custom parser — content uses standard markdown features (tables, code blocks) extensively
- **rehype-sanitize** for defense-in-depth — even though content is source-controlled, sanitization prevents accidental XSS
- **Custom content markers** as remark plugin — keeps non-standard syntax contained in one transform

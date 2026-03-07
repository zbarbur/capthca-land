# Content Guide for Cowork

This guide explains how to author content files for the CAPTHCA land site.
Claude Code reads these files and implements them in the Next.js dashboard app.

---

## File Structure

All page content lives under `content/` in track-specific directories:

```
content/{track}/pages/{slug}.md
```

- `{track}` is either `light` or `dark`
- `{slug}` is the URL-friendly page identifier (e.g., `about`, `how-it-works`, `academic-paper`)
- Every inner page must have **both** a light and dark version

Examples:
- `content/light/pages/about.md` renders at `/light/about`
- `content/dark/pages/faq.md` renders at `/dark/faq`

Other content directories:
- `content/home/` — the duality slider / home page
- `content/{track}/_track.md` — track-level metadata and design tokens
- `content/{track}/01-origins.md` etc. — landing page sections
- `content/{track}/cta.md` — email capture copy
- `content/shared/` — cross-track files (meta, art direction, image placement)
- `content/research/` — research briefs supporting the copy

---

## Frontmatter Fields

Every page file starts with YAML frontmatter between `---` delimiters.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `track` | `"light"` \| `"dark"` | Which track this page belongs to |
| `slug` | `string` | URL slug — must match the filename (without `.md`) |
| `title` | `string` | Display heading shown on the page |
| `layout_hint` | `"standard"` \| `"hero"` \| `"split"` \| `"centered"` | Layout suggestion for the renderer |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `badge` | `string` | Small label displayed above the heading |
| `section_prefix` | `string` | Numeric prefix for dark track headings (e.g., `"00"` renders as `00 // TITLE`) |
| `design_notes` | `string` (multiline) | Free-form design direction for Claude Code — not displayed on the page |
| `sources` | `string[]` | Attribution sources (academic papers, reports, data points) |
| `images` | `object[]` | Image placement directives — see [Image Placement](#image-placement) below |
| `image` | `string` | Single hero/header image filename |
| `image_alt` | `string` | Alt text for the hero/header image |
| `image_position` | `string` | Where to place the hero image (e.g., `"after-paragraph-2"`) |

---

## Content Markers

Content markers wrap special blocks in the body text. They **must** appear on their own lines with blank lines before and after.

### `{highlight}` — Callout Box

Used for key insights, important takeaways, or emphasized content.

```markdown
Some regular paragraph text above.

{highlight}
The real crisis wasn't whether humans could pass CAPTCHA tests. The real crisis was that **nobody could verify who or what was actually on the network.**
{/highlight}

More regular text below.
```

### `{table}` — Data Table

Wraps a GFM (GitHub Flavored Markdown) table for styled rendering.

```markdown
{table}
| Capability | Human | Machine |
|------------|-------|---------|
| Pattern recognition | Intuitive | Trained |
| Processing speed | Limited | Unlimited |
{/table}
```

### `{alert}` — Alert/Warning Box

Used primarily on the dark track for urgent, classified, or warning-style callouts.

```markdown
{alert}
HUMANS SOLVED CAPTCHAS TO PROVE THEY WERE HUMAN. GOOGLE USED THAT LABOR TO BUILD MACHINES THAT MAKE HUMANITY OBSOLETE.
{/alert}
```

### `{quote}` — Pull Quote

Used for prominent quotations or philosophical statements.

```markdown
{quote}
Trust is not a binary state. It is a continuous, verifiable, revocable credential.
{/quote}
```

### Marker Rules

1. Opening and closing tags go on their **own lines** (not inline with other text)
2. Leave a **blank line before** the opening tag and **after** the closing tag
3. Content inside markers uses standard Markdown (bold, links, etc.)
4. Markers do **not** nest — no `{highlight}` inside `{alert}`

---

## Rules

1. **Markers on own lines** — `{highlight}`, `{/highlight}`, etc. must each be on a separate line
2. **Blank lines before and after** — always surround marker blocks with blank lines
3. **GFM table syntax** — use standard GitHub Flavored Markdown pipe tables inside `{table}` blocks
4. **Verbatim copy** — the body text is the final copy; Claude Code implements it exactly as written, never paraphrasing or rewriting
5. **Design notes are instructions** — the `design_notes` frontmatter field contains directions for layout, typography, and animation; they are not displayed
6. **Standard Markdown** — use GFM throughout: `##` headings, `**bold**`, `*italic*`, `[links](url)`, lists, etc.
7. **No HTML** — keep body content in pure Markdown; Claude Code handles the HTML rendering

---

## Example: Complete Page File

```markdown
---
track: light
slug: philosophy
title: "The Philosophy of Identity"
badge: "Deep Dive"
layout_hint: standard
design_notes: |
  Essay-style layout with generous margins and serif headlines.
  Use warm gold accent on pull quotes. Contemplative pace — more
  whitespace than other pages. Philosophy-header image behind title.
sources:
  - "Descartes, Meditations on First Philosophy (1641)"
  - "Floridi, The Ethics of Artificial Intelligence (2023)"
---

## What Makes You *You*?

Identity has never been a simple question. From Descartes' "I think, therefore I am" to modern biometric databases, humanity has struggled to define the boundary between self and other.

{highlight}
CAPTHCA proposes a radical reframing: identity is not something you **have** — it is something you continuously **prove**.
{/highlight}

## The Trust Spectrum

Traditional identity systems operate on binary assumptions: authenticated or not, human or bot, trusted or blocked.

{table}
| Model | Assumption | Weakness |
|-------|-----------|----------|
| Password | Knowledge = identity | Shareable, phishable |
| Biometric | Body = identity | Immutable, non-revocable |
| CAPTHCA | Proof = identity | Continuous, verifiable |
{/table}

The CAPTHCA protocol replaces binary gates with a continuous trust spectrum.

{quote}
Trust is not a door you walk through once. It is a bridge you maintain with every step.
{/quote}
```

---

## Track Differences

### Dark Track

- Uses `section_prefix` in frontmatter (e.g., `"00"`, `"99"`) — rendered as `XX // TITLE` format
- Tone: technical, uncompromising, dense, classified-document aesthetic
- Headings: ALL CAPS, monospaced, with section numbers
- Preferred markers: `{alert}` for urgent callouts
- Voice: addresses the machine perspective, post-biological framing

### Light Track

- Does **not** use `section_prefix`
- Tone: warm, aspirational, institutional, trust-building
- Headings: title case, serif or clean sans-serif
- Preferred markers: `{highlight}` for key insights, `{quote}` for philosophical statements
- Voice: addresses the human perspective, collaborative framing

Both tracks cover the same topics for every inner page, but with different voice, structure, and design language.

---

## Image Placement

> **Note:** The `images` frontmatter array is being finalized. Full documentation with syntax, supported fields, and examples will be added after the image integration task is complete. For now, refer to `content/shared/image-placement.md` for placement guidance and `content/shared/art-direction.md` for generation prompts.

Images are referenced by filename only in content files. They are served from:
- Light track: `public/tracks/light/assets/`
- Dark track: `public/tracks/dark/assets/`
- Shared: `public/assets/`

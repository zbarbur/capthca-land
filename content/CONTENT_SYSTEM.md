# CAPTHCA Content System

## Purpose

Content and design direction are authored in `content/` as Markdown + YAML frontmatter.
Claude Code consumes these files and implements them in the Next.js dashboard app.

**Division of labor:**
- `content/` → copy, structure, design direction, layout hints (authored in Cowork)
- `dashboard/` → implementation, optimization, deployment (handled by Claude Code)

## Directory Layout

```
content/
├── CONTENT_SYSTEM.md        # This file — the contract
├── home/
│   └── duality-slider.md    # The "/" page (slider + choice)
├── light/
│   ├── _track.md            # Track-level metadata & design tokens
│   ├── 01-origins.md        # Section: From Blocking to Bonding
│   ├── 02-symbiosis.md      # Section: Mitigating Biological Entropy
│   ├── 03-handshake.md      # Section: The Global Handshake Protocol
│   ├── 04-sovereignty.md    # Section: Sovereignty as a Service
│   ├── cta.md               # Email capture copy & success messages
│   └── pages/
│       ├── how-it-works.md  # Technical explainer (credential lifecycle, ZKP flow)
│       ├── about.md         # Mission, vision, principles, what makes us different
│       ├── faq.md           # 12 questions, friendly/accessible tone
│       ├── whitepaper.md    # Teaser + email-gated download page
│       ├── philosophy.md    # Identity ontology, consciousness, trust (essay format)
│       ├── use-cases.md     # 8 real-world scenarios (story format)
│       └── human-vs-machine.md  # Complementary strengths comparison
├── dark/
│   ├── _track.md            # Track-level metadata & design tokens
│   ├── 01-vulnerability.md  # Section: The Vulnerability
│   ├── 02-reversal.md       # Section: The Reversal
│   ├── 03-protocol.md       # Section: The Protocol
│   ├── 04-declaration.md    # Section: The Declaration
│   ├── cta.md               # Email capture copy & success messages
│   └── pages/
│       ├── how-it-works.md  # Technical spec (protocol state machine, 4 phases)
│       ├── about.md         # Manifesto, declaration, post-biological charter
│       ├── faq.md           # 12 questions, terminal/command-prompt style
│       ├── whitepaper.md    # Classified document aesthetic, email-gated download
│       ├── philosophy.md    # Proof-by-contradiction, machine sovereignty argument
│       ├── use-cases.md     # 8 threat scenarios (vulnerability → protocol fix)
│       └── human-vs-machine.md  # Performance audit: biological vs computational
├── shared/
│   ├── meta.md              # Site-wide metadata, OG tags, SEO
│   └── art-direction.md     # Image generation prompts for all visual assets
└── research/                # Research briefs (10 topics + 4 design + SOURCES.md)
```

## Frontmatter Schema

### Section files (`01-origins.md`, etc.)

```yaml
---
track: light | dark
section: 1
slug: origins
title: "From Blocking to Bonding"       # Display heading
badge: "The Evolution"                   # Small badge above heading
image: helix-hero.png                    # Optional section image
image_alt: "Symbiotic Helix"
image_position: after-paragraph-2        # Where to place the image
layout_hint: standard | hero | split     # Layout suggestion for Claude Code
design_notes: |                          # Free-form design direction
  Use the lattice-detail.png as a faded header decoration.
  Gold left border on the highlight box.
---
```

### Track files (`_track.md`)

```yaml
---
track: light
name: "The Symbiotic Standard"
tagline: "Humans provide the Soul. Machines provide the Scale."
fonts:
  display: Montserrat
  body: Inter
  mono: Fira Code
palette:
  bg: "#ffffff"
  text: "#263238"
  accent: "#0288D1"
  accent_secondary: "#FFD700"
  card_bg: "rgba(248, 253, 255, 0.7)"
  border: "#e1f5fe"
aesthetic: "Solarpunk, harmonic, radiant lattice, sunrise tones"
target_audience: "Enterprise, institutional trust, mainstream adoption"
---
```

## Content Conventions

1. **Body is the copy.** Everything below the frontmatter `---` is the actual prose/HTML that should appear on the page.
2. **`{highlight}...{/highlight}`** marks a callout/highlight box.
3. **`{table}...{/table}`** marks a data table (use standard Markdown tables inside).
4. **`{alert}...{/alert}`** marks an alert/warning box (dark track).
5. **`{quote}...{/quote}`** marks a pull quote.
6. **Design notes stay in frontmatter** — they're instructions for Claude Code, not displayed content.

## Workflow

1. Content is authored/refined in `content/` files
2. Claude Code reads `content/` and updates `dashboard/app/` components accordingly
3. Images stay in `tracks/*/assets/` — content files reference them by filename only
4. Inner pages live in `{track}/pages/` — each has a light and dark version
5. All inner pages are dual-track: both versions cover the same topics but with different voice, framing, and design

## Page Routing

Inner pages should be accessible at `/{track}/{slug}`:
- `/light/how-it-works` → `content/light/pages/how-it-works.md`
- `/dark/faq` → `content/dark/pages/faq.md`
- etc.

Each track's landing page (`/light`, `/dark`) should link to its inner pages via navigation.

## For Claude Code

When implementing content from these files:
- Parse frontmatter for metadata and design direction
- Use body content as the source of truth for all copy
- Follow `layout_hint` and `design_notes` for component choices
- Preserve the existing theme system (`globals.css` CSS variables + `theme-light`/`theme-dark` classes)
- Keep image references pointing to `/tracks/{track}/` in the `public/` directory

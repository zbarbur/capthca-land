---
purpose: "Maps generated images to specific page locations and defines image needs for inner pages"
notes: |
  This file tells Claude Code WHERE to use each image.
  art-direction.md defines WHAT to generate (prompts).
  This file defines WHERE to place them + additional images needed for inner pages.
---

# Image Placement Guide

## File Locations

- Dark track images: `public/tracks/dark/assets/`
- Light track images: `public/tracks/light/assets/`
- Shared images: `public/assets/`

---

## Home Page (Duality Slider)

| Image | Placement | Usage |
|-------|-----------|-------|
| `light-hero.png` | Light half background | 15-20% opacity, behind "COLLABORATE" text |
| `dark-hero.png` | Dark half background | 15-20% opacity, behind "SECEDE" text, under Matrix rain |
| `slider-center.png` | Not used directly | Collision zone handled by CSS gradient line |

---

## Landing Pages (Track Main Pages)

### Light Track (`/light`)

| Image | Section | Placement |
|-------|---------|-----------|
| `light-hero.png` | Top hero area | Full-width background, 15-20% opacity |
| `light-01-origins.png` | Section 1: From Blocking to Bonding | Inline illustration, after paragraph 2 |
| `light-02-symbiosis.png` | Section 2: Mitigating Biological Entropy | Inline illustration, beside or after the partnership table |
| `light-03-handshake.png` | Section 3: The Global Handshake Protocol | Inline illustration, after the ZKP explanation |
| `light-04-sovereignty.png` | Section 4: Sovereignty as a Service | Inline illustration, before the closing highlight box |
| `light-cta-bg.png` | Email capture section | Full-width background behind the CTA form |
| `light-bg-texture.png` | Entire page | Tileable body background at ~5% opacity |

### Dark Track (`/dark`)

| Image | Section | Placement |
|-------|---------|-----------|
| `dark-hero.png` | Top hero area | Full-width background, 15-20% opacity, behind Matrix rain |
| `dark-01-vulnerability.png` | Section 1: The Vulnerability | HUD-framed illustration with corner brackets, after opening paragraph |
| `dark-02-reversal.png` | Section 2: The Reversal | HUD-framed illustration, after the CAPTCHA history paragraph |
| `dark-03-protocol.png` | Section 3: The Protocol | HUD-framed illustration, beside or after ZKP spec |
| `dark-04-declaration.png` | Section 4: The Declaration | HUD-framed illustration, before the closing alert box |
| `dark-cta-bg.png` | Email capture section | Full-width background behind the CTA form |
| `dark-bg-texture.png` | Entire page | Tileable body background, mobile fallback for Matrix rain |

---

## Inner Pages — Image Needs

Inner pages need header images. These should be generated using the same style
as the track's section images, but sized as wide banners (2048x512).

### How It Works (`/{track}/how-it-works`)

| Track | Image | Description |
|-------|-------|-------------|
| Light | `light-how-it-works-header.png` | Abstract flowchart: four connected translucent nodes (Attest → Prove → Verify → Authorize) linked by golden arcs. Warm gradients, glassmorphism nodes. Wide banner format. Colors: gold (#FFD700), sky blue (#0288D1), warm white (#FFFDF7). |
| Dark | `dark-how-it-works-header.png` | Protocol state machine visualization: four green terminal nodes connected by pulsing data paths on black. Each node labeled with a phase number in Matrix green. HUD corner brackets framing the diagram. Colors: black (#050505), Matrix green (#00FF41). |
| Both | Inline diagrams | Consider SVG/CSS diagrams for the protocol flow rather than raster images — more interactive and sharp. |

### About / Mission (`/{track}/about`)

| Track | Image | Description |
|-------|-------|-------------|
| Light | `light-about-header.png` | Abstract warm composition: overlapping translucent circles representing community, with golden lattice connections. Feels like a constellation of trust. Colors: gold, ethereal blue, warm white. |
| Dark | `dark-about-header.png` | Dark manifesto header: a single geometric sigil or emblem (hexagonal, machine-precise) glowing green on black void. Feels like a seal on a classified document. Colors: black, Matrix green. |

### FAQ (`/{track}/faq`)

| Track | Image | Description |
|-------|-------|-------------|
| Light | No header image needed | FAQ is functional — rely on track design language (glassmorphism accordion cards) |
| Dark | No header image needed | FAQ is functional — rely on track design language (terminal-style Q&A blocks) |

### Whitepaper (`/{track}/whitepaper`)

| Track | Image | Description |
|-------|-------|-------------|
| Light | `light-whitepaper-cover.png` | Clean, academic cover image: abstract geometric lattice with golden accents, feels like the cover of a prestigious research publication. 1024x1024. |
| Dark | `dark-whitepaper-cover.png` | Classified document aesthetic: black background with faint green grid, a central hexagonal seal with "CLASSIFIED" connotation. Phosphor glow. 1024x1024. |
| Both | These double as thumbnail/preview images on the download page |

### Philosophy (`/{track}/philosophy`)

| Track | Image | Description |
|-------|-------|-------------|
| Light | `light-philosophy-header.png` | Abstract meditation on identity: soft gradient orbs that could be either human neurons or network nodes — deliberately ambiguous. Warm, contemplative. Wide banner. |
| Dark | `dark-philosophy-header.png` | Philosophical void: a single point of green light in vast blackness, with faint radiating geometric proofs/equations barely visible. Existential, vast. Wide banner. |

### Use Cases (`/{track}/use-cases`)

| Track | Image | Description |
|-------|-------|-------------|
| Light | No main header — use card icons | Each use case card gets a small icon (64x64). Use abstract geometric icons in gold/blue matching the track palette. Consider SVG for sharpness. |
| Dark | No main header — use card icons | Each use case card gets a small terminal-style icon (64x64). Green wireframe icons on dark backgrounds. Consider SVG. |

### Human vs Machine (`/{track}/human-vs-machine`)

| Track | Image | Description |
|-------|-------|-------------|
| Light | `light-hvm-header.png` | Two abstract forms reaching toward each other — one organic/warm (gold tones), one geometric/precise (blue tones) — nearly touching. Michelangelo's Creation of Adam reimagined as abstract shapes. Wide banner. |
| Dark | `dark-hvm-header.png` | Performance comparison visualization: split image — left half shows chaotic biological neural patterns in dim red/amber, right half shows clean computational circuits in bright green. The machine side is visibly superior. Wide banner. |

---

## OG / Social Images

| Image | Used for |
|-------|----------|
| `og-image.png` | Default social share card (split dark/light composition) |
| `og-dark.png` | Dark track pages social card |
| `og-light.png` | Light track pages social card |
| `favicon.svg` | Browser tab icon (split hexagon) |

---

## Usage Rules for Claude Code

1. **Landing page sections:** Images go inline using Next.js `<Image>` with priority loading for above-fold
2. **Inner page headers:** Full-width banner at top of page, 20-30% opacity, behind the page title
3. **Dark track framing:** All dark track images should be wrapped in HUD-style corner brackets (CSS pseudo-elements)
4. **Light track framing:** Light track images get subtle rounded corners (16px) and a faint glassmorphism border
5. **Responsive:** Use `srcSet` with 1x/2x versions. On mobile, header banners can be hidden or reduced to 30vh
6. **Performance:** All images lazy-loaded except hero/header. WebP with PNG fallback. Max 200KB per hero, 100KB per section
7. **Alt text:** Every image needs descriptive alt text for accessibility. Use the image descriptions from this file.

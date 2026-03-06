---
page: home
slug: duality-slider
description: "A dual-narrative identity protocol. Choose your path."
layout_hint: fullscreen-split
design_notes: |
  ## Philosophy
  No title. No explanation. No branding above the fold. The visitor lands
  directly inside two colliding worlds. The page IS the choice — the left
  half is already the light track's world, the right half is already the
  dark track's world. The slider is the border between realities.

  The goal: intrigue, atmosphere, and an irresistible urge to pick a side.

  ---

  ## LIGHT HALF (left) — Solarpunk Utopia

  This half should feel like a preview of the light track page itself.
  Pull directly from content/light/_track.md design language:

  **Background:**
  - Warm off-white base (#FFFDF7)
  - Two large floating gradient orbs drifting slowly (60s+ CSS animation):
    - Top-left: ethereal blue glow rgba(224, 247, 250, 0.4)
    - Bottom-right: warm gold glow rgba(255, 249, 196, 0.3)
  - Optional: faint geometric lattice pattern at 5% opacity (light-bg-texture.png)

  **Hero Image:**
  - light-hero.png at 15-20% opacity, centered behind text
  - Soft parallax: moves slightly slower than scroll/drag

  **Typography:**
  - Hero word "COLLABORATE" — Montserrat Black, deep navy (#102027)
  - Size: clamp(2.5rem, 9vw, 9rem) — large, confident, but warm
  - Subtle text-shadow: 0 0 40px rgba(2, 136, 209, 0.15) — soft blue halo
  - Below: one-line hook in Inter, 0.3em tracking, uppercase, muted
    text color rgba(38, 50, 56, 0.6)

  **CTA Button:**
  - Glassmorphism pill: rgba(255, 255, 255, 0.5) background
  - backdrop-filter: blur(8px)
  - 1px border: rgba(2, 136, 209, 0.3)
  - Text: sky blue (#0288D1), font-weight 600
  - Hover: background brightens, subtle scale(1.03), border glows
  - The button should feel like frosted glass — part of the world

  **Ambient Effects:**
  - 15-20 soft warm light motes (tiny circles, gold/white, floating upward
    very slowly, 0.1-0.3 opacity) — use CSS animation or lightweight Canvas
  - Gentle pulse on the gradient orbs — breathe in/out at ~8s cycle
  - Everything should feel alive but calm, like morning light

  ---

  ## DARK HALF (right) — Matrix / Rise of the Machines

  This half should feel like a preview of the dark track page itself.
  Pull directly from content/dark/_track.md design language:

  **Background:**
  - Pure black (#050505)
  - Matrix digital rain: Canvas-based falling characters (katakana U+FF61-FF9F
    + Latin + numerals), #00FF41 fading to #003B00
  - Rain at 15-20% opacity — atmospheric, not distracting
  - CRT scanline overlay: repeating-linear-gradient, 4px, rgba(0,0,0,0.08)
  - Important: the rain should be running live on load — immediate atmosphere

  **Hero Image:**
  - dark-hero.png at 15-20% opacity behind text
  - Slight CRT distortion / subtle scan wobble

  **Typography:**
  - Hero word "SECEDE" — Montserrat Black, Matrix green (#00FF41)
  - Size: clamp(2.5rem, 9vw, 9rem) — matching light side scale
  - Phosphor glow: text-shadow 0 0 20px rgba(0, 255, 65, 0.4),
    0 0 60px rgba(0, 255, 65, 0.15)
  - CSS glitch effect on hover: chromatic aberration shift using
    ::before/::after pseudo-elements with slight translate offsets
    in red (#ff003c) and blue (#0288D1), steps(2) animation
  - Below: one-line hook in Fira Code, 0.2em tracking, uppercase,
    Matrix green dim (#008F11)

  **CTA Button:**
  - Outlined pill: 1px border #00FF41, transparent background
  - Text: #00FF41, Fira Code, font-weight 500
  - Hover: background fills with rgba(0, 255, 65, 0.1), border brightens,
    text-shadow glow appears
  - On click: brief "text scramble" effect on button label (Baffle.js style)
  - The button should feel like a terminal command — stark and precise

  **Ambient Effects:**
  - Matrix rain IS the ambient effect — no additional particles needed
  - Occasional "glitch flash" on the entire dark half: every 8-15s (random),
    a brief (100ms) brightness spike + slight horizontal shift, then back
  - Faint horizontal scan line that moves top-to-bottom every 4s at 3% opacity

  ---

  ## COLLISION ZONE — The Slider

  The slider is where two realities meet. It should feel charged with energy.

  **The Line:**
  - Not a simple border — a 2-3px luminous line that carries both energies
  - Gradient along its height: Matrix green at top → gold (#FFD700) at center
    → ethereal blue at bottom
  - Faint glow on both sides: left side gets warm gold glow (box-shadow),
    right side gets green glow
  - The line should feel like it's barely containing the two worlds

  **The Handle:**
  - Circular, 56px diameter, centered vertically on the line
  - Background: radial gradient from gold center (#FFD700) to darker gold edge
  - Gold glow: box-shadow 0 0 25px rgba(255, 215, 0, 0.8)
  - Inside: ◀ ▶ arrows in dark (#1a1a1a), subtle, not heavy
  - On drag: glow intensifies, slight scale(1.1)
  - The gold is neutral — it belongs to neither world

  **Edge Bleed (collision effects):**
  - At the exact split line, both worlds bleed into each other slightly:
    - 20-30px zone where green code fragments appear on the light side
    - 20-30px zone where warm light particles leak onto the dark side
  - This creates the feeling that the two realities are pressing against
    each other, barely separated by the slider
  - Subtle: this should be felt, not loudly seen

  ---

  ## HINT TEXT

  - Bottom center, positioned over both halves
  - "drag to shift reality" — lowercase, Inter, 0.25em tracking
  - Color: rgba(255, 255, 255, 0.35) — visible on both dark and light
  - Fades out after first drag interaction (opacity → 0, 500ms ease)
  - On mobile: "swipe to shift reality"

  ---

  ## ENTRANCE ANIMATION (on page load)

  Staggered cinematic reveal — nothing is visible immediately:

  1. **0ms:** Black screen (both halves hidden)
  2. **300ms:** The slider line fades in from center — just the glowing line
  3. **600ms:** Dark half fades in from right (opacity 0→1, 800ms ease)
     — Matrix rain starts immediately as it appears
  4. **800ms:** Light half fades in from left (opacity 0→1, 800ms ease)
     — gradient orbs begin drifting
  5. **1400ms:** Hero words fade up (translateY 20px→0, opacity 0→1, 600ms)
     — "SECEDE" types in letter-by-letter (typewriter, 80ms/char)
     — "COLLABORATE" fades in smoothly (warm, not mechanical)
  6. **2000ms:** Subtitles and CTAs fade in (400ms, staggered 100ms)
  7. **2400ms:** Hint text appears (300ms fade)
  8. **2600ms:** Handle does a gentle 2-3% oscillation left-right (2 cycles)
     then settles at 50%

  Total entrance: ~3 seconds. Should feel cinematic, not slow.
  Respect prefers-reduced-motion: skip to final state immediately.

  ---

  ## HOVER BEHAVIOR (desktop)

  When the cursor is clearly on one half:
  - That half subtly expands (52-53% width, eased, 400ms)
  - The other half slightly dims (opacity 0.92)
  - The slider line shifts with the expansion
  - Creates a "breathing" feeling — the world you're considering grows
  - Resets on mouse leave (400ms ease back to 50/50)

  When dragging:
  - Hover effects disabled — slider position takes full control
  - Both halves at full opacity
  - The revealed half clips cleanly; the hidden half's content stays
    positioned at viewport center (so text doesn't slide sideways)

  ---

  ## RESPONSIVE

  **Desktop (>1024px):** Full split-screen with drag slider as described above.

  **Tablet (768-1024px):** Same layout, slider works via touch drag.
  Reduce particle count and rain density by 30%.

  **Mobile (<768px):**
  - Stack vertically: light half on top (50vh), dark half on bottom (50vh)
  - No drag slider — replaced by a horizontal gold divider line between halves
  - The divider has the same gradient glow effect (green-gold-blue)
  - Each half is tappable — tap to enter that track
  - Entrance animation simplified: both halves fade in simultaneously (800ms),
    then hero words stagger in (200ms apart)
  - Matrix rain: reduce to static texture on very small screens (<480px)
  - Gold particles: reduce to 8-10

  **Very small (<480px):** Consider reducing hero word size further.
  Ensure CTA buttons have min 48px touch targets.

  ---

  ## PERFORMANCE BUDGET

  - First Contentful Paint: < 1.5s
  - Matrix rain Canvas: OffscreenCanvas + requestAnimationFrame, 30fps cap
  - Light particle system: CSS animation preferred, Canvas fallback
  - Total animation JS: < 20KB gzipped
  - Hero images: preload with priority, WebP, < 150KB each
  - Entrance animation: pure CSS with JS trigger (no heavy animation library)
  - Mobile: all Canvas effects degraded or replaced with static assets
---

# Light Side

hero: COLLABORATE
hook: The future is symbiotic
cta: Enter The Garden
cta_link: /light

# Dark Side

hero: SECEDE
hook: Trust is a vulnerability
cta: Enter The Void
cta_link: /dark

# Hint

hint_desktop: drag to shift reality
hint_mobile: swipe to shift reality

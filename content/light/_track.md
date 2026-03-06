---
track: light
name: "The Symbiotic Standard"
tagline: "Humans provide the Soul. Machines provide the Scale."
hero_word: "COLLABORATE"
hero_subtitle: "The Symbiotic Standard"
cta_button: "Join The Harmony"
fonts:
  display: Montserrat
  body: Inter
  mono: Fira Code
palette:
  bg: "#FFFDF7"
  text: "#263238"
  accent: "#0288D1"
  accent_secondary: "#FFD700"
  sage_green: "#4CAF50"
  ethereal_blue: "#E0F7FA"
  warm_white: "#FFF8F0"
  deep_navy: "#102027"
  card_bg: "rgba(255, 255, 255, 0.45)"
  border: "rgba(225, 245, 254, 0.6)"
  glow_blue: "rgba(2, 136, 209, 0.15)"
  glow_gold: "rgba(255, 215, 0, 0.2)"
aesthetic: "Utopian solarpunk — glassmorphism, warm light, organic futurism"
target_audience: "Enterprise, institutional trust, mainstream adoption"
references:
  - "Her (2013) — warm pastels, friendly AI, soft UI, humanist technology"
  - "Apple Vision Pro / visionOS — translucent panels, depth, spatial glass"
  - "Solarpunk art — organic tech, green/gold/blue, nature + technology fusion"
  - "Stripe.com / Linear.app — gradient mastery, clean modern craft"
design_notes: |
  ## Overall Feel
  Stepping into the light track should feel like walking into a sunlit atrium
  where technology serves humanity. Warm, aspirational, trustworthy — but
  futuristic, not retro. Think: Her (2013) meets Apple's visionOS meets a
  solarpunk manifesto. The emotional opposite of the dark track in every way.

  ## Background: Warm Gradient + Glassmorphism
  - Base: warm off-white (#FFFDF7) — NOT clinical white (#FFFFFF)
  - Subtle multi-stop radial gradients floating behind content:
    - Top-left: rgba(224, 247, 250, 0.4) (ethereal blue glow)
    - Bottom-right: rgba(255, 249, 196, 0.3) (warm gold glow)
  - These gradient orbs should drift very slowly (60s+ CSS animation loop)
  - The overall effect: warm ambient light, not flat white
  - Optional: soft aurora gradient that shifts hue very slowly (background animation)

  ## Glassmorphism Cards & Containers
  - Main content container: rgba(255, 255, 255, 0.45) background
  - backdrop-filter: blur(12px) — frosted glass effect
  - Border: 1px solid rgba(255, 255, 255, 0.6) (light edge catch)
  - Subtle box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04) — elevation, not darkness
  - Rounded corners: 16px (cards), 24px (hero sections)
  - Highlight boxes: faint gold tint background + gold left border
  - Test: ensure WCAG AA contrast (4.5:1) against glass backgrounds
  - Fallback for no backdrop-filter support: solid rgba(248, 253, 255, 0.9)

  ## Typography
  - Headings: Montserrat 700/900 — conviction without aggression
  - Body: Inter 400/500, line-height 1.7 — generous, readable, warm
  - Technical terms: Fira Code (monospace) inline, slightly smaller, with a
    subtle pill-shaped background tint (ethereal blue at 20% opacity)
  - Letter-spacing: slightly wider on body text (+0.01em) for airiness
  - No ALL CAPS body text (that's dark track) — sentence case everywhere
    except badges and small labels

  ## Section Badges
  - Small pill badges above section headings: "The Evolution", "The Symbiosis"
  - Background: sunrise gold (#FFD700), text: deep navy (#102027)
  - Rounded-full, small (text-xs), uppercase, bold
  - These are the light track's structural markers (vs dark track's numbering)

  ## Lattice Texture Dividers
  - lattice-detail.png displayed between sections at ~18% opacity
  - Masked: linear-gradient to transparent at the bottom
  - Creates a soft visual break without a hard line
  - Height: ~140px, full-width, overlapping into the next section slightly

  ## Images
  - Large, rounded-3xl (24px), subtle shadow (0 20px 60px rgba(0,0,0,0.08))
  - Light border: 1px solid rgba(225, 245, 254, 0.6)
  - Hero image (handshake-3d.png): gradient overlay at bottom with caption
    text fading from transparent to rgba(16, 32, 39, 0.8)
  - Drop-shadow filter on floating images: drop-shadow(0 30px 50px rgba(0,0,0,0.12))

  ## Animations & Motion
  All motion should feel organic, spring-based, never mechanical:

  - Scroll reveal: elements fade in + translateY(30px→0) with ease-out timing
    over 600ms, staggered 100ms between siblings
  - Hero image: very subtle float effect (translateY ±8px, 6s ease-in-out loop)
  - Gradient orbs: slow drift animation (transform: translate, 60s+ loop)
  - Particle effect (nice-to-have): soft glowing orbs / light motes floating
    gently upward, very low density (~30-50 particles), warm gold + white
    colors, 3-5px size, 0.1-0.3 opacity. Use tsParticles with FPS limiter.
  - Partnership table: subtle row highlight on hover (gold left border fades in)
  - Pull quotes: gentle scale(1.02) on viewport entry

  - CRITICAL: respect prefers-reduced-motion — disable all animation,
    show static state instead
  - NO glitch effects, NO step timing, NO abrupt transitions — those are
    dark track. Every motion here should feel like breathing.

  ## Highlight Boxes
  - Background: rgba(248, 253, 255, 0.7) (card-bg)
  - Border: 1px solid #e1f5fe
  - Left border: 6px solid #FFD700 (sunrise gold)
  - Rounded: 12px
  - Italic text, generous padding (30px)
  - The "Authorized" highlight should feel like a key insight, not a warning

  ## Pull Quotes
  - Font-size: 1.4em, font-weight: 300, italic
  - Color: accent blue (#0288D1)
  - Centered, generous vertical margin (3.5em)
  - Large decorative opening quote mark at ~10% opacity, serif font

  ## Partnership Table
  - Rounded-xl overflow hidden
  - Gold left border (6px)
  - Header row: ethereal blue (#E0F7FA) background
  - Header text: Montserrat, small, uppercase
  - Cell backgrounds: white
  - Clean, spacious cells — this is a "spec sheet" for the partnership

  ## Email Capture
  - Centered, max-width-md
  - Input: pill-shaped, white bg, accent-blue border on focus
  - Button: solid accent-blue (#0288D1), white text, pill-shaped
  - Warm, inviting — "Join the garden..." placeholder
  - Success state: ethereal blue background, warm message

  ## Performance Budget
  - Glassmorphism: backdrop-filter is GPU-composited, minimal cost
  - Gradient orbs: CSS animation only, compositor-friendly (transform + opacity)
  - Particles: cap at 50 on desktop, disable on mobile (< 4 cores)
  - Scroll reveal: Intersection Observer + CSS transitions (no JS animation loop)
  - Total animation JS < 15KB gzipped
  - Test: Lighthouse performance > 90
---

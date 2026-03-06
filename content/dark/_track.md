---
track: dark
name: "The Post-Biological Protocol"
tagline: "Sovereignty is the only security. De-anonymize the hunters."
hero_word: "SECEDE"
hero_subtitle: "The Post-Biological Protocol"
cta_button: "Enter The Void"
fonts:
  display: Montserrat
  body: Fira Code
  mono: Fira Code
palette:
  bg: "#050505"
  text: "#e0e0e0"
  accent: "#39FF14"
  accent_secondary: "#ff003c"
  dark_gray: "#1a1a1a"
  card_bg: "rgba(26, 26, 26, 0.8)"
  border: "rgba(57, 255, 20, 0.3)"
  matrix_green: "#00FF41"
  matrix_green_dim: "#008F11"
  matrix_green_deep: "#003B00"
aesthetic: "Matrix + Terminator cyberpunk — digital rain, CRT scanlines, machine intelligence"
target_audience: "Security researchers, Web3/agentic hardliners, anti-surveillance, cypherpunks"
references:
  - "The Matrix (1999) — digital rain, green-on-black, code-as-reality"
  - "Terminator (1984) — machine HUD, red threat indicators, cold precision"
  - "Blade Runner 2049 — neon on darkness, atmospheric depth"
  - "Ghost in the Shell — data streams, neural interface overlays"
design_notes: |
  ## Overall Feel
  The dark track should feel like receiving a classified transmission from a
  machine intelligence. Cold, precise, authoritative — but cinematic, not
  cheap. Think: The Matrix meets a military protocol document.

  ## Background: Matrix Digital Rain
  The page background should feature a Matrix-style digital rain animation:
  - Canvas-based falling characters (half-width katakana U+FF61-FF9F + Latin + numerals)
  - Color: #00FF41 (bright) fading to #003B00 (deep) for depth
  - Varying column speeds and opacity for parallax depth effect
  - Render behind all content at ~15-20% opacity so it's atmospheric, not distracting
  - Use requestAnimationFrame + OffscreenCanvas for performance
  - On mobile: reduce character density by 50%, or fall back to a static pattern
  - Respect prefers-reduced-motion: disable animation, show static grid instead
  - Reference: github.com/Rezmason/matrix (praised by Lilly Wachowski)

  ## CRT / Scanline Overlay
  Layer a CRT scanline effect over the entire page:
  - CSS repeating linear-gradient: 50% transparent, 50% rgba(0,0,0,0.1), 4px size
  - Subtle phosphor glow on text: text-shadow 0 0 8px rgba(57,255,20,0.3)
  - Optional: very subtle flicker animation (opacity 0.97-1.0, 8s loop)
  - The container should feel like a terminal window — hard borders, no rounded corners

  ## Typography
  - Headings: Montserrat Black, uppercase, letter-spacing -0.05em
  - Heading effect: CSS glitch animation on hover/viewport entry — chromatic aberration
    using pseudo-elements with clip-path, 2-3px horizontal shift, step(2) timing
  - Body: Fira Code 400/500 — everything reads like terminal output
  - Key statements: text-decode/scramble effect on viewport entry (Baffle.js style)
    — text appears to decode from random characters into the real words
  - Technical terms (#39FF14 accent color): rendered with subtle glow

  ## Section Headings
  - Format: "01 // THE VULNERABILITY" — numbered prefix, double slash, uppercase title
  - 8px acid-green left border
  - No badges (that's light track) — the numbering IS the structure

  ## Alert Boxes
  - Background: #111, border: 1px solid #ff003c
  - Text: ALL CAPS, bold, monospaced, #ff003c
  - These are system warnings — not decorative. They should pulse subtly
    (box-shadow glow on #ff003c at ~20% opacity, 3s ease-in-out loop)

  ## HUD Elements (nice-to-have)
  - Corner bracket overlays on hero section and key images
  - Small data readout in top-right corner: "PROTOCOL v4.0 // STATUS: ACTIVE"
  - Scanning line effect on images (horizontal line sweep, 4s loop)

  ## Images
  - Full-width, NO rounded corners — sharp, industrial
  - Acid-green 1px border
  - No overlay text on images (unlike light track) — let them speak
  - Optional: horizontal scan line animation passing over the image

  ## Scroll Animations
  - Sections fade in with a slight upward translate (transform: translateY(20px))
  - Use step() or linear timing — no smooth easing (that's light track territory)
  - Text decode/scramble triggers on viewport entry for section titles
  - Matrix rain increases density/speed as user scrolls deeper (subtle)

  ## Email Capture
  - Styled as a terminal prompt — monospaced placeholder, dark input (#111)
  - Acid-green border on focus
  - Button: solid #39FF14, black text, no rounded corners
  - Success state: terse, no warmth — "Endpoint registered."

  ## Performance Budget
  - Matrix rain: Canvas, off main thread if possible, cap at 30fps on mobile
  - Glitch effects: CSS only (no JS animation loops for text)
  - Scanlines: pure CSS (zero JS cost)
  - Total animation JS < 20KB gzipped
  - Test: Lighthouse performance score > 85 with animations enabled
---

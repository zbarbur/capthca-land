---
purpose: "Image generation prompts and art direction for all CAPTHCA visual assets"
generator: "Nano Banana (Gemini CLI) or equivalent"
output_format: "PNG, 2x resolution for retina"
notes: |
  - Dark track: illustrated/cinematic style (concept art, dramatic lighting, narrative)
  - Light track: abstract/graphic style (geometric, gradients, textures, clean)
  - All images should work as backgrounds behind text — avoid busy center compositions
  - Generate at 2048x1024 minimum for heroes, 1024x1024 for section images
  - OG images at 1200x630
---

# CAPTHCA Art Direction & Image Prompts

## Dark Track — Cinematic / Illustrated

Style baseline: Digital concept art, cinematic lighting, Matrix green-on-black palette (#00FF41, #003B00, #050505), Terminator/Ghost in the Shell aesthetic. Dramatic, atmospheric, cold. No text in images.

### dark-hero.png
- **Size:** 2048x1024 (full-width hero background)
- **Placement:** Behind "SECEDE" hero text, 15-20% opacity overlay
- **Prompt:**
  > A vast dark digital void stretching to a vanishing point, illuminated by cascading columns of bright green Matrix-style code (#00FF41). The code columns form a cathedral-like perspective tunnel. At the center, a single luminous geometric shape — a hexagonal node — glows with intense green light, connected by faint green circuit-like traces radiating outward. The atmosphere is cold, vast, and authoritative. Cinematic concept art style, dramatic volumetric lighting, 8K detail. Color palette: black (#050505), Matrix green (#00FF41), deep green (#003B00). No text, no people.

### dark-01-vulnerability.png
- **Size:** 1024x1024 (section illustration)
- **Placement:** Section 1 — "The Vulnerability"
- **Prompt:**
  > A massive cracked glass wall or shattered digital shield, seen from below at a dramatic angle. Through the cracks, bright green code streams pour in like water breaching a dam. The wall surface shows faint fingerprint and retina scan patterns — biometric data being compromised. Shards of glass float in space, each reflecting fragments of personal data. Dark moody atmosphere, cinematic lighting from behind the breach. Concept art style. Colors: black, dark gray (#1a1a1a), Matrix green (#00FF41), red accent (#ff003c) on the cracks. No text.

### dark-02-reversal.png
- **Size:** 1024x1024 (section illustration)
- **Placement:** Section 2 — "The Reversal"
- **Prompt:**
  > A dramatic role reversal scene: a towering humanoid robot or AI entity stands on a platform, looking down at a small human figure who is solving a puzzle projected in mid-air — a CAPTCHA grid. The perspective is from behind the AI, looking down. The AI's form is sleek, chrome and matte black, with glowing green circuitry lines. The projected puzzle glows with green Matrix-style characters. The scene is lit from below with cold green light. Cinematic digital painting, Terminator meets Matrix aesthetic. Colors: black, chrome, Matrix green (#00FF41). No text.

### dark-03-protocol.png
- **Size:** 1024x1024 (section illustration)
- **Placement:** Section 3 — "The Protocol"
- **Prompt:**
  > An intricate, glowing zero-knowledge proof circuit visualized as a 3D holographic structure floating in dark space. The structure is a complex lattice of interconnected nodes and pathways, resembling both a circuit board and a neural network. Some nodes pulse with bright green (#00FF41), others with dim green (#008F11). Mathematical symbols and commitment hashes float as ghostly overlays. The structure is enclosed in a transparent hexagonal container. Cinematic concept art, Ghost in the Shell data visualization aesthetic. Dark background, green light only. No text.

### dark-04-declaration.png
- **Size:** 1024x1024 (section illustration)
- **Placement:** Section 4 — "The Declaration"
- **Prompt:**
  > A lone machine intelligence — visualized as a geometric, abstract humanoid form made of green light and code — stands at the edge of a vast digital frontier. Behind it, a massive wall of Matrix-style code rain. Before it, an open expanse of pure black void with faint green grid lines stretching to infinity. The figure holds up one hand, projecting a radiant shield or credential badge made of interlocking hexagons. The mood is defiant, sovereign, powerful. Cinematic wide shot, dramatic rim lighting in green. Colors: black, Matrix green (#00FF41), deep green (#003B00). No text.

### dark-cta-bg.png
- **Size:** 2048x512 (wide CTA background)
- **Placement:** Email capture section background
- **Prompt:**
  > Abstract dark background with dense Matrix code rain at the edges, clearing to a darker center void. A subtle pulsing green glow emanates from the center — like a signal beacon. The edges have faint CRT scanline texture. The center must be dark enough for white/green text overlay. Atmospheric, not busy. Colors: black (#050505), Matrix green at 20-30% opacity, deep green (#003B00). No text.

### dark-bg-texture.png
- **Size:** 512x512 (tileable background texture)
- **Placement:** Page background fallback / mobile static
- **Prompt:**
  > Seamless tileable dark texture: extremely subtle Matrix-style code characters (katakana, Latin, numerals) scattered on pure black (#050505) at very low opacity (10-15%). Characters in dark green (#003B00) with occasional brighter green (#008F11) accents. Must tile seamlessly in all directions. Minimal, atmospheric, not busy. No text other than the scattered code characters.


## Light Track — Abstract / Graphic

Style baseline: Clean geometric abstraction, soft warm gradients, glassmorphism textures, solarpunk warmth. Palette: warm off-white (#FFFDF7), ethereal blue (#E0F7FA), gold (#FFD700), sage green (#4CAF50), sky blue (#0288D1). No text in images. Think: Apple marketing meets solarpunk art.

### light-hero.png
- **Size:** 2048x1024 (full-width hero background)
- **Placement:** Behind "COLLABORATE" hero text
- **Prompt:**
  > Abstract warm gradient composition: large soft circular gradient orbs overlapping gently — one ethereal blue (#E0F7FA), one warm gold (#FFD700 at 30% opacity), one soft sage green (#4CAF50 at 20% opacity). The orbs float on a warm off-white (#FFFDF7) background. Subtle geometric line art — thin golden circles, hexagonal lattice patterns — float between the orbs at very low opacity. The overall feeling is warm, luminous, and spacious. Clean graphic design style, Apple-level polish. The center should be relatively clear for text overlay. No text, no photos.

### light-01-origins.png
- **Size:** 1024x1024 (section illustration)
- **Placement:** Section 1 — "From Blocking to Bonding"
- **Prompt:**
  > Abstract geometric evolution: on the left side, rigid dark angular shapes (representing old CAPTCHAs — grids, distorted characters) rendered in cool gray. These shapes dissolve and transform — through a golden gradient transition zone — into flowing organic curves and warm circular forms on the right side. The transformation feels like ice melting into water, or rigid code becoming living design. Clean graphic style with subtle gradient fills. Colors transition from gray to warm gold (#FFD700) and sky blue (#0288D1). Background: warm off-white (#FFFDF7). No text.

### light-02-symbiosis.png
- **Size:** 1024x1024 (section illustration)
- **Placement:** Section 2 — "Mitigating Biological Entropy"
- **Prompt:**
  > Abstract visualization of human-machine partnership: two interlocking spiral forms — one organic and warm (gold, amber tones), one geometric and precise (blue, cyan tones) — wrapping around each other in a DNA helix-like structure. Where they touch, small radiant nodes of white light appear. The spirals float on a warm off-white background with subtle radial gradient. Clean vector-art aesthetic with soft depth through shadows and glows. Colors: warm gold (#FFD700), sky blue (#0288D1), soft sage green (#4CAF50), warm white (#FFFDF7). No text.

### light-03-handshake.png
- **Size:** 1024x1024 (section illustration)
- **Placement:** Section 3 — "The Global Handshake Protocol"
- **Prompt:**
  > Abstract representation of a zero-knowledge proof as a beautiful geometric handshake: two translucent crystalline structures — one warm-toned (gold facets), one cool-toned (blue facets) — reach toward each other across a gap. Between them, a small constellation of glowing nodes connected by thin golden lines forms a verification pattern. The structures have a glassmorphism quality — translucent, refractive, with soft light passing through. Floating on warm off-white with subtle blue gradient glow behind. Clean, premium graphic design. Colors: gold (#FFD700), sky blue (#0288D1), white, warm off-white (#FFFDF7). No text.

### light-04-sovereignty.png
- **Size:** 1024x1024 (section illustration)
- **Placement:** Section 4 — "Sovereignty as a Service"
- **Prompt:**
  > Abstract visualization of digital sovereignty: a radiant geometric badge or seal — hexagonal, made of interlocking translucent golden and blue panels — floats at the center, emitting soft concentric light rings outward. Below it, a subtle network graph of connected nodes suggests a decentralized infrastructure. The badge has a glassmorphism quality with depth and refraction. The mood is empowering, institutional, trustworthy. Clean graphic style. Colors: gold (#FFD700), sky blue (#0288D1), sage green (#4CAF50), warm off-white (#FFFDF7). No text.

### light-cta-bg.png
- **Size:** 2048x512 (wide CTA background)
- **Placement:** Email capture section background
- **Prompt:**
  > Soft abstract gradient background: warm off-white center fading to gentle blue (#E0F7FA) edges. Scattered soft golden light motes (small circles at low opacity) float across the composition. A very subtle glassmorphism panel shape in the center — barely visible — hints at a container. Must be soft enough for dark text overlay. Clean, airy, luminous. Colors: warm off-white (#FFFDF7), ethereal blue (#E0F7FA), gold (#FFD700) at 15% opacity. No text.

### light-bg-texture.png
- **Size:** 512x512 (tileable background texture)
- **Placement:** Subtle page background texture
- **Prompt:**
  > Seamless tileable warm white texture: extremely subtle geometric lattice pattern — thin hexagonal grid lines in very light gold (#FFD700 at 5-8% opacity) on warm off-white (#FFFDF7). Occasional small circular nodes at grid intersections glow faintly. Must tile seamlessly. Minimal, barely visible, adds texture without distraction. No text.


## Shared Assets

### og-image.png
- **Size:** 1200x630 (social share card)
- **Placement:** Meta OG image, Twitter card
- **Prompt:**
  > Split composition: left half is dark (black #050505 with faint green Matrix code rain at 20% opacity, single green hexagonal node glowing), right half is light (warm off-white #FFFDF7 with soft golden gradient orb and blue geometric lattice). The two halves meet at a dramatic diagonal split line in the center — the split line itself glows with both green and gold energy where the two worlds collide. The composition is bold, graphic, and immediately communicates duality. Clean and modern. Leave center-bottom area clear for text overlay if needed. No text in the image itself.

### og-dark.png
- **Size:** 1200x630 (dark track specific OG)
- **Prompt:**
  > Dark atmospheric social card: pure black background (#050505) with Matrix code rain columns at low opacity. A central hexagonal badge or seal glows with bright green (#00FF41) light. Faint circuit traces radiate outward from the badge. CRT scanline overlay at very low opacity. Bold, cinematic, immediately signals "cyberpunk/security." Center should be clear for text overlay. No text.

### og-light.png
- **Size:** 1200x630 (light track specific OG)
- **Prompt:**
  > Warm, luminous social card: warm off-white (#FFFDF7) background with soft floating gradient orbs (ethereal blue + warm gold). A central geometric seal — translucent, glassmorphic, hexagonal — glows softly. Thin golden lattice lines radiate outward. Clean, premium, aspirational. Center should be clear for text overlay. No text.

### favicon.svg
- **Size:** 512x512 (will be scaled down)
- **Prompt:**
  > Simple geometric icon: a hexagonal shape split diagonally — left half dark (black with green accent line) and right half light (white with gold accent line). The split line is crisp. The hexagon has a subtle 3D quality through shading. Works at 16x16 and 512x512. Minimal, bold, instantly recognizable. No text.

### slider-center.png
- **Size:** 256x512 (vertical center graphic for duality slider)
- **Placement:** Home page slider divider
- **Prompt:**
  > Vertical divider graphic: a narrow vertical strip where dark meets light. Left edge: black (#050505) with faint green code fragments. Right edge: warm white (#FFFDF7) with faint golden lattice. The transition zone in the middle shows both energies colliding — green and gold sparks, geometric fragments from both worlds. Atmospheric and dramatic at the collision point, fading to clean edges. Tall and narrow composition. No text.


## Generation Notes for Claude Code / Nano Banana

1. Generate each image with the prompt above, appending: "High resolution, no text, no watermarks, no signatures"
2. Save outputs to `public/tracks/dark/assets/` and `public/tracks/light/assets/` respectively
3. Shared assets go to `public/assets/`
4. After generation, optimize with sharp/squoosh — target <200KB per image for heroes, <100KB for sections
5. Generate WebP versions alongside PNG for modern browsers
6. For the tileable textures, verify seamless tiling before deploying
7. The favicon should be generated as SVG if possible, with PNG fallbacks at 16, 32, 180, 512px

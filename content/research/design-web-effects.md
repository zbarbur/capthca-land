---
title: Web Implementation of Sci-Fi Visual Effects
subtitle: Code-ready references and performance guidance for Matrix rain, glitch, CRT, HUD, and particle effects
updated: 2026-03-06
---

# Web Implementation of Sci-Fi Visual Effects

A comprehensive guide to implementing Matrix digital rain, glitch effects, CRT scanlines, text decode animations, HUD overlays, and particle systems on the web. This research covers open-source implementations, performance optimization, and Next.js/React patterns.

## 1. Matrix Digital Rain (Canvas)

### Overview
The Matrix digital rain effect uses HTML5 Canvas with requestAnimationFrame to create falling characters that simulate the iconic visual from the films. This is a foundational effect for cyberpunk/tech aesthetics.

### Best Open-Source Implementations

**GitHub Resources:**
- [syropian/HTML5-Matrix-Code-Rain](https://github.com/syropian/HTML5-Matrix-Code-Rain) — Classic HTML5 Canvas implementation
- [mavidser/matrix-digital-rain](https://github.com/mavidser/matrix-digital-rain) — Vanilla JS Matrix code rain
- [TheKumaara/matrix-effect](https://github.com/TheKumaara/matrix-effect) — HTML5 Canvas and JavaScript version
- [tidwall/digitalrain](https://github.com/tidwall/digitalrain) — Go implementation for HTML5 Canvas (reference for architecture)

**CodePen Examples:**
- [Matrix rain animation by yaclive](https://codepen.io/yaclive/pen/EayLYO)
- [Matrix Digital Rain by mazleo](https://codepen.io/mazleo/pen/ERKaXa)
- [Matrix code rain by neilcarpenter](https://codepen.io/neilcarpenter/pen/DJopeR)

### Performance Optimization Techniques

#### RequestAnimationFrame + Off-Screen Canvas
```javascript
// Off-screen canvas reduces DOM repaints
const offscreenCanvas = new OffscreenCanvas(width, height);
const ctx = offscreenCanvas.getContext('2d');

function animate() {
  requestAnimationFrame(animate);

  // Render to off-screen canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, width, height);

  // Draw characters
  drawCharacters(ctx);

  // Blit to main canvas in single operation
  mainCtx.drawImage(offscreenCanvas, 0, 0);
}
```

#### GPU Acceleration Considerations
- **willReadFrequently**: Set to `false` in canvas context options to enable GPU acceleration, but avoid frequent `getImageData()` calls
- **OffscreenCanvas**: Available in Web Workers, fully detached from DOM synchronization, provides speed improvements
- **Hardware Limits**: Cannot guarantee GPU acceleration — Figma chose WebGL for this reason; consider graceful degradation

#### Character Density for Responsive Design
```javascript
// Adjust density based on viewport
function getCharacterDensity() {
  const viewport = Math.min(window.innerWidth, window.innerHeight);

  if (viewport < 768) return 0.5;     // Mobile: 50% density
  if (viewport < 1024) return 0.75;   // Tablet: 75% density
  return 1.0;                          // Desktop: 100% density
}
```

### Layering Without Blocking Interaction
```css
/* Canvas layer positioned absolutely, non-interactive */
canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;  /* Allow clicks to pass through */
  z-index: -1;           /* Behind content */
}
```

### React/Next.js Integration
Use `useRef` for canvas reference and `useEffect` cleanup:
```javascript
import { useEffect, useRef } from 'react';

export function MatrixRain() {
  const canvasRef = useRef(null);
  const frameIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let characters = [];

    const animate = () => {
      // Animation loop
      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: -1
      }}
    />
  );
}
```

---

## 2. Text Decode/Scramble Effect

### Overview
Text appears to decode from random characters into readable text. Common in hacker scenes and technical UIs. Creates sense of data loading or revelation.

### Recommended Libraries

**Baffle.js** - [camwiegert/baffle](https://camwiegert.github.io/baffle/)
- Lightweight, chainable API
- Methods: `obfuscate()`, `start()`, `reveal(duration, delay)`
- Works on text content (flattens child elements)
```javascript
const element = document.querySelector('.text');
const baffle = baffle(element)
  .start()
  .reveal(2000); // Reveal over 2 seconds
```

**Scramble.js** - [Scramble JavaScript Animation Library](https://scramble.js.org/)
- Modern, framework-agnostic
- Supports custom character sets
- Good documentation

**GSAP ScrambleText Plugin** - [GSAP ScrambleTextPlugin](https://gsap.com/docs/v3/Plugins/ScrambleTextPlugin/)
- Enterprise-grade, performance-optimized
- Part of GSAP ecosystem
- Integrates with GSAP timeline animations
```javascript
gsap.to('.text', {
  duration: 2,
  scrambleText: {
    text: 'Final decoded text',
    chars: '█░░░░░'
  }
});
```

**scrambling-letters** - [Recidvst/scrambling-letters](https://github.com/Recidvst/scrambling-letters)
- Lightweight, vanilla JS
- Nice decoding/scrambling effect
- Low dependencies

**scrambling-text-js** - [sogoagain/scrambling-text-js](https://github.com/sogoagain/scrambling-text-js)
- Simple, vanilla JavaScript implementation
- Minimal library size

### CSS-Only Approach (Limited)
```css
/* CSS animation with character replacement is limited */
/* Best for simple reveal effects, not character scrambling */
.decode-text {
  font-variant-numeric: tabular-nums;
}

@keyframes blink-caret {
  50% { border-right-color: transparent; }
}

.decode-text::after {
  content: '█';
  animation: blink-caret 1s infinite;
}
```

### Scroll/Viewport Trigger Pattern
```javascript
// Intersection Observer for scroll-triggered decode
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      baffle(entry.target).start().reveal(2000);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.decode-on-scroll').forEach(el => {
  observer.observe(el);
});
```

---

## 3. Glitch Effects

### Overview
Visual distortion that simulates digital corruption. Used for emphasis, state changes, or error states. Two approaches: CSS-based (text) and WebGL post-processing (full scene).

### CSS Glitch Text (Chromatic Aberration)

**Best CodePen References:**
- [CHROMATIC ABERRATION - text effect](https://codepen.io/thorthor/pen/WxapMz) — Pure CSS with animated shifts
- [CSS chromatic aberration text](https://codepen.io/brandoncash/pen/eYmMdjb) — Pseudo-element approach with mix-blend-mode
- [CSS Glitched Text](https://codepen.io/lbebber/pen/nqwBKK) — Analog/noisy effect with clip-path
- [31 CSS Glitch Effects](https://freefrontend.com/css-glitch-effects/) — Comprehensive collection

**Technique: Multi-Layer Text Shadow**
```css
.glitch {
  position: relative;
  color: #00ff00;
  text-shadow:
    -2px 0 #ff00ff,
    2px 0 #00ffff;
  animation: glitch 0.2s infinite;
}

@keyframes glitch {
  0% {
    text-shadow:
      -2px 0 #ff00ff,
      2px 0 #00ffff;
  }
  50% {
    text-shadow:
      2px 0 #ff00ff,
      -2px 0 #00ffff;
  }
  100% {
    text-shadow:
      -2px 0 #ff00ff,
      2px 0 #00ffff;
  }
}
```

**Technique: Pseudo-Element Slicing with clip-path**
```css
.glitch-text {
  position: relative;
  color: #0ff;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-glitch);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.glitch-text::before {
  animation: glitch-before 0.3s infinite;
  color: #f0f;
  z-index: -1;
  text-shadow: -2px 0 #0ff;
}

.glitch-text::after {
  animation: glitch-after 0.3s infinite;
  color: #0f0;
  z-index: -2;
  text-shadow: 2px 0 #f0f;
}

@keyframes glitch-before {
  0% { clip-path: inset(0 0 65% 0); transform: translate(-3px, -3px); }
  50% { clip-path: inset(28% 0 0 0); transform: translate(3px, 3px); }
  100% { clip-path: inset(0 0 58% 0); transform: translate(0, 0); }
}

@keyframes glitch-after {
  0% { clip-path: inset(35% 0 0 0); transform: translate(3px, 2px); }
  50% { clip-path: inset(0 0 0 85%); transform: translate(-3px, -2px); }
  100% { clip-path: inset(45% 0 0 0); transform: translate(0, 0); }
}
```

### WebGL Glitch Post-Processing (Three.js)

**Three.js EffectComposer Approach:**
- Official example: [webgl_postprocessing_glitch](https://threejs.org/examples/webgl_postprocessing_glitch.html)
- [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) — Alternative post-processing library

```javascript
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const glitchPass = new GlitchPass(512);
glitchPass.goWild = false; // Control intensity
composer.addPass(glitchPass);

// In animation loop
composer.render();
```

### Subtle vs. Heavy Glitch
- **Subtle**: Small 1-2px shifts, low opacity ghosts, triggered on hover/interaction
- **Heavy**: Large clip-path slices, rapid color flashing, continuous animation
- **Best Practice**: Use subtle glitch for permanent UI elements, heavy for error states or call-to-action emphasis

---

## 4. CRT / Scanline Overlays

### Overview
Simulates vintage CRT monitor aesthetic with horizontal scanlines, phosphor glow, and optional curvature. Pure CSS or minimal JavaScript.

### Pure CSS Scanline Effect

**Basic Repeating Gradient Technique:**
```css
.crt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 2px,
    transparent 2px,
    transparent 4px
  );
  z-index: 999;
}
```

**Animated Scanline (Downward Drift):**
```css
.crt-overlay {
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 2px,
    transparent 2px,
    transparent 4px
  );
  animation: scanlines 8s linear infinite;
  background-size: 100% 8px;
  background-position: 0 0;
}

@keyframes scanlines {
  0% { background-position: 0 0; }
  100% { background-position: 0 8px; }
}
```

### Phosphor Glow Effect

**Text Glow (Neon Aura):**
```css
.crt-text {
  color: #00ff00;
  text-shadow:
    0 0 5px #00ff00,
    0 0 10px #00ff00,
    0 0 20px #00ff00,
    0 0 30px #00ff00,
    0 0 40px #00ff00;
  font-weight: bold;
  letter-spacing: 2px;
}
```

**Screen Phosphor Overlay (Tinted Vignette):**
```css
.crt-vignette {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
  z-index: 998;
}
```

### CRT Curvature with CSS Perspective

```css
.crt-container {
  perspective: 2000px;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.8),
              inset 0 0 30px rgba(0, 0, 0, 0.5);
}

.crt-screen {
  transform: rotateX(3deg) rotateY(5deg);
  transform-style: preserve-3d;
  border-radius: inherit;
}

/* Bezel effect */
.crt-bezel {
  position: absolute;
  inset: 0;
  border: 20px solid #333;
  border-radius: 30px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
  pointer-events: none;
}
```

### Flicker Animation (Subtle Opacity)

```css
.crt-flicker {
  animation: flicker 0.15s infinite;
}

@keyframes flicker {
  0% { opacity: 1; }
  19% { opacity: 0.98; }
  20% { opacity: 0.97; }
  24% { opacity: 1; }
  25% { opacity: 0.98; }
  54% { opacity: 1; }
  55% { opacity: 0.98; }
  56% { opacity: 0.97; }
  100% { opacity: 1; }
}
```

### Reference Implementation: Afterglow CRT

**[HauntedCrusader/afterglow-crt](https://github.com/HauntedCrusader/afterglow-crt)** — Pure CSS CRT monitor overlay with:
- Scanlines with repeating linear-gradient
- Curved glass with border-radius + perspective
- Phosphor glow on text
- No Canvas or WebGL required

### Enhanced CAPTHCA Dark Track CRT

The current CAPTHCA dark track has basic scanlines. To enhance:

```css
/* Add phosphor color separation */
.enhanced-crt-text {
  color: #00ff00;
  text-shadow:
    -1px 0 #ff00ff, /* Magenta offset */
    1px 0 #00ffff;  /* Cyan offset */
}

/* Increase scanline intensity on hover */
.crt-overlay:hover {
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.25) 0px,
    rgba(0, 0, 0, 0.25) 2px,
    transparent 2px,
    transparent 4px
  );
}

/* Add subtle interlace effect */
@supports (background-blend-mode: screen) {
  .crt-screen {
    background-blend-mode: screen;
  }
}
```

---

## 5. HUD Elements (Heads-Up Display)

### Overview
Sci-fi interface overlays with corner brackets, data readout animations, targeting reticles, and diagnostic progress indicators.

### Corner Bracket Overlays

**CSS Border Trick:**
```css
.hud-corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #00ff00;
}

/* Top-left */
.hud-corner.tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  box-shadow: inset 3px 3px 0 rgba(0, 255, 0, 0.5);
}

/* Top-right */
.hud-corner.tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

/* Bottom-left */
.hud-corner.bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

/* Bottom-right */
.hud-corner.br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}
```

**Canvas 2D Corner Brackets with Glow:**
```javascript
function drawHUDCorner(ctx, x, y, size, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // Enable glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Draw corner bracket
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.stroke();

  ctx.shadowBlur = 0;
}
```

### Data Readout Animations

**Counting Numbers (Tally):**
```javascript
function animateNumber(element, start, end, duration = 1000) {
  const startTime = Date.now();

  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(start + (end - start) * progress);

    element.textContent = current.toString().padStart(6, '0');

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// Usage
animateNumber(document.querySelector('.readout'), 0, 9999);
```

**Scrolling Stats Display:**
```css
.readout-scroll {
  overflow: hidden;
  height: 1.2em;
  font-family: 'Courier New', monospace;
}

.readout-scroll-item {
  animation: scroll-up 2s ease-in-out forwards;
}

@keyframes scroll-up {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-1.2em); opacity: 0; }
}
```

### Targeting/Scanning Lines

```css
.targeting-reticle {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 2px solid #00ff00;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ff00;
}

.targeting-inner-lines {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  transform: translate(-50%, -50%);
  border: 2px solid #00ff00;
  border-radius: 50%;
  animation: pulse-reticle 1.5s ease-in-out infinite;
}

.targeting-scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    #00ff00,
    transparent
  );
  animation: scan-horizontal 3s linear infinite;
}

@keyframes scan-horizontal {
  0% { transform: translateY(-50px); }
  100% { transform: translateY(50px); }
}

@keyframes pulse-reticle {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(0.8); }
}
```

### Progress Indicators (Diagnostic Style)

```css
.diagnostic-progress {
  display: flex;
  gap: 4px;
  height: 8px;
}

.diagnostic-segment {
  flex: 1;
  background: #1a1a1a;
  border: 1px solid #00ff00;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
  transition: background 0.3s ease;
}

.diagnostic-segment.filled {
  background: #00ff00;
  box-shadow: 0 0 10px #00ff00, inset 0 0 5px rgba(0, 255, 0, 0.3);
}
```

---

## 6. Particle Systems

### Overview
Lightweight 2D particle effects: floating data points, character rain variations, explosion effects, and ambient movement.

### tsParticles (Recommended)

**[tsParticles — JavaScript Particles Library](https://particles.js.org/)**

Performance-optimized particle engine with:
- Frame rate limiter (default 120fps, configurable to 60 for mobile)
- Native emoji support (more performant than custom shapes)
- Trail effects with semitransparent overdraw
- React/Vue/Angular/Svelte components available

**Installation:**
```bash
npm install tsparticles tsparticles-engine
```

**React Integration:**
```javascript
import { Particles } from 'react-tsparticles';
import type { Engine } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';

export function ParticleBackground() {
  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  return (
    <Particles
      init={particlesInit}
      options={{
        background: {
          color: '#000'
        },
        particles: {
          number: { value: 80 },
          color: { value: '#00ff00' },
          shape: { type: 'char', character: { value: '█' } },
          opacity: { value: 0.5 },
          move: {
            enable: true,
            speed: { min: 1, max: 2 },
            direction: 'bottom'
          }
        },
        fpsLimit: 60
      }}
    />
  );
}
```

### Alternative: Lightweight sparticles

**[simeydotme/sparticles](https://github.com/simeydotme/sparticles)** — Lightweight Canvas particle system

Features:
- Fast, high-performance
- Minimal dependencies
- Good for floating effect variations

### Performance Budget for Landing Pages

**Target Metrics:**
- 60fps on desktop (or 120fps if hardware supports)
- 30-40fps acceptable on mobile (not 60fps)
- CPU usage < 15% sustained
- GPU memory < 100MB

**Configuration Guidelines:**
```javascript
// Desktop
const desktopParticles = {
  count: 200,
  fpsLimit: 120,
  speed: { min: 1, max: 3 }
};

// Mobile
const mobileParticles = {
  count: 40,
  fpsLimit: 30,
  speed: { min: 0.5, max: 1.5 }
};

// Tablet
const tabletParticles = {
  count: 100,
  fpsLimit: 60,
  speed: { min: 1, max: 2 }
};

const config = window.innerWidth < 768 ? mobileParticles
             : window.innerWidth < 1024 ? tabletParticles
             : desktopParticles;
```

### Combining with Scroll-Driven Animation

```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Particle speed responds to scroll
ScrollTrigger.create({
  onUpdate: (self) => {
    // Increase particle speed during scroll
    const velocity = self.getVelocity() / 300;
    particles.speed = 1 + Math.abs(velocity);
  }
});
```

---

## 7. Performance Guidelines

### Animation Budget for Next.js Landing Pages

**Frame Budget: 60fps = 16.67ms per frame**

Time allocation:
- **6ms**: JavaScript execution
- **6ms**: Layout + Paint
- **4ms**: Composite + Render
- **0.67ms**: Buffer/margin

**Disable heavy effects on:**
- Mobile devices (fallback to 30-40fps budget)
- Low-end devices (prefers-reduced-motion)
- Battery saver mode
- When other heavy operations are running

### Compositor-Friendly Properties

**Use these for animations:**
```css
/* Good: Composited (no repaint) */
transform: translateX(100px);
transform: scaleX(1.2);
transform: rotateZ(45deg);
opacity: 0.5;
filter: blur(5px);

/* Avoid: Triggers repaint */
left: 100px;
width: 200px;
height: 100px;
background-color: blue;
border: 1px solid red;
```

### will-change and transform-gpu

```css
/* For animated elements, add will-change */
.animated-element {
  will-change: transform, opacity;
}

/* Remove after animation ends to conserve memory */
.animated-element.finished {
  will-change: auto;
}

/* GPU acceleration hint */
.needs-gpu {
  transform: translateZ(0); /* Promotes to GPU layer */
}
```

### requestAnimationFrame vs CSS Animation vs Web Animation API

**requestAnimationFrame (Canvas, Custom)**
- Use for: Canvas rendering, complex synchronized animations, particle systems
- Control: Full frame-by-frame control
- Performance: Depends on implementation; can hog CPU if inefficient
- Cost: Must manage cleanup and cancellation

```javascript
let animationId = requestAnimationFrame(animate);
// Cleanup required:
cancelAnimationFrame(animationId);
```

**CSS Animation (Preferred for simple effects)**
- Use for: Simple keyframe sequences, text decode, scanlines, glitch
- Control: Limited to CSS properties
- Performance: Browser optimizes, runs on GPU when possible
- Cost: Zero JavaScript overhead

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.element {
  animation: fadeIn 0.5s ease-in-out;
}
```

**Web Animation API (Modern, Best Middle Ground)**
- Use for: Scroll-triggered, interactive, or scripted animations
- Control: Fine-grained JavaScript control with CSS performance
- Performance: Optimized like CSS, with JavaScript flexibility
- Cost: Slightly higher than CSS, lower than rAF

```javascript
const animation = element.animate(
  [{ opacity: 0 }, { opacity: 1 }],
  { duration: 500, easing: 'ease-in-out' }
);

// Can pause, seek, reverse
animation.pause();
animation.currentTime = 250;
```

### Accessibility: prefers-reduced-motion

**Always respect user motion preferences:**

```css
/* Default: animations enabled */
.element {
  animation: slideIn 0.5s ease-out;
}

/* Respect accessibility preference */
@media (prefers-reduced-motion: reduce) {
  .element {
    animation: none;
    opacity: 1;
  }

  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**JavaScript Detection:**
```javascript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (!prefersReducedMotion) {
  // Initialize heavy animations
  initParticles();
  initMatrixRain();
} else {
  // Fallback to static or minimal animation
  showStaticVersion();
}
```

**Best Practices:**
- Don't remove all motion (feels broken)
- Replace with subtle alternatives: fade-in, color-change, dissolve
- Disable auto-playing animations
- Keep scroll animations (they respect user pacing)

### Mobile Performance: When to Disable Effects

**Disable on:**
- `window.innerWidth < 768` (most mobile devices)
- `navigator.deviceMemory < 4` (low-end devices)
- `navigator.hardwareConcurrency < 4` (limited CPU cores)
- Battery saver mode detected
- Viewport has low-end GPU

**Detection Pattern:**
```javascript
function shouldDisableEffects() {
  const isMobile = window.innerWidth < 768;
  const lowMemory = navigator.deviceMemory < 4;
  const lowCPU = navigator.hardwareConcurrency < 4;
  const batteryMode = navigator.getBattery?.() // Deprecated but shows pattern
    .then(battery => battery.level < 0.2);

  return isMobile || lowMemory || lowCPU;
}

if (!shouldDisableEffects()) {
  initHeavyEffects();
}
```

---

## 8. Recommended Library Stack for CAPTHCA

Based on research, here's the optimal stack for your sci-fi landing page:

**Core Effects:**
- **Matrix Rain**: Custom Canvas + OffscreenCanvas + requestAnimationFrame
- **Text Decode**: Baffle.js or GSAP ScrambleText
- **Glitch**: Pure CSS (text), Three.js + EffectComposer (full scene)
- **CRT Scanlines**: Pure CSS (repeating-linear-gradient)
- **HUD Elements**: CSS + Canvas hybrid
- **Particles**: tsParticles (React component available)

**Build Config:**
- Next.js 14 App Router (already in use)
- CSS Modules for scoped styling
- Dynamic imports for heavy 3D/Three.js
- Framer Motion for scroll-driven animations (complements tsParticles)

**Performance Monitoring:**
- Lighthouse CI in deployment pipeline
- Web Vitals tracking (LCP, FID, CLS)
- Custom performance metrics for animation budget
- Mobile device testing with Chrome DevTools throttling

---

## 9. Key Resources

### GitHub Projects
- [Afterglow CRT](https://github.com/HauntedCrusader/afterglow-crt) — Pure CSS CRT effects
- [tsParticles](https://github.com/tsparticles/tsparticles) — Particle engine
- [postprocessing](https://github.com/pmndrs/postprocessing) — Three.js post-processing
- [Matrix Digital Rain implementations](https://github.com/topics/matrix-rain)

### Live Examples
- [CodePen: CSS Glitch Effects](https://freefrontend.com/css-glitch-effects/)
- [CodePen: Chromatic Aberration](https://codepen.io/thorthor/pen/WxapMz)
- [CodePen: Matrix Rain Animations](https://codepen.io/yaclive/pen/EayLYO)
- [Three.js WebGL Postprocessing Glitch](https://threejs.org/examples/webgl_postprocessing_glitch.html)

### Documentation
- [MDN: Canvas API Optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [MDN: OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [web.dev: Canvas Performance](https://web.dev/canvas-performance/)
- [web.dev: OffscreenCanvas Speed-Up](https://web.dev/articles/offscreen-canvas)
- [CSS-Tricks: Intersection Observer API](https://css-tricks.com/using-intersection-observer-api/)
- [CSS-Tricks: Animating with clip-path](https://css-tricks.com/animating-with-clip-path/)

### Performance Articles
- [Chrome Developers: GPU Acceleration in 2D Canvas](https://developer.chrome.com/blog/taking-advantage-of-gpu-acceleration-in-the-2d-canvas/)
- [DEV Community: Canvas Animation with requestAnimationFrame in React](https://dev.to/ptifur/animation-with-canvas-and-requestanimationframe-in-react-5ccj)
- [Smashing Magazine: Respecting Motion Preferences](https://www.smashingmagazine.com/2021/10/respecting-users-motion-preferences/)
- [Medium: Canvas Performance Optimization](https://layonez.medium.com/performant-animations-with-requestanimationframe-and-react-hooks-99a32c5c9fbf)

---

## Summary: Implementation Priorities

1. **Quick Wins** (CSS-based, no performance cost):
   - CRT scanlines and glow
   - Glitch text effects
   - HUD corner brackets
   - Particle background (tsParticles with conservative count)

2. **Medium Effort** (Requires library):
   - Matrix digital rain (Canvas)
   - Text decode (Baffle.js)
   - Scroll-triggered animations (Intersection Observer)

3. **Advanced** (3D/Shader-based, conditional rendering):
   - Full-scene glitch post-processing (Three.js)
   - WebGL particle effects
   - Complex 3D HUD overlays

4. **Always Implement**:
   - `prefers-reduced-motion` media query
   - Device detection for effect disabling
   - Performance monitoring
   - Off-screen canvas or requestAnimationFrame throttling for raster effects

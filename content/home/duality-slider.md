---
page: home
slug: duality-slider
title: "CAPTHCA — Identity is a Choice"
description: "A dual-narrative identity protocol. Choose your path: Symbiotic Standard or Post-Biological Protocol."
layout_hint: fullscreen-split
design_notes: |
  The slider is the first impression. It must communicate three things
  instantly: (1) there are two opposing worldviews, (2) you can explore
  both, (3) you must choose.

  LIGHT SIDE (left):
  - Background: white → ethereal-blue gradient (135deg)
  - Hero word "COLLABORATE" in deep navy, Montserrat Black
  - helix-hero.png at 20% opacity behind the text
  - CTA button: solid accent-blue (#0288D1), white text, pill shape
  - Feel: open, inviting, warm

  DARK SIDE (right):
  - Background: solid #050505
  - Hero word "SECEDE" in acid-green, Montserrat Black
  - helix-hero.png (dark version) at 20% opacity
  - CTA button: solid acid-green, black text, pill shape
  - Feel: stark, precise, cold

  SLIDER HANDLE:
  - Gold (#FFD700) vertical line with circular drag handle
  - Handle has a glow effect (box-shadow with gold at 80% opacity)
  - Arrows (◀ ▶) inside the handle
  - The gold is neutral territory — it belongs to neither side

  HINT TEXT:
  - "Slide to change perspective" at bottom center
  - White, 50% opacity, uppercase, tiny tracking
  - Fades out after first interaction (nice-to-have)

  RESPONSIVE:
  - On mobile, the slider still works via touch drag
  - Consider: on very small screens (<480px), stack vertically with
    a tap-to-choose instead of drag? Flag for Claude Code to evaluate.

  ANIMATION (nice-to-have):
  - On first load, the slider gently oscillates 2-3% in each direction
    to hint at interactivity, then stops after 2 seconds.
---

# Light Side

hero: COLLABORATE
subtitle: The Symbiotic Standard
cta: Join The Harmony
cta_link: /light

# Dark Side

hero: SECEDE
subtitle: The Post-Biological Protocol
cta: Enter The Void
cta_link: /dark

# Hint

hint: Slide to change perspective

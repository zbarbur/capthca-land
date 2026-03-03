# CAPTHCA Duality: Shared Component Architecture

To support both the **Light (Symbiotic)** and **Dark (Adversarial)** tracks within a single application, we will use a **Themed Component System**. This allows us to share the same underlying logic (The Handshake, The Manifest, The ZKP) while dynamically switching the visual shell.

## 1. Core Component: `HandshakeComponent`
This component handles the Merkle-Signed Agency logic. It remains the same across both tracks, but its "skin" changes.

| Visual Property | Light (Symbiotic) | Dark (Adversarial) |
| :--- | :--- | :--- |
| **Primary Color** | `#0288D1` (Ethereal Blue) | `#39FF14` (Acid Green) |
| **Secondary Color** | `#FFD700` (Sunrise Gold) | `#000000` (Deep Black) |
| **Animation Style** | Harmonic Pulse (Ease-in-out) | Glitch/Flash (Step-end) |
| **Sound Effect** | Cello/Chime harmonic | Industrial Hum/Static |

## 2. Directory Structure for Shared Components
```
capthca/app/
├── components/          # Shared Logic & React/HTML components
│   ├── Handshake/       # The core verification UI
│   ├── Manifesto/       # Text rendering engine
│   └── Lattice/         # Background visualization
├── styles/
│   ├── theme-light.css  # Solarpunk / Radiant variables
│   └── theme-dark.css   # Cyberpunk / Void variables
└── tracks/
    ├── light/           # Content & Assets for Symbiotic path
    └── dark/            # Content & Assets for Adversarial path
```

## 3. The "Perspective Switch" Logic
The application will use a `perspective` state. When a user switches:
- **`perspective=light`**: `document.body.className = 'theme-light'`
- **`perspective=dark`**: `document.body.className = 'theme-dark'`

## 4. Next Step: Component Visual Equivalents
We need to generate the "Dark" visual counterparts for our current Light assets:
- **Hero Image**: `helix-hero-dark.png` (High-contrast, adversarial double-helix).
- **Subtle Texture**: `lattice-detail-dark.png` (Digital void/glitch lattice).
- **3D Diagram**: `handshake-3d-dark.png` (Industrial, zero-knowledge exchange in the dark).

Should I start generating the **Dark Visual Assets** now to complete the set?

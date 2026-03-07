---
purpose: "Visual inventory and specs for both CAPTHCA documents (business whitepaper + academic paper)"
---

# CAPTHCA Document Visual Specs

## Business Whitepaper (10-15 pages)

### Page-by-page visual plan:

**Page 1 — Cover**
- Full-page branded cover
- CAPTHCA logo/wordmark centered
- Title: "CAPTHCA: Reimagining Identity for the Agent Economy"
- Subtitle: "Business Whitepaper — March 2026"
- Background: abstract geometric split (dark/light duality motif)
- Nano Banana prompt for cover image

**Page 2 — Executive Summary**
- Pull quote callout box
- Small "key numbers" sidebar: 68% breach rate, 88-byte proofs, $464B market

**Page 3-4 — The Problem**
- **Chart 1: Breach Cause Breakdown** — Donut/pie chart showing 68% human element, remaining split between malware, vulnerabilities, etc. Source: Verizon DBIR 2024
- **Chart 2: AI Phishing Effectiveness** — Bar chart: 54% AI-generated vs 12% human-written click rates
- **Infographic: The CAPTCHA Timeline** — Horizontal timeline: 2003 (CAPTCHA coined) → 2009 (Google acquires reCAPTCHA) → 2018 (v3 behavioral) → 2022 (Turnstile) → 2025 (Private Access Tokens) → 2026 (CAPTHCA)

**Page 5-6 — The Solution**
- **Diagram 1: CAPTHCA Protocol Overview** — High-level 4-phase flow diagram:
  Registration → Selective Disclosure → Verification → Revocation
  Clean, branded, with icons for each phase
- **Diagram 2: Before/After Comparison** — Split visual showing legacy identity (passwords, biometrics, CAPTCHAs) vs CAPTHCA (ZKP credentials, anonymous agency, cryptographic proof)

**Page 7-8 — How It Works**
- **Diagram 3: Credential Lifecycle** — Detailed flow: Issuer creates credential → Agent receives Merkle tree → Agent generates ZK proof → Verifier checks proof → Revocation if needed
  Show the Sparse Merkle Tree structure visually
- **Diagram 4: Zero-Knowledge Handshake** — Sequence diagram: Agent ↔ Verifier interaction showing what's revealed (authorized: yes) vs what's hidden (identity, logic, intent)

**Page 9 — Market Opportunity**
- **Chart 3: Confidential Computing Market** — Line/area chart: $24B (2024) → $464B (2030), 1,835% growth
- **Chart 4: Agent Adoption vs Governance** — Stacked bar: 80% deploy agents, only 21% have governance
- **Chart 5: Fortune 500 AI Agent Deployment** — Growth curve showing acceleration

**Page 10 — Use Cases**
- **Grid of 4-6 use case cards** with icons:
  - Enterprise API Auth (lock icon)
  - Healthcare Privacy (shield icon)
  - Financial Compliance (chart icon)
  - AI Agent Marketplaces (robot icon)
  - Content Provenance (document icon)
  - Voting & Governance (ballot icon)

**Page 11 — Case Study: Moltbook**
- **Infographic: Moltbook Breach** — Key stats visualization:
  - 1.5M credentials exposed
  - 88:1 bot-to-human ratio
  - 17K operators affected
  - Timeline of the breach
- "How CAPTHCA prevents this" callout box

**Page 12-13 — Competitive Landscape**
- **Table/Matrix: Feature Comparison** — CAPTHCA vs reCAPTCHA v3 vs Turnstile vs Private Access Tokens vs Web3 DID
  Columns: Privacy, Scalability, Agent Support, Decentralization, ZKP-based

**Page 14 — Roadmap**
- **Timeline diagram:** Phase 1 (Protocol spec) → Phase 2 (Reference implementation) → Phase 3 (Testnet) → Phase 4 (Mainnet) → Phase 5 (Enterprise partnerships)

**Page 15 — Back Cover / CTA**
- Contact info, website, QR code
- "Download the full academic paper for technical details"

---

## Academic Paper (30-40 pages)

### Visual plan:

**Cover page**
- Clean academic cover: title, authors, date, abstract
- Subtle geometric pattern background (not flashy)

**Section 2: Background**
- **Figure 1: CAPTCHA Evolution Timeline** — Same as whitepaper but more detailed, includes technical milestones
- **Figure 2: Identity Protocol Landscape** — Comparison matrix of PKI, OAuth2, SAML, ABC systems, CAPTHCA

**Section 4: Protocol Architecture**
- **Figure 3: Protocol State Machine** — Formal state diagram with states (Unregistered → Registered → Active → Disclosed → Verified → Revoked) and transitions
- **Figure 4: Four-Phase Protocol Flow** — Detailed sequence diagram with cryptographic operations labeled
- **Figure 5: Registration Phase Detail** — Zoomed-in view of issuer-agent interaction during credential creation

**Section 5: Cryptographic Primitives**
- **Figure 6: Proof System Comparison** — Table/chart: Groth16 vs PLONK vs zk-STARKs (proof size, verify time, setup, post-quantum)
- **Figure 7: Poseidon Hash Structure** — Internal round structure diagram

**Section 6: ZK Proof Circuits**
- **Figure 8: ProveCapability Circuit** — Circuit diagram showing input wires, gates, output
- **Figure 9: ProveNotRevoked Circuit** — Merkle path verification circuit diagram

**Section 7: Merkle Credential System**
- **Figure 10: Sparse Merkle Tree Structure** — Tree diagram with highlighted path showing selective disclosure
- **Figure 11: Credential Tree Layout** — Three-level structure (identity → capabilities → metadata)

**Section 8: Privacy Layer**
- **Figure 12: Differential Privacy Mechanism** — Before/after behavioral fingerprint with noise injection
- **Figure 13: Privacy Budget Composition** — Graph showing ε accumulation over queries

**Section 9: TEE Integration**
- **Figure 14: TEE Architecture** — Diagram showing enclave boundaries, attestation flow, sealed storage
- **Figure 15: Cognitive Privacy Protocol** — Sequence diagram: agent reasoning inside TEE, proof generation, external verification

**Section 11: Security Analysis**
- **Figure 16: Attack Tree** — Hierarchical diagram of attack scenarios and mitigations
- **Figure 17: Benchmark Results** — Bar charts: proof generation time, verification time, proof size across configurations

**Appendix C: Benchmarks**
- **Tables C1-C4** — Formatted benchmark tables with projected performance numbers

---

## Nano Banana Image Prompts (for covers and heroes)

### Business Whitepaper Cover
> Abstract geometric composition split diagonally: left half warm white with golden lattice lines and translucent blue orbs, right half deep black with green Matrix-style code streams. At the center where they meet, a luminous hexagonal seal glows with both gold and green energy. The composition is bold, modern, and corporate-premium. Clean graphic design, no text, high resolution. Colors: warm white (#FFFDF7), gold (#FFD700), sky blue (#0288D1), black (#050505), Matrix green (#00FF41).

### Academic Paper Cover
> Minimalist academic composition: clean white background with a single large geometric construction in the center — a zero-knowledge proof circuit visualized as an elegant network of connected nodes and paths. The circuit forms a subtle hexagonal shape. Nodes are rendered in dark navy (#102027) with thin connecting lines. A few key nodes glow softly in gold (#FFD700) and blue (#0288D1). The style is precise, mathematical, and institutional — like a figure from a prestigious research paper. No text, no decorative elements. Pure structure.

### Moltbook Case Study Illustration
> A shattered digital vault: hexagonal honeycomb structure (representing a credential database) with sections cracked and broken, revealing bright data streams leaking outward. Red warning indicators flash at breach points. The intact sections glow green (secure), the breached sections glow red (compromised). Dark background, dramatic lighting. Concept art style. Colors: black, green (#00FF41), red (#ff003c), dark gray.

---

## Diagram Generation Approach

For architecture diagrams and flowcharts, use one of:
1. **Mermaid** — For sequence diagrams, state machines, flowcharts (renderable in markdown)
2. **SVG** — For custom diagrams (protocol overview, credential lifecycle, circuit diagrams)
3. **React/D3** — For interactive data charts on the web version
4. **Python matplotlib/plotly** — For static data charts in the PDF

Recommended: Generate diagrams as SVGs for maximum quality and scalability in PDF.

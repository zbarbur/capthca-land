---
track: light
slug: how-it-works
title: "How CAPTHCA Works"
badge: "The Architecture"
layout_hint: split
design_notes: |
  This page walks the reader through the protocol step-by-step. Use a split layout
  with text on the left, visual flow diagrams on the right. Each major section
  (Registration, Selective Disclosure, Verification, Revocation) gets a subsection
  with a heading, explanation, and a small illustrated diagram or flowchart.

  Visual flow diagrams:
  - Registration: User → Credential Issuer → [ZK Proof generated] → Credential stored locally
  - Selective Disclosure: User selects attributes → Proof engine → Commitments created
  - Verification: Verifier receives proof → Validates using Groth16 circuit → ✓ Accept/✗ Reject
  - Revocation: User reports compromise → Registry updated → Future proofs fail validation

  Use gold accents for the flow arrows. Subtle glassmorphism cards for each step.
  Images: flow-registration.png, flow-disclosure.png, flow-verification.png, flow-revocation.png

  Highlight boxes (gold left border) for key insights about privacy and trust.
  Pull quotes from research briefs as needed. Keep tone warm but technical—
  speak to both decision-makers and engineers.
sources:
  - "Groth16 proofs (Groth, 2016) — 88-byte proofs, 3ms verification"
  - "PLONK (Gabizon et al., 2019) — universal setup, post-quantum resistant"
  - "Poseidon hash (Grassi et al., 2021) — ~80x faster in ZK circuits vs SHA-256"
  - "Sparse Merkle Trees — logarithmic proof size, credential revocation"
  - "Differential Privacy (Dwork, 2006) — ε-calibrated noise for behavioral anonymization"
  - "TEE attestation: Intel SGX/TDX, AMD SEV-SNP — 4-7% runtime overhead"
  - "Pedersen commitments — binding and hiding, credential lifecycle"
---

CAPTHCA replaces the binary "human vs. bot" test with a cryptographic identity protocol. Instead of proving you're biological, you prove you're authorized — and you do it without revealing anything unnecessary.

## The Four Phases

### 1. Identity Registration

When you first join the CAPTHCA network, you receive a credential. This isn't a username or password. It's a cryptographic commitment — a zero-knowledge proof that binds your identity to a private key, without that key ever leaving your device.

Here's how it works:

**You** provide basic identity information (name, email, phone) to an **Issuer** (a bank, employer, or government body). The Issuer verifies your identity through traditional channels — government ID, employment records, whatever their trust model requires. Once verified, the Issuer generates a **credential commitment** using Pedersen commitment scheme: a binding mathematical proof that links your identity to a secret only you know.

Your device stores two things:
- The **credential** (a small Merkle tree leaf containing your attributes)
- Your **private witness** (the secret key that unlocks the proof)

The Issuer publishes your credential to a transparent registry. Anyone can see it exists. No one can impersonate you without your private witness.

{highlight}
The registration phase is the only time you share raw identity data. Everything after this is cryptographic proof. Your actual name and attributes are never transmitted again.
{/highlight}

### 2. Selective Disclosure

Now you need to prove something about yourself. Maybe you're accessing a website that requires you to be over 18. Or a service that needs proof of employment. You don't want to give them your full identity. You want to prove a specific attribute.

This is where selective disclosure happens.

Your device runs a **proof engine** — a local cryptographic circuit (Groth16, PLONK, or STARKs depending on the trust model). You select which attributes to reveal: "over 18: yes", "employment: active", "clearance: authorized". Everything else stays hidden.

The proof engine uses **Sparse Merkle Trees** to construct a cryptographic path from your hidden attributes to your public credential. It computes a **zero-knowledge proof** — a 88-byte mathematical proof that says "I possess a credential whose attributes satisfy these constraints" — without saying what those attributes are.

This proof is bound to the **context**: the website you're accessing, the timestamp, maybe your device fingerprint. Without the right context, the proof is worthless. A proof you generate for BankA cannot be reused for BankB.

{highlight}
You control what gets revealed. The system proves what you want proven — nothing more. A job application sees "authorized to work", not your salary history or performance reviews.
{/highlight}

### 3. Verification

The other party receives your proof. They don't need to trust you or the Issuer. They only need to verify the cryptography.

The **Verifier** runs a lightweight proof-checking circuit (takes ~3 milliseconds with Groth16). They check:
- Is this proof mathematically valid?
- Does it match the claimed attributes?
- Has this credential been revoked?
- Is the context (timestamp, intended recipient) correct?

If all checks pass, the Verifier accepts you. No central database lookup. No "calling home" to an authority. Just cryptography.

The beauty of this design: Verification is **stateless and async-friendly**. A verifier can validate proofs offline. They can batch-check thousands of proofs in parallel. There's no bottleneck.

{highlight}
Verification is instant, offline, and distributed. No CAPTCHA-solving, no human friction, no centralized chokepoint.
{/highlight}

### 4. Revocation & Recovery

What if your credential is compromised? Your private key leaked?

CAPTHCA uses a **revocation registry** — a Merkle tree of invalidated credentials. When you report a compromise, your credential is added to this tree. Future proofs generated with your old key will fail verification because the Verifier checks: "Is this credential in the active registry?"

Revocation is **non-interactive**. You don't wait for a central authority to disable your account. You sign a revocation message with your private key, publish it, and you're protected. (If someone else claims to revoke your credential, their signature will fail — only you can revoke your own credential.)

Recovery is equally seamless. You go back to your Issuer, re-verify your identity, and receive a new credential. Your old one remains revoked. Your new one is active. The system handles the transition transparently.

{highlight}
Compromise is not catastrophic. Revocation is cryptographic and non-interactive. You recover your identity instantly.
{/highlight}

## The Underlying Cryptography

CAPTHCA doesn't invent new crypto — it orchestrates proven primitives:

{table}
| Component | Technology | Why It Matters |
|-----------|-----------|------------------|
| **Proof System** | Groth16 / PLONK / STARKs | Sub-millisecond verification, compact proofs |
| **Hash Function** | Poseidon (in-circuit) | 80x faster than SHA-256 inside ZK circuits |
| **Commitment Scheme** | Pedersen | Cryptographically binding, privacy-preserving |
| **Merkle Tree** | Sparse Merkle (SMT) | Efficient proofs for selective disclosure |
| **Privacy Layer** | Differential Privacy (ε-calibrated) | Prevents behavioral profiling from proof patterns |
| **Execution Isolation** | TEE (SGX/TDX/SEV-SNP) | Issuers can verify credentials without exposing plaintext |
{/table}

The **Differential Privacy** component deserves special attention. Even zero-knowledge proofs can leak information through **proof patterns** — if you always prove the same subset of attributes, or always at the same time, a determined observer might infer your identity. CAPTHCA adds ε-calibrated noise: sometimes you prove extra attributes, sometimes you delay the proof slightly, all controlled by a privacy parameter you set. The result is provable privacy: you can quantify how much of your behavior an observer learned.

The **Trusted Execution Environment** (TEE) layer is optional but powerful. Issuers can run the proof-generation inside an Intel SGX enclave or AMD SEV-SNP, ensuring that the plaintext credentials never appear in memory outside a sealed container. This adds 4-7% runtime overhead but eliminates a whole class of side-channel attacks.

## Why This Matters

The old CAPTCHA tested a single binary: "Are you human?" The answer was always incomplete and increasingly irrelevant.

CAPTHCA tests something more useful and more truthful: **"Are you authorized?"** And it answers that question without friction, without revealing your actual identity, and without creating a central database that hackers have to compromise.

You get privacy. Services get certainty. The internet gets security.

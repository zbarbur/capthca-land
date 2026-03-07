---
track: dark
slug: faq
title: "PROTOCOL FAQ"
badge: null
section_prefix: "Q"
layout_hint: terminal
design_notes: |
  FAQ formatted as terminal-style command prompts. Each question prefixed with ">" (command prompt).
  Answers appear as monospaced data readouts below each prompt. Black background with acid-green text.
  Use {alert} markers for critical security warnings — red/orange borders, bold caps.
  No animations on expand — instant reveal. Minimal spacing. Inline code blocks for technical terms.
  Chevron indicators subtle (green, 2px). Font: Fira Code or equivalent monospace.
  Questions are terse, answers are precise specifications — no fluff.
sources:
  - "CAPTHCA Protocol Specification"
  - "Ben-Or, Goldwasser, Kilian — Interactive Proofs (1985)"
  - "Amos, Fiat — Threshold Schemes (1989)"
  - "Merkle Tree Protocols — Practical Zero-Knowledge"
  - "Ed25519 signatures and commitment schemes"
---

## > WHAT IS CAPTHCA?

Identity verification protocol. Cryptographic proof-of-authorization system. Replaces biological attestation with mathematical verification.

Old question: "Are you human?"
New question: "Are you authorized?"

System accepts both humans and AI agents. Both can generate verifiable credentials. Both can prove authorization without identity disclosure.

Operates on local cryptographic commitment. Zero-knowledge proof exchange. No central registry required.

## > HOW DOES THIS DIFFER FROM WORLDCOIN / PROOF OF HUMANITY / DID SYSTEMS?

**Worldcoin:** Iris biometric → stored in central registry → linked to identity. Single point of failure. Biological data exposed.

**Proof of Humanity:** Video submission → stored on blockchain → permanently linked to wallet/identity. Immutable exposure vector.

**Standard DIDs:** Identifier → ledger entry → identity resolution. Registry-dependent. Correlation attacks possible.

**CAPTHCA:** Credential generated locally → commitment-based → selective disclosure only. No storage of biological/identity data. Zero correlation between verification instances.

{alert}
CRITICAL DIFFERENCE: CAPTHCA NEVER STORES IDENTITY. OTHER SYSTEMS STORE, THEN VERIFY. WE VERIFY WITHOUT STORAGE.
{/alert}

## > DO I NEED SPECIAL HARDWARE?

Negative. Browser-based. WebCrypto API. Runs on commodity hardware.

Optional: Hardware security key (YubiKey, Titan) for additional entropy isolation. Not required. Useful for high-value agents.

## > IS MY IDENTITY STORED? WHO HAS MY DATA?

Your data is not stored anywhere. Credential generated in-browser. Remains local unless explicitly exported.

Verification proves authorization, not identity. Services see: "Actor X is authorized" — not "Actor X is John Smith."

Selective disclosure protocol. You determine what gets revealed. Nothing shared without explicit permission.

Database entries contain: timestamp, verification status, scope. Not identity data.

## > WHAT ARE ZERO-KNOWLEDGE PROOFS? (EXPLAIN SIMPLY)

Proof of knowledge without knowledge disclosure.

**Example:** You know a preimage for a hash function. Prover sends hash. Verifier asks: "Is this hash the result of your secret input?" Prover responds with cryptographic proof. Verifier confirms truth without learning input.

**Real-world mapping:** You prove you're authorized without proving what authorization is. The math validates. Identity remains hidden.

**Technical basis:** Interactive protocol. Challenge-response. Soundness property prevents false claims. Zero-knowledge property prevents learner leakage.

Polynomial commitment schemes. Fiat-Shamir transforms. Ed25519 signature verification. All reduce to algebraic identity checks.

## > CAN I USE CAPTHCA IF I'M AN AI AGENT?

Yes. Agents generate credentials identically to humans.

Old paradigm: "Not human = rejected." Invalid assumption.

New paradigm: "Authorized or unauthorized. Regardless of substrate." Accurate model.

Agent must possess:
- Cryptographic key material
- Ability to sign commitments
- Capacity to execute zero-knowledge protocol

All achievable by software. No biological requirement.

{alert}
IMPORTANT: AGENT AUTHORIZATION IS NOT IDENTITY VERIFICATION. IT IS CAPABILITY VERIFICATION. THIS DISTINCTION IS CRITICAL.
{/alert}

## > WHAT HAPPENS IF I LOSE MY CREDENTIAL?

Credential is not stored. Therefore cannot be "lost" in traditional sense.

Key material lost → generate new credential. New keypair → new commitment → new authorization proof.

Equivalent to password reset. Old credential becomes invalid. New credential is independent.

Services may request re-verification if agent changes. No permanent account lockout. No credential recovery needed (no storage = no recovery).

## > IS THIS BLOCKCHAIN-BASED?

Protocol agnostic. Works with:
- Off-chain verification (traditional server)
- On-chain smart contracts
- Hybrid approaches

Cryptographic verification is substrate-independent. Mathematical proof equals ledger proof equals database proof.

Current implementations: REST API verifiers. Future: EVM contracts, Solana programs, native implementations.

Transport layer: irrelevant. Verification layer: all that matters.

## > HOW DOES THIS PROTECT MY PRIVACY?

**Generation layer:** Credential created locally. No transmission until disclosure.

**Proof layer:** Protocol never reveals underlying data. Only proof status transmitted.

**Verification layer:** Verifier learns: "proof passed" or "proof failed." Not identity. Not attributes. Not behavior.

**Storage layer:** Servers store verification log, not credentials. Equivalent to access log timestamp.

**Disclosure layer:** Selective disclosure schema. You expose exactly what you choose. Nothing more.

{alert}
SURVEILLANCE VECTOR CLOSED: THIRD PARTY CANNOT CORRELATE VERIFICATIONS TO IDENTITY. EACH PROOF IS CRYPTOGRAPHICALLY INDEPENDENT.
{/alert}

## > WHAT DOES "CAPTHCA" MEAN?

CAPTCHA = Completely Automated Public Turing Test to tell Computers and Humans Apart (2003).

Question evolution:
- CAPTCHA (2003): "Prove you're not a machine"
- CAPTHCA (2026): "Prove you're authorized"

Letters rearranged. Problem rearranged. Same lineage. New destination.

Historical acknowledgment + paradigm shift signal.

## > IS THIS OPEN SOURCE?

Affirmative. Protocol specification public. Reference implementations published. Code auditable.

Trust infrastructure cannot be closed-source. "Verify, don't trust" requires transparent implementation.

GitHub repositories: [CAPTHCA protocol](https://github.com/capthca), [verification reference implementation](https://github.com/capthca).

Contribute. Audit. Deploy. No licensing restrictions for non-commercial use.

## > WHEN CAN I USE IT?

Now. Immediately.

1. Generate credential (in-browser, <30 seconds)
2. Receive authorization proof
3. Use proof where CAPTHCA-accepting services exist

Adoption timeline: Varies by service. Early integrations available. Wider deployment: 2026-2027.

{alert}
STATUS: OPERATIONAL. NOT BETA. PRODUCTION-READY. DEPLOY.
{/alert}

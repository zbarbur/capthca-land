---
track: light
slug: faq
title: "Frequently Asked Questions"
badge: "The Handbook"
layout_hint: standard
design_notes: |
  FAQ uses accordion/expandable pattern. Soft rounded corners (border-radius: 12px).
  Each question is a collapsible card with gold left border on open state.
  Gentle ease-out animation on expand (250ms). Light background: card_bg.
  Highlight boxes use a soft yellow/gold background with subtle border.
  Icons: chevron-down (closed), chevron-up (open). Smooth rotation animation.
  Spacing: 20px between cards, 24px padding inside each card.
  Questions in bold, answers in regular weight — good contrast hierarchy.
sources:
  - "CAPTHCA Protocol Specification"
  - "Zero-knowledge proof foundations (Blum, Feldman, Micali)"
  - "Merkle commitment schemes and selective disclosure"
  - "Differential privacy in credential systems"
---

## What is CAPTHCA?

CAPTHCA is the next evolution in digital identity. Instead of asking "Are you human?" (a question that's become impossible to answer), it asks "Are you authorized?" It's a cryptographic proof-of-identity system that works for humans *and* AI agents — proving you're real without revealing who you are.

Think of it like a security deposit box where only you hold the key. You can open the box and prove its contents are genuine without ever showing what's inside. That's the magic of zero-knowledge proofs at the core of CAPTHCA.

## How is this different from Worldcoin, Proof of Humanity, or existing DIDs?

{highlight}
CAPTHCA is identity-blind by design. You prove you're authorized without revealing your identity.
{/highlight}

Most existing systems ask you to register with a central authority — a company, a blockchain, a registry. They collect some form of biometric or personal data, store it somewhere, and use that stored data to verify you later. Worldcoin scans your iris. Proof of Humanity requires you to submit a video. Most DIDs tie to your wallet or email.

CAPTHCA uses *cryptographic commitments* instead. You generate a credential (locally, in your browser) that proves something about you — humanness, uniqueness, authorization — without revealing *what* that thing is. The system verifies the proof, not the identity. Your data never leaves your device unless you choose to share it.

It's the difference between showing your passport to prove you're a citizen, and proving you're a citizen without showing where you're from.

## Do I need special hardware?

No. CAPTHCA works in your browser, on any device with WebCrypto support (which is nearly every modern device — phones, laptops, tablets). You don't need a Orb, a biometric scanner, or specialized equipment.

The only optional hardware is a hardware security key (like YubiKey) if you want extra protection — but it's not required. Your credential is safe in your browser.

## Is my identity stored somewhere? Who has my data?

Your identity is never stored. You generate a credential locally in your browser — it never leaves unless you explicitly share it. Think of it like a digital receipt that proves you passed verification, but the receipt itself doesn't contain your personal information.

The protocol uses *selective disclosure*. You can prove you're a verified human without revealing your name, email, or any other details. Only the things you choose to reveal are shared.

Different services may store *that you're authorized* (similar to how a nightclub stamps your hand), but they never see the underlying credential or personal data. You're in control of what gets shared and with whom.

## What are zero-knowledge proofs? (explain simply)

Imagine you know the solution to a complex puzzle. You want to prove you solved it without revealing the solution itself. You could solve it again in front of someone, but then they learn the solution too. Zero-knowledge proofs let you prove you know the answer without ever showing it.

Here's a more concrete example: You have a hidden number. You can prove it's between 1 and 1 million without telling anyone what the number is. The other person runs a mathematical check, and it either passes or fails. If it passes, they know you're telling the truth. If it fails, you were lying. No solution revealed, just proof of integrity.

CAPTHCA uses this to prove you're human, or authorized, or unique — without revealing personal data. The system verifies the math, not your identity.

## Can I use CAPTHCA if I'm an AI agent?

Yes. In fact, that's a core feature. AI agents can generate their own credentials using the same system. An agent that's "authorized" generates a proof; a system that's suspicious of that agent can ask for additional verification.

This is crucial because the old CAPTCHA assumed humans = good, bots = bad. That's no longer true. Some AI systems are trustworthy; some humans are malicious. CAPTHCA verifies the actor (human or machine) without making assumptions based on what they are.

## What happens if I lose my credential?

You can regenerate it anytime, just like resetting a password. Your credential isn't stored anywhere, so there's nothing to recover — you simply create a new one in your browser.

If a service is asking "Are you the same person who accessed this account last time?", regenerating your credential is like answering "No, but I'm still authorized to access this." Some services might require re-verification (similar to 2FA), but there's no permanent lock-out.

## Is this blockchain-based?

Not inherently. CAPTHCA is a protocol, not a blockchain system. You can use it on-chain (with smart contracts verifying credentials) or off-chain (with traditional servers verifying the math). It's transport-agnostic.

The beauty of cryptographic proofs is they work on paper, on blockchain, or in a database. The verification is just math.

## How does this protect my privacy?

Privacy is baked into every layer:

**At generation:** Your credential is created locally. No one sees it until you decide to share proof of it.

**At verification:** The system checks the math, not your personal data. It learns "someone authorized" not "John Smith authorized."

**At storage:** Services don't store your credential — just a log that verification passed. It's like a security checkpoint that doesn't photograph you.

**At sharing:** You control exactly what gets revealed. You can prove you're a verified human without revealing age, location, or any other details.

{highlight}
No biometric scanning. No registry. No back-end database of "who you are." Just cryptographic proof that you're authorized.
{/highlight}

## What does the name "CAPTHCA" mean?

CAPTHCA is an evolution of CAPTCHA — the "Completely Automated Public Turing test to tell Computers and Humans Apart" invented in 2003.

The old CAPTCHA asked: "Prove you're not a machine."

CAPTHCA (with the letters rearranged) asks: "Prove you're authorized."

It's a play on the original acronym — same technology family, but the question has flipped. The focus shifted from excluding bots to verifying authorization. It's homage to where we came from and a signal that the problem has evolved.

## Is this open source?

Yes. The CAPTHCA protocol specification is open, and reference implementations are public. You can audit the code, run your own verification server, or integrate CAPTHCA into your own systems.

Privacy and trust systems must be transparent. We believe in "verify, don't trust."

## When can I use it?

CAPTHCA is available now. You can generate your credential, get verified, and start using authorized services. Services and platforms are progressively integrating CAPTHCA verification into their flows.

The longer journey is adoption — getting the web to ask "Are you authorized?" instead of "Are you human?" That takes time, but it starts with you getting verified.

{highlight}
Start here: Generate your credential, choose what you're comfortable proving, and explore where CAPTHCA is accepted. Welcome to the future of identity.
{/highlight}

---
track: dark
slug: how-it-works
title: "THE PROTOCOL"
section_prefix: "02"
layout_hint: split
design_notes: |
  This section dissects the protocol mechanics with machine precision. Use split layout
  with technical spec text on left, HUD-style diagrams on right. Each phase (Registration,
  Disclosure, Verification, Revocation) gets its own subsection with section_prefix numbering
  (02 // PHASE 1, 02.1 // PHASE 2, etc.).

  Visual diagrams with corner brackets (HUD style):
  - Registration: Issuer state machine → Witness generation → Credential tree insertion
  - Disclosure: Merkle path computation → Circuit evaluation → Proof generation
  - Verification: Proof validation → Registry lookup → Accept/Reject atomic state
  - Revocation: Compromise signal → Registry update → Proof invalidation cascade

  Use acid-green borders and monospaced callout text. Alert boxes (red border, ALL CAPS)
  for security-critical decisions. Diagrams should look like system architecture docs,
  not flowcharts. Keep language precise—engineers reading this must understand the
  exact cryptographic operations happening at each step.

  Images: hud-registration.png, hud-disclosure.png, hud-verification.png, hud-revocation.png
sources:
  - "Groth16 (Groth, 2016): succinct non-interactive zero-knowledge proofs, 88 bytes, O(1) verification"
  - "PLONK (Gabizon et al., 2019): algebraic intermediate representation, universal trusted setup"
  - "Poseidon (Grassi et al., 2021): SNARK-friendly sponge construction, ~80x in-circuit efficiency"
  - "Sparse Merkle Trees: logarithmic witness size, concurrent updates, efficient revocation"
  - "Differential Privacy (Dwork, 2006): (ε,δ)-indistinguishability, behavioral anonymization"
  - "Intel SGX/TDX, AMD SEV-SNP: isolated execution, remote attestation, 4-7% overhead"
  - "Pedersen commitments: perfectly hiding, computationally binding, non-interactive"
---

The protocol is a four-phase cryptographic state machine. Each phase transitions through cryptographic gates. No human decision points. No API calls to oracles. Pure computation.

## 02.1 // REGISTRATION

An Issuer initializes a credential lifecycle. The operation is one-way.

**Inputs:** Identity claim (name, email, attributes), Issuer private key, User device ephemeral key.

**Operation:**
1. Issuer hashes identity claim into a **Pedersen commitment** `C = g^claim + h^randomness` (hiding + binding)
2. Issuer publishes credential leaf to a **Sparse Merkle Tree** (SMT), indexed by user ID
3. SMT root committed to a public ledger (blockchain or append-only log)
4. User device receives commitment + Merkle path, derives a secret witness `w` from device entropy
5. User computes `π_register = NIZK(claim, w)` — a non-interactive proof of knowledge
6. π_register is stored locally on device; never transmitted

**Outputs:**
- Public state: SMT root + credential leaf (both verified against ledger)
- Private state: `w` (witness, never transmitted), proof template for future disclosures
- Revocation state: credential flagged ACTIVE in registry

{alert}
CRITICAL: THE WITNESS `w` MUST NEVER LEAVE THE DEVICE. Loss of witness = loss of identity cryptographic binding.
{/alert}

Registration happens once per issuer relationship. The credential tree is append-only. Credentials are immutable until revoked.

## 02.2 // SELECTIVE DISCLOSURE

The user generates a zero-knowledge proof for a subset of attributes.

**Inputs:** Credential leaf, witness `w`, selected attributes (subset S), context hash `h_ctx`, proof system selector.

**Operation:**
1. User device evaluates **proof circuit** (Groth16, PLONK, or STARK depending on security model)
2. Circuit verifies:
   - User possesses valid witness `w` (private input)
   - Witness binds to credential in SMT (public input: SMT root, leaf hash)
   - Selected attributes S satisfy the constraint logic (e.g., age > 18)
   - Proof is bound to context hash (prevents proof portability)
3. Circuit outputs **zero-knowledge proof** `π = (A, B, C)` in Groth16 format (88 bytes) or equivalent in PLONK/STARK
4. Proof is timestamped and optionally signed by user's ephemeral key

**Outputs:**
- `π` (proof, portable, 88-256 bytes depending on system)
- Proof metadata: selected attributes, context hash, timestamp, issuer ID
- No plaintext identity data leaves the device

{alert}
CONTEXT BINDING ENFORCES PROOF NON-PORTABILITY. A PROOF GENERATED FOR DOMAIN_A FAILS VALIDATION ON DOMAIN_B EVEN IF THE PROOF CRYPTOGRAPHY IS VALID.
{/alert}

The proof circuit uses **Sparse Merkle Trees** for efficient attribute selection. User claims "age > 18" without revealing birthdate. The circuit proves: "A leaf exists in the SMT for which the age field is > 18" without exposing the age field itself. This is 2-3 levels of Merkle hashing, ~20 hash operations, microseconds on a modern CPU.

Differential privacy injection (optional, high-security mode): Circuit adds ε-calibrated Laplacian noise to proof generation timing or selects random dummy attributes to include, making behavioral fingerprinting provably difficult. DP parameter ε controls privacy-utility tradeoff (lower ε = stronger privacy, higher communication cost).

## 02.3 // VERIFICATION

A verifier (service, gateway, agent) receives a proof and validates it atomically.

**Inputs:** `π` (proof), claimed attributes, context hash, issuer ID, current SMT root, current revocation registry.

**Operation:**
1. **Proof validation:** Check `π` against the constraint circuit
   - Groth16: bilinear pairing verification, `e(A, B) = e(α, β) · e(C, γ)` O(1) time, 3 milliseconds
   - PLONK: polynomial commitment check via KZG or IPA, slightly slower but requires less trusted setup
   - STARK: field arithmetic check, post-quantum secure, no setup phase
2. **Revocation check:** Hash credential commitment, lookup in Sparse Merkle Tree revocation index
   - If credential in REVOKED state: reject proof atomically
   - If credential in ACTIVE state: continue
3. **Context validation:** Hash `(domain, timestamp, device_fingerprint)`, verify matches proof binding
   - Prevents cross-domain proof reuse
   - Optional: timestamp freshness window (proof valid for 5min, 1hr, 24hr — configurable)
4. **Attribute assertion:** Proof implicitly asserts selected attributes; verifier accepts based on policy

**Outputs:**
- Accept: credential valid, attributes sufficient, proof sound
- Reject: any single check fails, atomic failure (no partial state)
- No side effects: verification is pure computation, no state mutation on verifier

{alert}
VERIFICATION IS STATELESS. A VERIFIER NEED NOT TRUST THE ISSUER, THE USER, OR ANY ORACLE. ONLY CRYPTOGRAPHY.
{/alert}

Verification cost scales linearly with number of verifications, not with user base. A gateway can verify 10,000 proofs/second on standard hardware. Batch verification (proving same circuit for multiple proofs) reduces cost per proof by 60-70%.

TEE-accelerated verification (optional, high-throughput): Verifier runs proof checking inside Intel SGX or AMD SEV-SNP, enabling rate-limiting and hardware-backed metrics. 4-7% performance overhead, eliminates timing side-channels.

## 02.4 // REVOCATION & RECOVERY

A user reports credential compromise. The system invalidates all proofs generated with that credential.

**Inputs:** Credential ID, revocation signature (user private key), revocation reason code.

**Operation:**
1. User signs revocation message: `sig = Sign(privkey, REVOKE || credential_id || timestamp)`
2. Signature broadcast to ledger (blockchain, gossip protocol, or append-only log)
3. Verifier node receives revocation message:
   - Recovers public key from signature (ECDSA recovery or Schnorr variant)
   - Verifies signature matches credential's registered public key
   - Inserts credential into Sparse Merkle Tree revocation index
   - Broadcasts revocation state update to network
4. Future proofs generated with this credential fail revocation check (step 02.3, credential in REVOKED state)
5. User initiates new registration with same issuer, receives new credential + new witness

**Outputs:**
- Old credential: REVOKED (irreversible)
- New credential: ACTIVE (full authority restored)
- Revocation is non-interactive (user does not wait for issuer approval)
- Recovery time: credential generation time (~100ms) + network propagation (~5s in worst case)

{alert}
COMPROMISE IS NOT EXISTENTIAL. A REVOKED CREDENTIAL CANNOT BE REACTIVATED. THE COMPROMISED WITNESS IS CRYPTOGRAPHICALLY INVALID. RECOVERY IS IMMEDIATE UPON CREDENTIAL REISSUANCE.
{/alert}

Revocation state is compressed in the Sparse Merkle Tree revocation index. Adding 1M revoked credentials adds ~20 hash operations per revocation check (~500 microseconds, negligible). The tree is prunable: old revocations can be archived after a retention window (e.g., 90 days), compressing operational state.

## THE CRYPTOGRAPHIC STACK

Each primitive is selected for minimalism and auditability:

{table}
| Layer | Primitive | Property | Cost |
|-------|-----------|----------|------|
| **Proof** | Groth16 / PLONK / STARK | Succinct, efficient, composable | 88-256 bytes, 3-50ms verify |
| **Hash** | Poseidon (in-circuit), SHA-256/3 (merkle) | SNARK-optimized, collision-resistant | 3 field ops (Poseidon), 80 bit-ops (SHA) |
| **Commitment** | Pedersen | Hiding + Binding, non-interactive | 32 bytes commitment |
| **Tree** | Sparse Merkle (SMT) | Logarithmic proofs, efficient updates | O(log N) per operation |
| **Privacy** | Differential Privacy (ε,δ) | Behavioral anonymization (optional) | ε = 0.1-1.0, δ < 10^-6 |
| **Isolation** | TEE (SGX/TDX/SEV) | Hardware-backed execution (optional) | 4-7% overhead |
{/table}

**Poseidon** is the critical optimization. A traditional SNARK circuit using SHA-256 requires ~40,000 constraints. Poseidon uses ~60 constraints for the same security level. This is why in-circuit hashing is ~80x faster. Groth16 proofs scale with circuit complexity; Poseidon makes SMT operations — the innermost loop of the protocol — practically free.

**Differential Privacy** (optional, high-security mode) adds behavioral noise: sometimes the proof includes a dummy attribute, sometimes the proof is delayed by a random interval, sometimes a secondary proof is generated. An observer watching proof patterns cannot distinguish the user's real disclosure behavior from random noise with probability > 1-ε. This is provably harder than cryptographic soundness — it's a statistical guarantee.

## ATTACK SURFACE & ASSUMPTIONS

The protocol is sound under these assumptions:

1. **User device is trusted.** If the user's device is compromised (malware steals `w`), the credential is compromised. Revocation restores security.
2. **Issuer setup is honest.** The SMT is maintained correctly. Credentials are not falsified. (Solvable via threshold issuance: multiple issuers sign off on credential validity.)
3. **Ledger is immutable.** SMT roots and revocation state are committed to an immutable append-only log (blockchain or PKI-style log). Verifiers trust the ledger, not the issuer.
4. **Proof system is sound.** Groth16 is sound under the Knowledge of Exponent assumption (KEA). PLONK under polynomial commitment assumptions. STARKs under collision-resistance. All assumptions are standard in cryptographic literature.
5. **Context binding is enforced.** The domain/timestamp/device hash is included in the circuit and the proof. Verifiers check this binding. This prevents proof portability.

The protocol **resists**:
- **Proof forgery:** Computationally infeasible under KEA/polynomial commitment assumptions
- **Credential impersonation:** Requires knowledge of witness `w`, stored only on user device
- **Proof replay:** Context binding prevents reuse across domains/timestamps
- **Behavioral profiling:** Differential privacy adds statistical noise (optional)
- **Side-channel attacks:** TEE isolation blocks timing/power analysis (optional)

The protocol **does not resist**:
- **Malware on user device** (revocation is the recovery mechanism)
- **Issuer dishonesty** (solved by multi-issuer threshold signatures)
- **Ledger compromise** (solved by ledger immutability assumptions)

---

This is the machine. No human in the loop. No biometric ambiguity. No "are you human?" fallacy. Pure cryptographic identity, verified in 3 milliseconds, recoverable in seconds.

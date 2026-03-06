---
topic: "Cryptographic Commitment Schemes & Agent Authentication"
type: research-brief
date: 2026-03-06
relevance: "Foundation for Signed Intent and agent authorization in CAPTHCA"
---

# Cryptographic Commitment Schemes & Agent Authentication

## Executive Summary

This research explores the cryptographic foundations underlying **Signed Intent** — the core mechanism by which agents prove authorization to perform specific actions. Agent identity and authorization depend on commitment schemes (to bind intent), digital signatures (to prove execution authority), and authentication protocols (to delegate permissions across agent networks).

CAPTHCA leverages these primitives to create tamper-resistant, cryptographically verifiable proof that:
1. A human authorized an agent to act
2. The agent committed to specific constraints (intent)
3. The action performed matched the authorization scope

---

## 1. Commitment Schemes: Binding Intent

Commitment schemes are cryptographic primitives that allow one party to commit to a value while keeping it hidden, with the ability to reveal it later in a way that proves they couldn't have changed their mind. For agents, this enables **commit-now, reveal-later** authorization patterns.

### 1.1 Pedersen Commitments

**Mathematical Foundation:**

Pedersen commitments work in an elliptic curve group where the discrete logarithm problem is hard. The commitment formula is:

```
C = x·G + r·H
```

Where:
- `x` = the message/intent being committed to
- `r` = random blinding factor (nonce)
- `G, H` = two independent group generators
- `C` = the commitment (a curve point, ~32-48 bytes)

**Security Properties:**

- **Perfect Hiding (Information-Theoretic):** The commitment reveals absolutely no information about `x` without knowing `r`, even with unlimited computational power. For every commitment `C` and every possible value `x`, there exists exactly one blinding factor `r` that opens to that value.

- **Computational Binding:** Under the discrete logarithm assumption (ECDLP is hard), an adversary cannot find two different pairs `(x, r)` and `(x', r')` such that both open to the same commitment.

**Algebraic Properties:**

Pedersen commitments are **homomorphic**: you can add commitments to get the commitment of summed values:

```
C₁ + C₂ = (x₁·G + r₁·H) + (x₂·G + r₂·H) = (x₁+x₂)·G + (r₁+r₂)·H
```

This property enables efficient zero-knowledge proofs and range proofs, critical for verifying agent constraints without revealing exact values.

**Application to Agent Intent:**

An agent can commit to intent during registration:
```
commit(intent_hash) = intent_hash·G + nonce·H
```

Later, when executing, the agent reveals `(intent_hash, nonce)` and the system verifies:
```
verify: intent_hash·G + nonce·H == stored_commitment
```

If the agent tries to execute something different, it cannot produce a valid opening because the commitment binds it mathematically.

### 1.2 KZG Polynomial Commitments

**Vector Commitment via Polynomial Interpolation:**

KZG (Kate-Zaverucha-Goldberg) commitments extend beyond single values to commit to vectors of data. Given a vector of agent capabilities `[cap₀, cap₁, ..., capₙ₋₁]`, construct a polynomial:

```
P(x) such that P(i) = capᵢ for each index i
```

The commitment is a single group element (~48 bytes with BLS12-381):

```
C = ∑ᵢ(capᵢ·[sⁱ]₁)
```

Where `[sⁱ]₁` are the public parameters (powers of a secret used in setup).

**Efficient Opening Proofs:**

To prove that position `i` has value `v`:

1. Compute quotient polynomial: `Q(x) = (P(x) - v) / (x - i)`
2. Send proof: `π = [Q(s)]₁` (one group element, ~48 bytes)
3. Verifier checks: `e(π, [s-i]₂) = e(C - [v]₁, [1]₂)`

**Advantages Over Merkle Trees:**

| Property | Merkle Tree | KZG Commitment |
|----------|-----------|----------------|
| Proof Size | O(log n) | O(1) constant 48 bytes |
| Setup | None | Trusted setup required |
| Number of Elements | n | Polynomial degree n |

**Application to Agent Authorization:**

Store agent capabilities as a vector and commit via KZG:
- `capabilities = [read, write, delete, deploy, ...]`
- Single commitment represents all capabilities
- Prove specific capability without revealing others
- Efficient for verifying agent scope at runtime

### 1.3 Hash-Based Commitments

**Simplest Form:**

```
commit(msg) = hash(msg || nonce)
```

**Security Properties:**

- **Computationally Hiding:** One-wayness of hash function ensures adversary cannot reverse-engineer `msg` from commitment
- **Computationally Binding:** Collision-resistance of hash ensures adversary cannot find two different messages with same hash
- **No Trusted Setup:** Unlike Pedersen/KZG, requires only assumption that hash function is collision-resistant

**Application to Intent Binding:**

For lightweight agent intent:
```
authorized_intent = hash(
  agent_id ||
  action ||
  resource ||
  constraints ||
  expiry ||
  nonce
)
```

The human signs this hash. The agent cannot later claim different permissions.

---

## 2. Digital Signature Schemes for Agent Authorization

Signatures prove three things simultaneously:
1. **Authenticity:** Message came from claimed signer
2. **Non-repudiation:** Signer cannot deny they signed it
3. **Integrity:** Message hasn't been tampered with

For agents, signatures enable delegation chains: Human → Agent A → Agent B, with each party cryptographically verifying the previous.

### 2.1 ECDSA (Elliptic Curve Digital Signature Algorithm)

**Signature Generation:**

```
Choose random nonce k ∈ [1, n-1]
r = x-coordinate of (k·G) mod n
s = k⁻¹(hash(msg) + r·sk) mod n
Signature = (r, s)
```

**Verification:**

```
u₁ = hash(msg)·s⁻¹ mod n
u₂ = r·s⁻¹ mod n
Verify: x-coordinate of (u₁·G + u₂·pk) == r
```

**Signature Size:** 64 bytes (for secp256k1, used in Bitcoin/Ethereum)

**Security Assumptions:** ECDLP (Elliptic Curve Discrete Logarithm Problem) hardness

**Vulnerabilities:**

- **Nonce Reuse:** If `k` is reused for two messages with same signer, the private key is leaked. This occurred in Sony's PlayStation 3 signing.
- **No Batch Verification:** Cannot verify multiple signatures faster than individually
- **Complex Security Proof:** Security relies on non-standard assumptions (no ROM proof of security)

**Agent Usage:**

```
agent_sig = ECDSA.sign(
  privkey=agent_secret,
  msg=commitment(intent)
)
```

Vulnerable if agent's random number generator fails.

### 2.2 EdDSA / Ed25519

**Deterministic Nonce Generation:**

```
hash_prefix = hash(private_key) >> 256  // take second half
nonce = hash(hash_prefix || message)    // deterministic!
```

**Verification:**

```
Verify using Schnorr-like equation on Edwards curve
[S]·B == [8·A + 8·hash(encoding(A) || encoding(prefix(msg)) || msg)·A]
```

**Signature Size:** 64 bytes

**Advantages Over ECDSA:**

| Property | ECDSA | EdDSA/Ed25519 |
|----------|-------|---------------|
| Nonce Generation | Random (vulnerable) | Deterministic |
| Signature Speed | Slower | 30-40% faster |
| Verification | No batch | Batch verification |
| Math Proof | Heuristic | Provably secure |
| Collision Risk | Yes (if k reused) | No |
| Side-Channel Risk | Higher | Lower |

**Agent Usage:**

Ed25519 is **preferred for agents** because:
- No RNG vulnerability (deterministic nonce)
- Faster verification for many concurrent agents
- Simpler implementation (fewer edge cases)
- Used in Solana, Signal, WireGuard, SSH

### 2.3 BLS Signatures (Boneh-Lynn-Shacham)

**Key Innovation: Aggregatable Signatures**

Multiple signatures from different signers aggregate into one signature:

```
Individual Signatures:
σ₁ = hash_to_group(msg)^sk₁
σ₂ = hash_to_group(msg)^sk₂
...
σₙ = hash_to_group(msg)^skₙ

Aggregated Signature:
σ_agg = σ₁ · σ₂ · ... · σₙ
```

**Verification:**

```
Verify σ_agg and all public keys pk₁, ..., pkₙ:
e(σ_agg, G) == e(H(msg), pk₁ + pk₂ + ... + pkₙ)
```

Where `e` is a bilinear pairing.

**Cost Reduction:**

- **Individual verification:** 2n pairings
- **Aggregated verification:** n+1 pairings (linear savings)

**Threshold Variants:**

In a (t, n) threshold BLS scheme:
- Secret key split into n shares via Shamir's secret sharing
- Any t signers can cooperate to create valid signature
- No single signer can create forged signature alone

**Signature Size:** ~96 bytes (depending on curve)

**Agent Network Usage:**

Multi-agent consensus: When agents vote on execution (e.g., "Should agent C deploy to production?"), use BLS to:
1. Each agent signs: `σᵢ = BLS.sign(agent_sk_i, authorization_request)`
2. Aggregate signatures: `σ_agg = σ₁ · σ₂ · σ₃`
3. Verify once: `BLS.verify(aggregated_pk, msg, σ_agg)`

Cost: 1 multi-pairing instead of 3 individual pairings.

### 2.4 Schnorr Signatures

**Linear Equation Structure:**

```
Choose random nonce k
R = k·G
Challenge c = hash(R || msg || pub_key)
Response z = k + c·sk
Signature = (R, z)  // or (c, z) in some variants
```

**Verification:**

```
Check: z·G == R + c·pk
```

**Key Advantages:**

| Property | ECDSA | Schnorr |
|----------|-------|---------|
| Math Security Proof | Heuristic | Formal (ROM) |
| Linearity | Non-linear | Linear ✓ |
| Aggregation | No | Yes (like BLS) |
| Batch Verification | No | Yes |
| Signature Size | 64 bytes | 64 bytes |
| Replay Protection | No | Built-in |

**Linearity Enables Multi-Signatures:**

```
Without interaction:
Combined_sig = σ₁ + σ₂ + σ₃
Combined_pk = pk₁ + pk₂ + pk₃
Verify: combined_sig·G == R₁ + R₂ + R₃ + hash(...)·combined_pk
```

**Agent Use Case:**

Joint authorization: Multiple agents signing same action produce one combined signature.

### 2.5 Post-Quantum Signatures (NIST Standards)

**Why Agents Need Post-Quantum Signatures:**

If quantum computers become practical, ECDSA, EdDSA, BLS, and Schnorr all break (discrete log/elliptic curve security collapses). CAPTHCA intends decades-long authorization proofs; must withstand quantum adversaries.

**NIST PQC Standards (August 2024):**

#### ML-DSA (Module-Lattice-Based Digital Signature Algorithm)

Previously: CRYSTALS-Dilithium

**Signature Size:** 2420 bytes (for NIST security level 2)

**Public Key Size:** 1312 bytes

**Performance:** ~8 microseconds signing, ~65 microseconds verification on modern CPU

**Security Basis:** Module Learning With Errors (MLWE) problem — no known quantum algorithm

**Advantages:**
- Smallest signature size among NIST finalists for lattice schemes
- Fast verification
- Deterministic (like EdDSA)
- Constant-time implementation possible

#### SLH-DSA (Stateless Hash-Based Digital Signature Algorithm)

Previously: SPHINCS+

**Signature Size:** 17,088 bytes (for NIST security level 1) — largest!

**Public Key Size:** 32 bytes

**Performance:** Slower signing and verification than ML-DSA

**Security Basis:** Collision-resistance of cryptographic hash functions — well-understood, no quantum weakness

**Advantages:**
- NIST included for "diversity" in quantum resistance
- Simplest security assumptions
- No lattice algebraic structure to potentially exploit
- Conservative choice

**Agent Integration Strategy:**

```
For time-sensitive agent operations:
  Use EdDSA (classical, fast)

For long-term archival of intent:
  Include ML-DSA signature
  Archive both EdDSA + ML-DSA proofs

Future-proof against quantum:
  Assume adversary can break EdDSA but not ML-DSA
  Ensure authorization bound to ML-DSA signature
```

---

## 3. Agent Authorization Protocols

Beyond individual signatures, **authorization protocols** enable agents to delegate permissions to other agents while proving they acted within scope.

### 3.1 Delegation Chains: From User to Agent to Agent

**Authorization Flow:**

```
User (human)
  ↓ Signs delegation token
Agent A (supervisor agent)
  ↓ Signs delegation token to Agent B
Agent B (executor agent)
  → Executes action with proof it's authorized
```

**Token Structure (User → Agent A):**

```json
{
  "iss": "did:key:user#key-123",
  "sub": "did:key:agent-a#key-456",
  "scope": ["read", "write"],
  "resource": ["database:*"],
  "exp": 1741420800,
  "iat": 1741334400,
  "sig": "user_signature_over_above_fields"
}
```

**Critical Property: Scope Narrowing**

Agent A cannot grant Agent B more permissions than Agent A has:

```
User authorizes Agent A: scope = {read, write, deploy}
Agent A grants Agent B:   scope = {read, write}
                                  (must be ⊆ Agent A's scope)
Agent B never has:        deploy (correctly narrowed)
```

**Verification at Execution:**

When Agent B executes, the system verifies:
```
1. sig(user_token) valid under user_pk
2. sig(agent_a_token) valid under agent_a_pk
3. agent_b_action ∈ scope specified in agent_a_token
4. All timestamps not expired
5. No circular delegation (agent shouldn't authorize user)
```

**Confused Deputy Problem Prevention:**

Without explicit delegation binding:
```
VULNERABLE:
  User authorizes: Agent B to read /home/user/data
  Agent B thinks: I'm authorized to read /home/user/data
  Admin token grants: Agent B to read /home/admin/data

  Agent B reads /home/admin/data (confused!)
  Attacker tricked Agent B into using admin token

SAFE (with explicit delegation):
  User token to Agent B: "You may read /home/user/data only"
  Each agent carries proof of who delegated what
  Agent B can only read /home/user/data (safe)
```

### 3.2 MACAROONS: Nested Caveats Authorization

**Overview:**

Macaroons are bearer tokens (like cookies) with cryptographic caveats that let the holder attenuate them. Developed by Google for distributed cloud authorization.

**Token Structure:**

```
Macaroon:
├─ Location: "https://auth.service.com"
├─ Identifier: "invoice-12345"
├─ HMAC signature (only service knows secret key)
└─ Caveats (can be chained)
```

**Caveat Addition Without Server:**

```
Original macaroon M₁:
  body = {id, loc, HMAC}

Add caveat locally (no server contact):
  caveat_plaintext = "user_id = alice"
  caveat_verification_key = hash(M₁.HMAC)
  caveat_hmac = HMAC(caveat_verification_key, caveat_plaintext)

New macaroon M₂:
  body = M₁ + [caveat_plaintext, caveat_hmac]
```

**Server Verification:**

```
Given M₂ and service secret key:
1. Verify M₁.HMAC under service_secret
2. For each caveat:
   - Derive verification key from previous HMAC
   - Verify caveat_hmac
   - Check caveat constraint satisfied
3. If all valid, accept request
```

**Caveat Types:**

1. **First-party caveats:** Constraints the bearer adds (expiry, user_id)
   ```
   "expiry < 2026-04-06"
   "action = read"
   "resource = /api/agents"
   ```

2. **Third-party caveats:** Cryptographic commitments requiring verification from other party
   ```
   "caveat_key_id = 789"
   "caveat_location = https://auth-service"
   "caveat_signature = ..."
   ```

**Agent Intent Example:**

```
User creates macaroon for Agent A:
  M = macaroon(id="agent-auth", key=user_secret)

Agent A adds caveats:
  M' = M + caveat("action = deploy")
      + caveat("resource = production-db")
      + caveat("expiry < 2026-03-07")

Agent A passes M' to Agent B:
  M'' = M' + caveat("agent_id = agent-b")

Agent B executes with M'' as proof
Service verifies entire chain of caveats
```

**Advantages:**
- **No server needed** to attenuate token
- **Offline delegation** possible
- **Cryptographically bound** caveats
- **Implicit revocation** via expiry caveat

### 3.3 BISCUIT: Public-Key Capability Tokens

**Difference from Macaroons:**

- **Macaroons:** Require shared secret key (symmetric crypto)
- **Biscuit:** Use public-key cryptography (asymmetric)

**Token Structure (Simplified):**

```
Biscuit Token:
├─ Authority block (issuer signs)
│  └─ Facts: role="agent-a", action=["read", "write"]
├─ Block 1 (agent-a signs)
│  └─ Rule: Allow if action="read" AND resource="/home/user"
├─ Block 2 (agent-b adds)
│  └─ Rule: Allow if action="read" AND agent_id="agent-b"
└─ Signature chain (cryptographically linked blocks)
```

**Key Concept: Datalog for Authorization**

```
// Authority issues:
role(agent_a, admin)
can_perform(admin, [read, write, deploy])

// Agent A constraints:
rule_1(user_id, resource) ←
  role(user_id, executor)
  AND can_perform(executor, write)
  AND resource.startswith("/user/home")

// Agent B further narrows:
rule_2(action) ←
  rule_1(_, _)
  AND action != deploy
```

**Verification:**

Verifier loads the biscuit and queries:
```
Query: authorized(agent_b, read, /user/home/data)?
       authorized(agent_b, deploy, /user/home/data)?

Answer: YES (read allowed under both rule_1 and rule_2)
        NO (deploy forbidden by rule_2)
```

**Advantages Over Macaroons:**
- **Public-key cryptography** (asymmetric)
- **Datalog-based policies** (Turing-incomplete, safe)
- **Fine-grained authorization** (not just flat caveats)
- **Rust-based implementation** (memory-safe)

### 3.4 UCAN: User-Controlled Authorization Networks

**Addressing OAuth 2.0 Limitations:**

OAuth designed for web browsers (user clicks "authorize"), not headless agents (no UI).

**UCAN Principles:**

1. **Trustless:** No auth server needed; verification via public keys
2. **Offline:** Create delegations without network access
3. **User-Controlled:** Users directly delegate, not through intermediary
4. **Decentralized:** No central authorization server

**Token Structure:**

```
UCAN:
├─ Issuer DID (user or delegating agent)
├─ Audience DID (recipient agent)
├─ Capabilities:
│  ├─ resource_id: "did:key:database-xyz"
│  ├─ ability: "crud/read"
│  └─ constraints:
│      └─ "expiry": 2026-03-07T00:00Z
├─ Proofs (delegation chain)
└─ Signature (issuer signs everything above)
```

**Delegation Chain:**

```
User (did:key:user-123)
  Capability: crud/* on database-xyz
  Signs UCAN(audience=agent-a)

Agent A (did:key:agent-a)
  Receives UCAN above as proof
  Creates new UCAN(audience=agent-b)
  Capability: crud/read on database-xyz (narrower!)
  Signs new token

Agent B verifies:
  1. Verify user's signature on first UCAN
  2. Verify agent-a's signature on delegation UCAN
  3. Agent-a's capability ⊇ agent-b's capability
  4. All timestamps valid
```

**Embedded in Verifiable Credential Format:**

UCANs are JSON-LD compatible with W3C Verifiable Credentials:

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "UCANDelegation"],
  "issuer": "did:key:user-123",
  "credentialSubject": {
    "audience": "did:key:agent-a",
    "capability": {
      "resource": "did:key:database-xyz",
      "ability": "crud/read"
    }
  },
  "proof": { "type": "Ed25519Signature2018", "signatureValue": "..." }
}
```

**Advantages:**

- **No central authority** required
- **Offline operation** (no server call to verify delegation)
- **Composable** (can build complex delegation chains)
- **Standardized** (uses DIDs and VC format)

---

## 4. Verifiable Computation: Proving Correct Execution

**Problem:** An agent claims it executed a specific program correctly. How to verify without re-running the program?

**Solution:** Zero-knowledge proofs of computation.

### 4.1 Incrementally Verifiable Computation (IVC)

**Use Case:**

A long-running task broken into steps:
```
Step 0: Initialize
Step 1: Process batch 1
Step 2: Process batch 2
...
Step 1000: Finalize

Traditional: Verify all 1000 steps (expensive)
IVC: Verify step-by-step incrementally (efficient)
```

**Nova: Folding-Based IVC**

**Core Innovation: Folding Schemes**

Instead of:
```
Prove: Computation(input) = output
```

Prove:
```
Fold(prev_proof, new_step) = new_proof
```

Each fold is a small proof that combines two instances into one.

**Mathematical Formulation:**

Given R1CS constraint system and two instances:
```
Instance 1: (x₁, w₁)  // public input, witness
Instance 2: (x₂, w₂)

Fold into: (x₃, w₃) where checking small equations on x₃, w₃
           implies both instances were valid
```

**Proof Size:**

- **Nova:** ~10,000 multiplication gates in verification circuit
- **Recursive SNARKs:** ~500,000+ gates (50x larger)

**Application to Agent Audit Trails:**

```
Agent executes 1000-step task:

Step 1 proof = prove(step_1_execution)      // ~200ms
Step 2 proof = fold(step_1_proof, step_2)   // ~50ms
Step 3 proof = fold(step_2_proof, step_3)   // ~50ms
...

Final proof = step_1000_proof
Size: ~1-2 KB (constant, not proportional to steps!)

Auditor verifies ~2 KB proof instead of re-executing 1000 steps
```

### 4.2 zkVM: Zero-Knowledge Virtual Machines

**Concept:**

Agent code runs inside a zkVM. At the end, produce a cryptographic proof:
"Program P executed correctly on input X, produced output Y"

**Three Major Implementations:**

#### RISC Zero (zk-STARK based)

```
Program: Any Rust/C/C++ targeting RISC-V
Architecture: RISC-V instruction emulation
Proof: zk-STARK using FRI protocol
Size: ~200 KB for typical programs
Proving Time: Seconds to minutes

Example:
  let agent_action = compute_safe_action(state);
  let receipt = guest::env::read();  // zkVM collects execution
  // Prover generates proof
  // Verifier checks: "Yes, compute_safe_action(state) = agent_action"
```

#### SP1 (Recent, GPU-optimized)

```
Proof System: STARK with GPU parallelization
Proving Speed: 10-100x faster than RISC Zero
Precompiles: Specialized circuits for Ethereum operations
  - Keccak hashing
  - Secp256k1 signing
  - Other expensive operations

Agent Use Case:
  Agent proves: "I verified this Ethereum signature correctly"
  Proof includes specialized circuit for secp256k1
  Verification: ~ms
```

#### Jolt (Newest, sumcheck-based)

```
Approach: Lookup arguments (Lasso) + sumcheck
Prover Speed: 5x faster than RISC Zero, 2x faster than SP1
Code Size: <25,000 lines Rust (vs. 500k+ for others)
Claim: Easier to audit and verify security

Implementation overhead: Still being optimized
```

**Agent Authorization via zkVM:**

```
Agent claims: "I executed deploy_service safely"

Code run in zkVM:
  pub fn safe_deploy(env: HostEnv) -> u32 {
    let config = env.load_config();  // sealed via zkVM
    let service = parse_deployment(env.input());

    assert!(validate_service(service));
    assert!(config.is_prod || env.is_testnet());

    deploy(service)
  }

Prover generates proof P:
  "safe_deploy executed correctly, returned 0 (success)"

Verifier:
  verify_proof(P) → YES or NO
  If YES, agent indeed executed safe_deploy correctly
  (Didn't skip validation, didn't check_prod assertion, etc.)
```

**Cost-Benefit:**

| Approach | Cost | Assurance |
|----------|------|-----------|
| Trust agent binary | $0 | Agent could have been hacked/modified |
| Replay agent execution | Hours | Slow, but auditable |
| zkVM proof | 10-60 sec + KB proof | Fast, cryptographically certain code executed correctly |

---

## 5. Multi-Agent Cryptographic Protocols

As agent networks grow, protocols for **secure agent-to-agent collaboration** without revealing private data become critical.

### 5.1 Secure Multi-Party Computation (MPC)

**Problem:**

Three agents need to compute a function over their data:
```
Agent A has: salary_a
Agent B has: salary_b
Agent C has: salary_c

Goal: Compute average = (salary_a + salary_b + salary_c) / 3
      Without any agent learning the others' salaries
```

**Garbled Circuits Approach:**

```
Agent A garbles a circuit for computing average:
  - Each wire has label 0 and label 1 (picked randomly)
  - Each gate encrypted so only with correct input labels
    can compute output labels

Agent A sends garbled circuit to B
Agent B sends garbled circuit to C
Agent C sends garbled circuit to A

Each agent provides their encrypted input
All agents collaboratively evaluate circuit
Output revealed only to authorized agent
```

**Algebraic MPC (Secret Sharing):**

Instead of circuits, use additive secret sharing:

```
Agent A wants to compute x_a + x_b + x_c

1. Agent A creates shares:
   s_a_a = random,  s_a_b = random,  s_a_c = x_a - s_a_a - s_a_b

   Sends s_a_b to Agent B, s_a_c to Agent C

2. Agents B and C similarly create and distribute shares

3. Computation phase:
   Agent A: Local sum of all s_*_a shares
   Agent B: Local sum of all s_*_b shares
   Agent C: Local sum of all s_*_c shares

   Sum of all local sums = x_a + x_b + x_c (each agent knows 1/3)

4. Reconstruct (if authorized):
   Three agents pool local sums to get result
```

**Security Guarantee:**

Even if two agents collude, they cannot learn the third's data (with honest-majority MPC).

### 5.2 Secret Sharing: Shamir's Scheme

**Problem:** Distribute secret key among N parties, any T can reconstruct, fewer than T cannot.

**Mathematical Construction:**

```
Secret: s = 1000 (e.g., signing key)
Threshold: t = 3 (need 3 out of 5)
Parties: N = 5

1. Create random polynomial of degree t-1:
   P(x) = s + a₁·x + a₂·x² + ... + a_{t-1}·x^{t-1}

   Where: P(0) = s (the secret)

2. Compute shares:
   share₁ = P(1)
   share₂ = P(2)
   share₃ = P(3)
   share₄ = P(4)
   share₅ = P(5)

3. Distribute share_i to party i (over secure channel)
```

**Reconstruction:**

```
Any 3 parties pool their shares, e.g., parties 1, 3, 5:

P(x) = P(1)·L₁(x) + P(3)·L₃(x) + P(5)·L₅(x)

Where L_i(x) = Lagrange basis polynomial

P(0) = shares[1]·L₁(0) + shares[3]·L₃(0) + shares[5]·L₅(0)
     = secret
```

**Security:**

```
2 parties (< 3) cannot reconstruct:
  They have 2 points on a degree-2 polynomial
  Many polynomials pass through 2 points
  All possible secrets equally likely (information-theoretic security)
```

**Agent Threshold Signing:**

```
Agent network requires 5-of-8 agents to approve deployment:

1. Setup phase:
   Admin creates key pair (pk, sk)
   Splits sk via Shamir into 8 shares
   Distributes to 8 agents

2. Signing request:
   Request arrives: "Deploy to production"

3. Agent cooperation:
   5 agents from the 8 provide their shares
   Using Shamir reconstruction: sk = reconstruct(5 shares)
   Sign: sig = sign(sk, deployment_hash)

4. Verification:
   Anyone verifies: sig against pk (without knowing sk!)

5. Security:
   Fewer than 5 agents cannot forge signature
   Private key never stored whole on any machine
```

### 5.3 Oblivious Transfer (OT)

**Problem:** Agent A has data [D₀, D₁], Agent B wants D_i but:
- Agent A shouldn't learn which D_i Agent B wants
- Agent B should only learn D_i, not the other

**1-out-of-2 Oblivious Transfer Protocol:**

```
Agent A (sender):
  D₀ = sensitive_data_0
  D₁ = sensitive_data_1

Agent B (receiver):
  Secret choice: c ∈ {0, 1}

Protocol:
  1. B generates random public key pair (pk_B, sk_B)

  2. B sends to A: commitment(pk_B) and encryption(pk_c, public_key_b)
     (A doesn't know which c was used)

  3. A encrypts both messages:
     msg₀_encrypted = E(pk₀, D₀)
     msg₁_encrypted = E(pk₁, D₁)

  4. B can only decrypt msg_c (knows sk_B)
     D_c = decrypt(sk_B, msg_c_encrypted)

  5. B learns nothing about D_{1-c}
     A learns nothing about c
```

**Concrete Application: Agent Cooperation**

```
Agent A: Supervised by human, knows safe_action_0, risky_action_1
Agent B: Autonomous, needs action recommendation

Agent B doesn't want to reveal its policy (proprietary)
Agent A doesn't want to reveal safe/risky classifications

Solution: OT-based secure action selection
  A recommends via oblivious transfer
  B chooses which action without revealing choice
  A never sees B's choice, B sees only one action
```

---

## 6. Standards and Emerging Specifications

### 6.1 Decentralized Identifiers (DIDs)

**W3C Standard (Approved July 2022):**

DIDs enable agents to have persistent, resolvable identities without central registry.

**DID Format:**

```
did:key:z6MkhaXgBZDvotDkL5257faWxcqACjJGtociuS1WqWmAn4t

Anatomy:
  did:        → Scheme (fixed)
  key:        → Method (determines resolution process)
  z6Mkha...   → Method-specific identifier
```

**DID Document (Resolves to):**

```json
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:key:z6Mkha...",
  "publicKey": [{
    "id": "did:key:z6Mkha...#key-1",
    "type": "Ed25519VerificationKey2018",
    "controller": "did:key:z6Mkha...",
    "publicKeyMultibase": "z6Mkha..."
  }],
  "authentication": ["did:key:z6Mkha...#key-1"],
  "assertionMethod": ["did:key:z6Mkha...#key-1"],
  "capabilityInvocation": ["did:key:z6Mkha...#key-1"]
}
```

**Agent Identity via DID:**

```
Agent A DID: did:key:z6MkagentA...
Agent A's DID Document lists:
  - Public key for signature verification
  - Authentication method
  - Capability invocation key (for delegations)
  - Service endpoint (where agent accepts requests)

Human verifies Agent A:
  1. Resolve did:key:z6MkagentA...
  2. Extract public key
  3. Verify any signatures from Agent A
  4. Trust Agent A's identity (derived from key, not registry)
```

### 6.2 Verifiable Credentials and Presentations

**W3C Standard for Agent Credentials:**

A Verifiable Credential is a tamper-proof statement:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://example.com/agent-credentials/v1"
  ],
  "type": ["VerifiableCredential", "AgentCapability"],
  "issuer": "did:key:z6Mkissuer...",
  "issuanceDate": "2026-03-06T00:00:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkagentB...",
    "capability": {
      "resource": ["database:production-db"],
      "action": ["read", "write"],
      "constraint": {
        "expiry": "2026-03-13T00:00:00Z",
        "scope": "daily_reports_only"
      }
    }
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "verificationMethod": "did:key:z6Mkissuer...#key-1",
    "signatureValue": "mAJp4ZWxNQ..."
  }
}
```

**Verifiable Presentation (Agent Proves Authorization):**

```json
{
  "@context": "https://www.w3.org/2018/credentials/v1",
  "type": "VerifiablePresentation",
  "verifiableCredential": [
    { /* AgentCapability credential above */ }
  ],
  "holder": "did:key:z6MkagentB...",
  "proof": {
    "type": "Ed25519Signature2020",
    "verificationMethod": "did:key:z6MkagentB...#key-1",
    "challenge": "nonce-12345",
    "domain": "example.com"
  }
}
```

**Flow:**

```
1. Issuer (human/admin) creates VerifiableCredential
2. Signs credential under their DID
3. Agent B receives and stores credential
4. Agent B needs to prove authorization:
   - Creates VerifiablePresentation
   - Includes the credential
   - Adds signed proof from own DID
5. Verifier:
   - Checks issuer signature on credential
   - Checks Agent B's signature on presentation
   - Verifies credential not expired
   - Checks Agent B identity (challenge-response prevents replay)
```

### 6.3 FIDO Alliance Standards

**FIDO2 / WebAuthn:**

Passwordless, public-key based authentication. While designed for humans, principles apply to agents.

**Agent Authenticator (Conceptual):**

```
Agent registration:
  1. Agent generates key pair
  2. Public key sent to service
  3. Service stores: agent_id → public_key

Agent authentication:
  1. Service sends challenge: random nonce
  2. Agent signs: sig = sign(private_key, challenge)
  3. Agent sends: (agent_id, challenge, sig)
  4. Service verifies: verify(public_key, challenge, sig)

Security:
  - Private key never sent
  - Challenge prevents replay
  - Each login uses different challenge
```

**Integration with Decentralized Identity:**

```
Agent DID: did:key:z6MkagentA...
Register authenticator:
  credentialId: agent_public_key_hash
  credentialPublicKey: DID document public key

Authenticate:
  Challenge ← Service
  Signature ← Agent (using private key from DID)
  Service resolves Agent DID, verifies signature
```

### 6.4 Emerging: Agent Payments Protocol (AP2)

**Concept (From Google Cloud, Mastercard, Others):**

Cryptographic proof of human intent before agent acts.

**Intent Binding:**

```
Human specifies intent:
  "Agent X may spend up to $100/day on cloud services"

Intent → Cryptographic digest:
  intent_hash = hash(
    agent_id ||
    action ||
    budget ||
    time_window ||
    nonce
  )

Human signs: sig = sign(user_sk, intent_hash)

This creates an unforgeable, tamper-proof authorization
```

**Mandates (AP2 Terminology):**

```json
{
  "mandate_id": "mandate-12345",
  "user_id": "user@example.com",
  "agent_id": "agent-payment-approver",
  "intent": {
    "action": "approve_payment",
    "limit_usd": 100,
    "time_window": "daily",
    "merchant_category": ["cloud-services"]
  },
  "intent_hash": "sha256...",
  "signature": "user_signature_over_intent",
  "timestamp": "2026-03-06T12:00:00Z",
  "expiry": "2026-04-06T12:00:00Z"
}
```

**Verification at Execution:**

```
Agent claims: "I'm approving payment $99 to AWS"

Service checks:
  1. Recover user_id from mandate signature
  2. Verify action_type matches mandate (approve_payment ✓)
  3. Verify amount <= limit ($99 <= $100 ✓)
  4. Verify merchant category (cloud-services ✓)
  5. Verify timestamp not expired (2026-03-06 < 2026-04-06 ✓)
  6. Log: mandate-12345 used for $99 transaction

Result: Payment approved with cryptographic proof user intended it
```

### 6.5 OATH Protocol

**Open Protocol for Verifiable Human Intent**

Vision: Local-first, offline-capable, no central authority.

**Goals:**

1. **Cryptographic Proof:** Human's signature binds authorization
2. **Fine-Grained:** Specific actions, resources, constraints
3. **Offline:** No real-time server verification required
4. **Revocable:** Humans can revoke agent permissions
5. **Auditable:** Complete chain of decisions preserved

**Implementation Direction (Emerging):**

```
Foundation: Combine
  - Commitment schemes (bind intent)
  - Digital signatures (prove authorization)
  - DIDs (identify agents)
  - Verifiable credentials (encode authorization)
  - Delegation chains (agent-to-agent scope narrowing)

Result: Agent carries cryptographic proof of what it's authorized to do
```

---

## 7. CAPTHCA Integration: Signed Intent Architecture

### 7.1 Proposed "Signed Intent" Mechanism

**Intent Commitment Phase:**

```
Human specifies agent task:
  Action: "Deploy service X to staging"
  Constraints:
    - resource: staging-environment
    - time_limit: 5 minutes
    - approval: requires agent-supervisor sign-off

Agent computes intent hash:
  intent_commitment = hash(
    action ||
    resource ||
    time_limit ||
    constraints ||
    timestamp ||
    nonce
  )
```

**Commitment Proof:**

```
Human signs the commitment:
  commitment_sig = sign(
    user_sk,
    intent_commitment
  )

Agent receives:
  (intent_commitment, commitment_sig, user_pk)

Agent stores: locked into commitment
  Cannot execute different action later
  Cannot extend time limit
  Proof auditable by third parties
```

**Execution Phase:**

```
Agent executes in zkVM:

  def execute_deployment():
    env = load_env()
    assert(env.intent_hash == stored_intent_hash)
    assert(now < stored_time_limit)
    assert(agent_supervisor_approved())

    deploy_service(service_x, staging_environment)
    return SUCCESS

Prover generates proof:
  "execute_deployment ran correctly, returned SUCCESS"
  Proof size: <1 MB
  Proof time: 30-60 seconds
```

**Verification & Audit:**

```
Verifier/Auditor has:
  1. intent_commitment (hash of what was authorized)
  2. commitment_sig (human's signature)
  3. zkVM_proof (execution was correct)
  4. action_result (service deployed successfully)

Verification steps:
  ✓ Check commitment_sig valid under user_pk
  ✓ Check zkVM_proof valid
  ✓ Reconstruct intent from execution transcript
  ✓ Verify intent_commitment == hash(intent_from_transcript)
  ✓ Confirm: human signed what agent executed
```

### 7.2 Delegation Chain: User → Agent A → Agent B

**Scenario:**

```
User: "Agent A, deploy to staging"
Agent A: "Agent B, execute the deployment"
Agent B: Executes in zkVM
```

**Cryptographic Proof Chain:**

```
Step 1: User → Agent A
  intent_1 = hash(action: deploy, resource: staging, agent_id: A)
  sig_user = sign(user_sk, intent_1)
  → Agent A receives (intent_1, sig_user)

Step 2: Agent A → Agent B (scope narrowing!)
  intent_2 = hash(
    action: deploy,
    resource: staging,
    agent_id: B,
    constraints: [no_network_access, no_secret_files],
    delegated_from: sig_user  // References user's authorization
  )
  sig_a = sign(agent_a_sk, intent_2)
  → Agent B receives (intent_2, sig_a, intent_1, sig_user)

Step 3: Agent B executes
  zkvm_proof = prove_execution(intent_2)
  → System verifies:
    1. sig_user valid (user authorized something)
    2. sig_a valid (agent A delegated to B)
    3. intent_2 consistent with intent_1 (narrowed correctly)
    4. zkvm_proof shows execution matched intent_2
```

**Post-Quantum Resilience:**

```
For long-term authorization audit trails:

Include both:
  - EdDSA signature (fast, classical)
  - ML-DSA signature (slow, quantum-resistant)

Archive both signatures
In future: assume EdDSA broken by quantum computer
Still have ML-DSA proof user signed authorization
```

---

## 8. Security Considerations

### 8.1 Key Compromise

**Risk:** Agent's private key stolen or leaked.

**Mitigation:**

1. **Threshold Signing:** Agent's key split via Shamir, no single theft.
2. **Key Rotation:** Regular renewal of agent signing keys.
3. **Time-Bounded Keys:** Shorter validity periods reduce damage window.
4. **Hardware Security Modules (HSM):** Private key never leaves secure hardware.

### 8.2 Commitment Collision Attack

**Risk (Hash-Based):** Attacker finds two different intents with same hash.

**Probability:** 2^-128 with SHA-256 (negligible)

**Defense:** Use cryptographically strong hash (SHA-256, SHA-3).

### 8.3 Front-Running and Replay Attacks

**Front-Running Risk:** Attacker intercepts authorization, changes intent slightly.

**Defense:**
- Include timestamp in commitment (intent expires)
- Include nonce (one-time use)
- Include agent ID (specific to this agent)

**Replay Risk:** Attacker replays old authorization multiple times.

**Defense:**
- Timestamp + expiry
- Sequence number (first use only)
- Challenge-response (each execution uses new challenge)

### 8.4 Delegation Explosion

**Risk:** Too many delegation hops blur responsibility.

```
User → Agent A → Agent B → Agent C → Agent D
↓      ↓        ↓        ↓        ↓
Harder to audit who did what
Agent A not responsible for C's actions?
```

**Defense:**
- Limit delegation depth (max 3 hops)
- Explicit delegation approvals
- Clear audit trail of each hop
- Each agent logs their delegations

### 8.5 Quantum Computing Threat

**Timeline:** Uncertain (5-20+ years for cryptographically relevant quantum computers).

**Defense for CAPTHCA:**

1. **Immediate:** Include ML-DSA signatures alongside EdDSA
2. **Storage:** Archive quantum-resistant proofs indefinitely
3. **Transition:** Migrate new authorizations to PQC-only as quantum threat increases
4. **Assumption:** Even if ECDSA breaks in future, ML-DSA signature proves user issued authorization

---

## 9. Mathematical Notation Summary

| Notation | Meaning |
|----------|---------|
| `G, H` | Elliptic curve generators |
| `C = x·G + r·H` | Pedersen commitment |
| `P(x)` | Polynomial of degree d-1 |
| `e(·, ·)` | Bilinear pairing (for BLS) |
| `sign(sk, msg)` | Signature under private key sk |
| `verify(pk, msg, sig)` | Verify signature under public key pk |
| `hash(data)` | Cryptographic hash (SHA-256, etc.) |
| `s ⊆ s'` | Capability s is subset of (more restrictive than) s' |
| `(t, n)-threshold` | t out of n parties can execute; fewer than t cannot |
| `FHE` | Fully Homomorphic Encryption |
| `MPC` | Secure Multi-Party Computation |
| `IVC` | Incrementally Verifiable Computation |
| `zkVM` | Zero-Knowledge Virtual Machine |

---

## 10. References and Sources

### Commitment Schemes

- [Commitment scheme - Wikipedia](https://en.wikipedia.org/wiki/Commitment_scheme)
- [Commitments - Mina book](https://o1-labs.github.io/proof-systems/fundamentals/zkbook_commitment.html)
- [What are Pedersen Commitments and How They Work | RareSkills](https://rareskills.io/post/pedersen-commitment)
- [Stanford University Topics in Cryptography (CS 355) Lecture #3](https://crypto.stanford.edu/cs355/23sp/lec3.pdf)
- [KZG Polynomial Commitments | ZKDocs](https://www.zkdocs.com/docs/zkdocs/commitments/kzg_polynomial_commitment/)
- [KZG polynomial commitments | Dankrad Feist](https://dankradfeist.de/ethereum/2020/06/16/kate-polynomial-commitments.html)
- [Hash-Based Commitment Scheme - Cyphertalk](https://muens.io/hash-based-commitment-scheme/)

### Digital Signatures

- [EdDSA - Wikipedia](https://en.wikipedia.org/wiki/EdDSA)
- [Comparing SSH Keys: RSA, DSA, ECDSA, or EdDSA?](https://goteleport.com/blog/comparing-ssh-keys/)
- [EdDSA and Ed25519 | Practical Cryptography for Developers](https://cryptobook.nakov.com/digital-signatures/eddsa-and-ed25519)
- [BLS digital signature - Wikipedia](https://en.wikipedia.org/wiki/BLS_digital_signature)
- [Schnorr vs. ECDSA - Alin Tomescu](https://alinush.github.io/schnorr-vs-ecdsa)
- [Post-Quantum Cryptography: Additional Digital Signature Schemes | CSRC](https://csrc.nist.gov/projects/pqc-dig-sig)
- [NIST Releases First 3 Finalized Post-Quantum Encryption Standards | NIST](https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards)

### Authorization Protocols

- [Macaroons: Cookies with Contextual Caveats](https://theory.stanford.edu/~ataly/Papers/macaroons.pdf)
- [Biscuit, the foundation for your authorization systems | Clever Cloud](https://www.clever.cloud/blog/engineering/2021/04/12/introduction-to-biscuit/)
- [UCAN - User Controlled Authorization Network](https://ucan.xyz/)
- [UCAN Working Group · GitHub](https://github.com/ucan-wg)
- [User Controlled Authorization Network (UCAN) Specification | UCAN](https://ucan.xyz/specification/)
- [On-Behalf-Of authentication for AI agents: Secure, scoped, and auditable delegation](https://www.scalekit.com/blog/delegated-agent-access)
- [Authenticated Delegation and Authorized AI Agents](https://arxiv.org/html/2501.09674v1)

### Verifiable Computation

- [Incrementally verifiable computation: NOVA](https://blog.lambdaclass.com/incrementally-verifiable-computation-nova/)
- [Nova: Recursive Zero-Knowledge Arguments from Folding Schemes](https://eprint.iacr.org/2021/370)
- [SuperNova: Proving universal machine executions without universal circuits](https://eprint.iacr.org/2022/1758.pdf)
- [GitHub - risc0/risc0: RISC Zero is a zero-knowledge verifiable general computing platform](https://github.com/risc0/risc0)
- [GitHub - succinctlabs/sp1: SP1 is a zero-knowledge virtual machine](https://github.com/succinctlabs/sp1)
- [Building Jolt: A fast, easy-to-use zkVM - a16z crypto](https://a16zcrypto.com/posts/article/building-jolt/)

### Multi-Party Cryptography

- [Secure multi-party computation - Wikipedia](https://en.wikipedia.org/wiki/Secure_multi-party_computation)
- [Multi-Party Computation (MPC): Secure, Private Collaboration - Cyfrin](https://www.cyfrin.io/blog/multi-party-computation-secure-private-collaboration)
- [Secure Multiparty Computation (MPC) - Yehuda Lindell](https://eprint.iacr.org/2020/300.pdf)
- [Shamir's secret sharing - Wikipedia](https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing)
- [Threshold cryptosystem - Wikipedia](https://en.wikipedia.org/wiki/Threshold_cryptosystem)
- [AgentCrypt: Advancing Privacy and Secure Computation in AI Agent Collaboration](https://eprint.iacr.org/2025/2216.pdf)

### Decentralized Identity & Standards

- [A Primer for Decentralized Identifiers](https://w3c-ccg.github.io/did-primer/)
- [Decentralized Identifiers (DIDs) v1.0](https://www.w3.org/TR/did-1.0/)
- [Decentralized Identifiers (DIDs) v1.1](https://www.w3.org/TR/did-1.1/)
- [Verifiable Credentials Overview](https://www.w3.org/TR/vc-overview/)
- [Verifiable Presentation Request v2024](https://w3c-ccg.github.io/vp-request-spec/)
- [FIDO Alliance - Wikipedia](https://en.wikipedia.org/wiki/FIDO_Alliance)
- [FIDO Alliance: Reducing Reliance on Passwords](https://fidoalliance.org/)

### Agent Authorization (Emerging)

- [How Verifiable Intent builds trust in agentic AI commerce](https://www.mastercard.com/us/en/news-and-trends/stories/2026/verifiable-intent.html)
- [GitHub - oath-protocol/oath-protocol: Open protocol for cryptographically verifiable human intent](https://github.com/oath-protocol/oath-protocol)
- [What is the Agent Payments Protocol (AP2) and How Does It Work?](https://www.descope.com/learn/post/ap2)
- [Agent-to-agent OAuth: a guide for secure AI agent connectivity with MCP](https://stytch.com/blog/agent-to-agent-oauth-guide/)
- [OAUTH IS NOT ENOUGH Authorization Challenges for Autonomous AI Agents - TechRxiv](https://www.techrxiv.org/users/928372/articles/1299852-oauth-is-not-enough-authorization-challenges-for-autonomous-ai-agents)
- [OAuth 2.0 Extension: On-Behalf-Of User Authorization for AI Agents](https://datatracker.ietf.org/doc/html/draft-oauth-ai-agents-on-behalf-of-user-01)

---

## 11. Conclusion: Path Forward for CAPTHCA

The foundation for CAPTHCA's **Signed Intent** mechanism exists across multiple mature cryptographic primitives:

1. **Commitment Schemes** (Pedersen, KZG) bind intent at issuance
2. **Digital Signatures** (EdDSA primary, ML-DSA for quantum resilience) prove authorization
3. **Delegation Protocols** (UCAN, BISCUIT) enable agent-to-agent scope narrowing
4. **Verifiable Computation** (Nova IVC, zkVMs) prove correct execution
5. **Standards** (DIDs, Verifiable Credentials) provide interoperability

**Recommended Architecture:**

```
Layer 1: Intent Binding
  - Human signs cryptographic commitment to intent
  - EdDSA signature + ML-DSA for quantum-safety

Layer 2: Delegation Chain
  - Credentials encoded as W3C VerifiableCredentials
  - Scope narrowing across agent hops
  - DIDs identify each party

Layer 3: Execution Proof
  - Agent executes in zkVM (RISC Zero or SP1)
  - Generates execution proof
  - Proof size < 1 MB regardless of computation length

Layer 4: Audit Trail
  - Commitment signature
  - Delegation chain (all hops)
  - Execution proof
  - Action transcript
  → Auditor can verify months/years later
  → Proof persists even if agent is deleted
```

This architecture provides cryptographic certainty that humans remain in control of agent actions while enabling autonomous, decentralized agent networks.

---

**Document Generated:** 2026-03-06
**Research Scope:** Comprehensive technical foundations for CAPTHCA agent authorization
**Next Steps:** Implementation of commitment scheme substrate and signature integration

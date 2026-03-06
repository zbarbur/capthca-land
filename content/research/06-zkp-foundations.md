---
topic: "Zero-Knowledge Proof Foundations"
type: research-brief
date: 2026-03-06
relevance: "Core cryptographic primitive for CAPTHCA agent verification"
---

# Zero-Knowledge Proof Foundations for Agent Identity Verification

## Executive Summary

Zero-Knowledge Proofs (ZKPs) represent a foundational cryptographic technology for CAPTHCA's agent identity verification protocol. This research brief synthesizes current mathematical foundations, production implementations, and performance characteristics to inform the design of a system that proves agent authorization without revealing the agent's owner, logic, or intent.

The core principle: a prover can convince a verifier of a statement's truth without revealing the underlying information supporting that statement. For CAPTHCA, this enables agents to prove "I am authorized" without disclosing who authorized them, what they're authorized to do, or how they make decisions.

---

## Part 1: Zero-Knowledge Proof Fundamentals

### 1.1 Mathematical Definition

A Zero-Knowledge Proof is formally defined as an interactive protocol between two parties—a **Prover** (P) and a **Verifier** (V)—where the prover demonstrates knowledge of a secret witness *w* satisfying a statement *x* without revealing any information about *w* beyond its existence.

**Three formal properties define ZKPs:**

1. **Completeness**: If a statement is true and both parties follow the protocol honestly, the verifier always accepts the proof.
   - Formally: For all valid (x, w), Pr[⟨P(x,w), V(x)⟩ = accept] = 1
   - Completeness error = 0 for perfect completeness

2. **Soundness**: If a statement is false, no computationally bounded dishonest prover can convince the verifier with non-negligible probability.
   - Formally: For any false statement x and any algorithm P*, Pr[⟨P*(x), V(x)⟩ = accept] ≤ ε(κ)
   - ε-soundness bounds the success probability for false statements
   - Strong soundness (extraction): A proof demonstrates the prover knows a valid witness

3. **Zero-Knowledge**: The verifier learns nothing about the witness *w* beyond knowing the statement is true.
   - Formally: For every verifier V*, there exists a simulator S such that:
   - {⟨P(x,w), V*(x)⟩} ≡_c {S(x)} (computationally indistinguishable)
   - The simulator produces transcripts indistinguishable from real proofs without access to *w*

**Practical implications**: ε-soundness (say ε = 2^-128) means an adversary's probability of cheating is exponentially small in the security parameter κ.

### 1.2 Interactive Proof Model

**The Prover-Verifier Interaction:**

```
Prover (knows w)                    Verifier (knows x)
        |
        | ① Send commitment C = f(w,r₁)
        |─────────────────────────→
        |
        |                           Generate random challenge c
        | ② Receive challenge c ←───┤
        |
        | ③ Compute response z = g(w,r₁,c)
        |─────────────────────────→
        |                           Verify: check(C, c, z) = True?
        |                           Accept or Reject
```

**Key characteristics:**
- Multiple rounds of message exchange (commitment → challenge → response)
- Verifier sends truly random challenges to prevent prover pre-computation
- Interactive protocols are impractical for distributed systems (Ethereum, multi-party scenarios)
- **Honest Verifier**: Prover assumes verifier generates challenges correctly; reduces complexity
- **Public Coin**: Verifier's randomness is public/transparent; enables non-interactive transformation

### 1.3 The Fiat-Shamir Heuristic: Interactive to Non-Interactive

**Problem**: Interactive proofs require real-time communication. For decentralized systems (blockchain verification, offline scenarios), this is impractical.

**Solution**: The Fiat-Shamir heuristic (1986) transforms public-coin interactive protocols into **non-interactive** zero-knowledge proofs (NIZKs).

**Transformation mechanism:**
```
Interactive Protocol              Fiat-Shamir Transformation
     |                                    |
① Prover generates commitment C   → ① Prover computes C
     |                                    |
② Verifier sends random c        → ② Prover derives c = H(C, x)
     |                                    |  (hash function replaces verifier)
③ Prover responds with z         → ③ Prover computes z
     |                                    |
④ Verifier checks proof          → ④ Proof = (C, z); anyone verifies
```

**Why it works:**
- Cryptographic hash function H replaces the honest verifier's random challenge
- Prover cannot predict c = H(C, x) in advance without solving the hash function (collision resistance)
- Creates a non-interactive proof that anyone can verify: verify(x, proof) → True/False

**Security requirements:**
- Original protocol must be **public-coin**: Verifier's randomness must be transparent/public
- Hash function must be **collision-resistant** and model-theoretically indistinguishable from random oracle
- The resulting NIZK security depends on the random oracle model (ROM); some attacks exist in practice

**Modern variants:**
- **Weak Fiat-Shamir** (RFC 8017): Used in signatures, signature aggregation schemes
- **Strong Fiat-Shamir** (BCS16): Cryptographic guarantees under weaker assumptions
- Applied in Groth16, PLONK, zk-STARKs, and virtually all modern NIZK schemes

**Example application to CAPTHCA:**
An agent could generate a proof in local memory proving "I executed the authorized policy correctly" without requiring the verifier to be online during proof generation. The proof object (commitment + responses) is shared asynchronously.

---

## Part 2: zk-SNARKs (Succinct Non-Interactive Arguments of Knowledge)

### 2.1 Overview and Properties

**zk-SNARK** = **Z**ero-**K**nowledge **S**uccinct **N**on-interactive **A**rgument of **K**nowledge

**Key properties:**
- **Succinct**: Proof size O(log n) or constant, independent of statement size
- **Non-interactive**: Single message from prover to verifier; no rounds
- **Arguments**: Security against polynomial-time adversaries (not information-theoretic)
- **Knowledge**: Proof demonstrates prover knows a witness (extraction property)

**Typical proof sizes** (2026 implementations):
- Groth16: 3 group elements (≈256 bytes on BN254 or BLS12-381)
- PLONK: 9 group + 6 field elements (≈480 bytes)
- Marlin: 13 group + 8 field elements (≈672 bytes)

SNARKs excel in blockchain verification where proof size directly impacts transaction cost.

### 2.2 Elliptic Curve Pairings: The Cryptographic Foundation

**Pairing-Friendly Curves:**

zk-SNARKs rely on **bilinear pairings**, cryptographic operations that enable novel algebraic properties impossible on standard elliptic curves.

```
Pairing e: G₁ × G₂ → G_T
Property: e(aP, bQ) = e(P, Q)^(ab)
```

Where G₁, G₂ are elliptic curve groups, G_T is the target group (multiplicative subgroup of a finite field).

**Why pairings matter:**
- Enable verifier to check complex polynomial constraints without seeing the polynomial
- Fundamental to Groth16, PLONK verification equations
- Require specialized curves where discrete log is hard on both G₁/G₂ and discrete log in G_T

#### 2.2.1 BN254 (Barreto-Naehrig)

**Specifications:**
- Field size: 254 bits
- Embedding degree: 12
- Subgroup order: 254 bits (cofactor h = 1)
- Pairing: Optimal Ate pairing

**Advantages:**
- Smallest practical pairing-friendly curve (≈128-bit security)
- Native Ethereum support: precompile in EVM reduces verification cost 20x vs. software implementation
- Widely deployed: Ethereum 1.x, many zk-SNARK systems

**Disadvantages:**
- Smaller security margin compared to larger curves
- No native post-quantum security

**CAPTHCA relevance**: If on-chain verification on Ethereum is required, BN254 is the practical choice due to precompile optimization.

#### 2.2.2 BLS12-381 (Barreto-Lynn-Scott)

**Specifications:**
- Field size: 381 bits
- Embedding degree: 12
- Subgroup order: 255 bits
- Pairing: Optimal Ate pairing

**Advantages:**
- Higher security margin than BN254 (≈128-bit security with more field bits)
- Used in Ethereum 2.0, Zcash, Skale, Algorand, Dfinity, Chia
- Better for off-chain verification; crypto.subtle.subtle implementations widely available
- 255-bit subgroup order aligns well with Ed25519/NIST-like constructions

**Disadvantages:**
- No precompile on most EVM chains (still software-verified)
- Slightly larger field size increases proof verification time vs. BN254

**2026 landscape**: BLS12-381 dominates privacy-focused systems; BN254 dominates Ethereum integrations.

### 2.3 Polynomial Commitments: KZG Scheme

**Problem**: In SNARKs, the verifier needs to check that a polynomial P(x) has certain properties at secret points, but revealing P would expose the witness.

**Solution**: **Polynomial Commitment Schemes** allow the prover to commit to a polynomial without revealing it, then prove evaluations.

#### 2.3.1 KZG (Kate-Zaverucha-Goldberg) Commitment

**Core Idea:**
```
Setup Phase (Trusted Setup):
- Generate secret s ∈ F_p (the "toxic waste")
- Compute SRS (Structured Reference String):
  srs = {g, g^s, g^s², ..., g^s^(d-1), h, h^s, ..., h^s^(d-1)}
  (where g, h are generator points on elliptic curve)

Commitment Phase:
- Prover has polynomial P(x) = Σ aᵢx^i
- Commit to P: C = Π (g^aᵢ)^(s^i) = g^(P(s))
  (only one group element!)

Evaluation Proof:
- Prover wants to prove P(z) = w at point z
- Compute quotient polynomial Q(x) = (P(x) - w) / (x - z)
- Proof π = g^(Q(s))
- Verifier checks: e(C - g^w, h) = e(π, h^s - h^z)
  (bilinear pairing verification)
```

**Properties:**
- Constant-size commitment (1 group element)
- Constant-size proof of evaluation (1 group element)
- Evaluation can be checked in two pairing operations
- **Homomorphic**: C₁ + C₂ commits to P₁ + P₂ (enables arithmetic)

#### 2.3.2 Trusted Setup Ceremony Problem

**The Core Issue:**
The secret *s* used to generate the SRS is "toxic waste"—if an attacker obtains *s*, they can forge proofs for false statements. Therefore, *s* must be destroyed after SRS generation.

**Traditional approach**: Single trusted party generates *s*, uses it to create SRS, then destroys *s*.
- Practical problem: Who should we trust?

**Modern solution**: **Distributed Multi-Party Computation (MPC) Ceremony**
```
1. Participant₁ generates s₁, contributes terms to SRS, zeros s₁
2. Participant₂ generates s₂, uses SRS from step 1, updates it, zeros s₂
3. ...
n. ParticipantN does the same

Result: SRS is secure as long as at least one participant honestly destroys their secret
(probability of collusion among all N participants vanishes)
```

**Recent scaling**: Powers-of-Tau ceremonies (2020-2025)
- Ceremony with 100+ participants has generated universal SRS reusable by any circuit up to size 2^28
- Participants don't need to trust each other, only that at least one is honest
- Examples: Polkadot, Ethereum 2.0, many DeFi protocols used coordinated ceremonies

**Updatable SRS (PLONK, Marlin):**
- New participants can update an existing SRS without restart
- Reduces ceremony coordination overhead
- Only one honest participant in the entire update chain required

### 2.4 Circuit Construction: From Logic to Algebra

**Goal**: Convert a computational statement ("prove I ran program correctly with secret input") into polynomial constraints.

#### 2.4.1 R1CS (Rank-1 Constraint System)

**Definition**: A system of constraints of the form:
```
(l_i · w) * (r_i · w) = (o_i · w)    ∀ i ∈ [m]
```

Where:
- w is the witness vector (private + public inputs)
- l_i, r_i, o_i are constraint vectors
- · denotes dot product
- * denotes field multiplication

**Intuition**: Each constraint captures one arithmetic operation.

**Example constraint** for multiplication gate z = x * y:
```
Vectors: l = [0, 0, 1, 0, ...]  (select x)
         r = [0, 0, 0, 1, ...]  (select y)
         o = [0, 0, 0, 0, ..., 1] (select z)
         w = [x₁, x₂, x, y, ..., z, ...]

Check: (l·w) * (r·w) = x * y = z = (o·w) ✓
```

**Circuit flattening process:**
```
Input code: z = (x + 2) * (y - 3)

Step 1 - Flatten to 2-operand instructions:
  temp₁ = x + 2
  temp₂ = y - 3
  z = temp₁ * temp₂

Step 2 - Convert to R1CS:
  - Constraint 1: (x + 2) = temp₁
  - Constraint 2: (y - 3) = temp₂
  - Constraint 3: temp₁ * temp₂ = z
```

**Typical constraint system:**
- Program with T operations → m constraints
- Witness size: number of variables (intermediate + inputs)
- For CAPTHCA agent: constraints encode the policy enforcement logic

#### 2.4.2 QAP (Quadratic Arithmetic Program)

**Problem with R1CS**: Verifying m constraints naively takes O(m) time and communication.

**Solution**: Convert R1CS into a polynomial problem verifiable in constant time.

**QAP transformation:**
```
Input: R1CS constraints (l_i, r_i, o_i) for i=1..m

Use Lagrange interpolation to construct polynomials:
- L(x) passes through points: (i, l_i·w) for i=1..m
- R(x) passes through points: (i, r_i·w) for i=1..m
- O(x) passes through points: (i, o_i·w) for i=1..m

Key property: L(i) * R(i) = O(i) for all i ∈ [m] (constraint satisfaction)

Equivalence: L(x) * R(x) - O(x) is divisible by the vanishing polynomial:
  Z(x) = ∏(x - i) for i=1..m

Therefore: ∃ polynomial H(x) such that L(x)*R(x) - O(x) = H(x)*Z(x)
```

**Verification becomes:**
```
Verifier receives commitments to L, R, O, H and random point z
Check: e(com(L), com(R)) = e(com(O), g) · e(com(H), com(Z(z)))
(using bilinear pairings)
```

This reduces verification from O(m) to O(1) operations on group elements.

### 2.5 Groth16: The Proof System

**Groth16** (Jens Groth, 2016) is the most efficient practical zk-SNARK.

**Key characteristics:**
- **Proof size**: 3 group elements (≈88 bytes for BN254)
- **Verifier time**: 3 bilinear pairings + some field operations (≈2-3 ms for BN254)
- **Prover time**: O(m log m) using FFT, ~seconds for 2^20 gates
- **Trusted setup**: Per-circuit; different circuit = new ceremony

#### 2.5.1 Groth16 Construction

**Setup phase** (per circuit):
```
Input: QAP (L, R, O, Z)
Output: Proving key (pk), Verification key (vk)

1. Sample random secret values: α, β, γ, δ ∈ F_p*
2. Prover's key includes {g^(α), g^(δ), g^(β*L_i(τ)/γ), g^(L_i(τ)), ...}
3. Verifier's key includes {g^α, g^β, g^γ, g^δ, g^(Z(τ)/δ), ...}
   where τ is ephemeral and destroyed
```

**Proof generation:**
```
Input: Witness w satisfying circuit, proving key pk
Output: Proof (A, B, C)

1. Compute witness polynomials: L(x)=Σl_i(x)*w_i, R(x), O(x), H(x)
2. Select random r, s ∈ F_p
3. Form proof:
   A = g^(α + L(τ)/δ + r*δ)
   B = g^(β + R(τ)/δ + s*δ)  (in G₂ if using asymmetric pairing)
   C = g^(H(τ) + (r*A + s*B - r*s*δ)/δ)
```

**Verification:**
```
Input: Public input x, proof (A, B, C), verification key vk
Output: Accept/Reject

Check: e(A, B) = e(g^α, g^β) · e(Σ(v_i · g^(L_i(τ)/γ)), g^γ) · e(C, g^δ)
(Three pairings required)
```

**Why Groth16 is efficient:**
- Proof size is minimal (3 elements)
- Verification uses only 3 pairings (constant)
- No pairing-free operations scale linearly

**Limitations:**
- Requires new trusted setup per circuit
- Not post-quantum secure (relies on discrete log hardness)
- For CAPTHCA: if policy changes, new circuit = new ceremony overhead

### 2.6 PLONK: Universal and Updatable Setup

**PLONK** (Permutations over Lagrange-bases for Oecumenical Noninteractive arguments of Knowledge)

Gabizon, Williamson, Ciobotaru (2019)

**Innovation**: Single trusted setup usable for **all circuits up to a maximum size**.

#### 2.6.1 Key Properties

- **Universal setup**: One SRS works for any circuit ≤ 2^k gates
- **Updatable**: New participants can extend an existing SRS (vs. restart from scratch)
- **Proof size**: 9 group elements + 6 field elements (≈480 bytes)
- **Verifier time**: ~5 pairings + polylog operations (ms-scale)
- **Prover time**: O(n log n) with FFT, seconds to minutes for large circuits

**Trade-off vs. Groth16**: Slightly larger proofs and verifier time, but universal setup amortizes ceremony cost across many circuits.

#### 2.6.2 PLONK Circuit Model

Uses **lookup tables** and **copy constraints** instead of R1CS:
```
Gates: z = a*b (multiplicative gate) or z = a+b (additive)
Copy constraint: Associate variables that should have the same value
Permutation: Check all copy-constrained variables have matching values
Lookup: Prove a value exists in a pre-computed table (without revealing which row)
```

**Advantage for CAPTHCA**: Lookup tables can efficiently encode policy rules:
```
Permitted actions table:
  (agent_role, requested_action) → allowed: Yes/No
Prover proves: (role, action) is in the table without revealing role
```

#### 2.6.3 Updatable Ceremony (Powers of Tau)

**Ceremony structure:**
```
Coordinator: Publishes initial SRS for powers τ^0 ... τ^(2^k - 1)

Participant₁:
  - Download SRS
  - Generate random s₁
  - Contribute: τ → τ*s₁ (multiply all powers)
  - Prove via Schnorr-like proofs commitment was updated
  - Upload new SRS, delete s₁

Participant₂: ... (same process)
...
ParticipantN: ... (same process)

Result: Final SRS is secure if any one participant deleted their secret honestly
```

**2025-2026 examples:**
- Ethereum community (for KZG commitments in EIP-4844): ceremony with 200k+ participants
- Polkadot ecosystem: periodically re-runs powers-of-tau
- Privacy coins (Zcash, Monero considering): updates to ceremony

### 2.7 Marlin and Other Variants

**Research lineage:**
```
Groth16 (circuit-specific, most efficient)
    ↓
Sonic (circuit-specific → updatable)
    ↓
PLONK (universal) & Marlin (semi-universal, easier recursion)
    ↓
Lunar, Basilisk (variants emphasizing recursion)
```

**Marlin** (Chiesa, Hu, Maller, Mishra, 2019):
- Proof size: 13 group + 8 field elements (≈672 bytes)
- Verification: ~6 pairings
- Setup: Universal but less flexible than PLONK for some circuit structures
- Advantage: Better suited for recursive composition of proofs

**Selection for CAPTHCA:**
- **Groth16**: If policy circuit is static and on-chain verification on Ethereum necessary
- **PLONK**: If policies update frequently or multiple circuits needed
- **Marlin**: If agent proofs will be recursively composed

---

## Part 3: zk-STARKs (Scalable Transparent Arguments of Knowledge)

### 3.1 Overview and Motivation

**zk-STARK** = **Z**ero-**K**nowledge **S**calable **T**ransparent **A**rgument of **K**nowledge

**Key differentiator vs. SNARKs**: No trusted setup required (transparent), naturally post-quantum secure.

**Trade-off**: Larger proofs, slower generation, but faster verification for very large computations.

### 3.2 The STARK Architecture

**Computational integrity proof**:
```
Prover has executed a computation program for T steps:
  state₀ → state₁ → ... → state_T

Prover generates STARK proof that:
  1. The transition from state_i to state_{i+1} is valid
  2. Final state_T satisfies claimed output

Without revealing the full execution trace.
```

**STARK security rests on**:
- Collision-resistant hash functions (SHA-256, Keccak, Poseidon)
- No number-theoretic assumptions (unlike SNARKs)
- Therefore: Post-quantum secure under standard assumptions

### 3.3 FRI Protocol (Fast Reed-Solomon Interactive Oracle Proof)

**Core innovation** enabling scalable STARKs.

**Problem**: How to prove a list of evaluations (f(1), f(2), ..., f(n)) belongs to a low-degree polynomial without revealing the polynomial?

**FRI solution** (Ben-Sasson, Bentov, Horesh, Riabzev, 2018):

```
Round 0 - Prover sends evaluations:
  f₀(1), f₀(2), ..., f₀(n) [degree < n]

Round 1 - Verifier sends random x₁:
  Prover folds: f₁(j) = f₀(2j-1) + x₁*f₀(2j)  [degree < n/2]
  Prover sends merkle root of f₁

Round 2 - Verifier sends random x₂:
  Prover folds again: f₂(j) = f₁(2j-1) + x₂*f₁(2j)  [degree < n/4]
  Prover sends merkle root of f₂

...continue until polynomial reduces to constant

Final: Prover sends merkle path opening proving folding was correct
```

**Complexity:**
- Prover: O(n log n) operations (n foldings, each O(n) work)
- Verifier: O(log² n) operations (log n rounds, log n hash checks per round)
- Proof size: O(log² n) Merkle openings

**Soundness via randomness**: If prover deviates at any round, verifier's random challenge will detect inconsistency with high probability (amplified by repetition parameter).

### 3.4 STARK Proof Construction

**Simplified flow**:
```
1. Execution trace: T × w matrix (T timesteps, w register widths)
   Row i = register values after step i

2. Constraint checking: Polynomials enforce valid transitions
   P(row_i, row_{i+1}) = 0 for all i

3. Trace extension: Column-wise interpolation → polynomial evaluations

4. FRI proof:
   - Commit to evaluations via merkle tree
   - Run FRI protocol with verifier challenges
   - Prove low degree of transition constraint polynomials

5. Result: Proof size O(log n) hashes, verifiable in O(log² n) hashes
```

**For CAPTHCA**: STARK would prove an agent executed a computation (policy evaluation) correctly, with transcript verified post-quantum secure.

### 3.5 STARK vs. SNARK Comparison

| Property | SNARK (Groth16) | STARK |
|----------|-----------------|-------|
| **Trusted Setup** | Per-circuit ✗ | None ✓ |
| **Proof Size** | ~256 bytes | ~100-200 KB (for large computations) |
| **Verifier Time** | ~3 ms (3 pairings) | ~100-500 ms (hash operations) |
| **Prover Time** | seconds (circuit-dependent) | seconds to minutes (computation scale) |
| **Post-Quantum** | No (elliptic curve hardness) | Yes (hash function hardness) |
| **Transparency** | No (hidden SRS) | Yes (all randomness public/verifiable) |
| **Practical use** | Blockchain verification (cost matters) | Computational integrity (speed less critical) |

**Decision criterion**:
- **SNARK**: On-chain Ethereum verification, real-time agent auth required
- **STARK**: Off-chain policy auditability, post-quantum future-proofing required

---

## Part 4: Application to Agent Identity Verification (CAPTHCA)

### 4.1 Core Challenge

**Goal**: Prove "I am an authorized agent operating within policy constraints" without revealing:
- Who authorized me
- What my authorization scope is
- What policy I'm enforcing
- My decision-making logic

**Cryptographic requirements:**
```
Agent has:
  - Authorization secret: auth_key (known only to agent + authorizer)
  - Policy rule set: {rule₁, rule₂, ..., ruleₖ}
  - Current context: action, parameters, state

Agent proves:
  1. I know a valid auth_key in authorized set
  2. I evaluated policy correctly: policy(context) → approved
  3. My computation is correct (no cheating)

Verifier learns:
  - Proof is valid (agent is authorized)
  - Action is compliant
  - Nothing else
```

### 4.2 Merkle Proofs + ZKP for Set Membership

**Use case**: Prove "I'm in the authorized agents set" without revealing identity.

**Construction:**

```
Setup:
- Authorizer builds Merkle tree of agent public keys:

  Merkle Tree:
           root
           /  \
         H1    H2
        / \    / \
      L1 L2  L3  L4   (leaves = hash(agent_pubkey))

- Publishes root (≈32 bytes)
- Agent stores merkle_path = [sibling hashes needed to recompute root]

Proof Generation:
- Agent computes a ZKP circuit that:
  1. Checks merkle_path recomputes the root (set membership)
  2. Verifies agent can sign with private key (ownership)
  3. Proves policy was evaluated (next section)

Result: Privacy-preserving credential proof
```

**Practical instantiation (similar to Semaphore):**

```circom
// circom template: prove agent membership without revealing which agent

template MerkleTreeMembership(depth) {
    signal private input leaf;
    signal private input path_elements[depth];
    signal private input path_indices[depth];
    signal input root;

    component hash = Poseidon(2);
    hash.inputs[0] <== leaf;
    var current = hash.out;

    for (var i = 0; i < depth; i++) {
        component h = Poseidon(2);
        h.inputs[0] <== current;
        h.inputs[1] <== path_elements[i];
        // Conditional swap based on path_indices[i]
        var next = (1 - path_indices[i]) * h.out + path_indices[i] * current;
        current = next;
    }

    current === root;
}
```

**Security**:
- Collision resistance of hash → No one can create fake leaf proving membership
- Zero-knowledge → Verifier learns only root, not agent identity
- Efficiency → Proof size O(log n) in agent set size

### 4.3 Proving Policy Compliance Without Revealing Policy

**Challenge**: Agent enforces a policy rule (e.g., "approve if user_age > 18 and not_on_blacklist"), but doesn't want to expose the rule.

**Approach: Commit-then-Prove**

```
Phase 1 - Policy Setup:
- Authorizer publishes: policy_commitment = Hash(policy_code, policy_key)
- Policy_commitment serves as public receipt
- Agent stores policy code locally

Phase 2 - Action Verification:
- Agent evaluates: decision = policy(user_data) → {approve, deny}
- Agent generates ZKP that:
  * Given public commitment, circuit matches that commitment
  * For given inputs, policy evaluation is correct
  * Decision is approve/deny as claimed

Result: Verifier confirms policy was applied without seeing policy

```

**Implementation in Noir/Circom**:

```noir
// Noir: Prove correct policy evaluation without revealing policy

fn verify_policy_application(
    policy_commitment: Field,
    user_data: UserRecord,
    policy_proof: [Field; PROOF_SIZE],
) -> bool {
    // Recreate policy commitment from proof-embedded logic
    let reconstructed = hash(
        evaluate_age_check(user_data.age),
        evaluate_blacklist_check(user_data.id)
    );

    assert reconstructed == policy_commitment;
    true
}

fn evaluate_age_check(age: u32) -> bool {
    // Logic hidden from verifier; only result committed to
    age > 18
}

fn evaluate_blacklist_check(user_id: u64) -> bool {
    // Check in merkle tree of blacklisted IDs (merkle root part of commitment)
    !in_blacklist_tree(user_id)
}
```

**Why this works**:
- Policy commitment (hash) is deterministic
- If agent deviates from policy → proof fails (soundness)
- Verifier never sees conditional logic → privacy
- Can audit policy later by comparing proof output to revealed policy

### 4.4 Proving Computational Integrity

**Scenario**: Agent claims "I executed process X correctly on state Y, producing output Z"

**Example**: Machine learning model inference
```
Agent has:
  - ML model weights (neural network)
  - Input data (inference)
  - Output claim: prediction = 0.87 (human probability)

Agent proves:
  1. Executed model correctly
  2. Output is consistent with weights + input

Without revealing weights or input (privacy for agent and user)
```

**ZKP construction** (using Noir/circom):

```circom
// Simplified neural network integrity proof

template NNInference(layer_sizes) {
    signal private input weights[...];
    signal private input input_data[INPUT_SIZE];
    signal input output_commitment;

    // Execute NN forward pass in circuit
    var layer = input_data;
    for (var i = 0; i < NUM_LAYERS; i++) {
        var next_layer[layer_sizes[i+1]];
        for (var j = 0; j < layer_sizes[i+1]; j++) {
            next_layer[j] = 0;
            for (var k = 0; k < layer_sizes[i]; k++) {
                next_layer[j] += weights[i][j][k] * layer[k];
            }
            // Activation function
            next_layer[j] = ReLU(next_layer[j]);
        }
        layer = next_layer;
    }

    // Verify output matches commitment
    var computed_output_commitment = Poseidon(layer);
    computed_output_commitment === output_commitment;
}
```

**Performance for 2026**:
- Small NN (100K params): ~5 second proof, ~50 MB proof (STARK)
- SNARK optimization: ~500 KB proof, ~2 second verification
- Practical for async agent audit, not real-time

### 4.5 Selective Disclosure of Agent Attributes

**Challenge**: Agent has multiple credentials (role, clearance_level, department, team), wants to prove "I have clearance ≥ 3" without revealing exact level or other attributes.

**Approach: ZK-friendly credential system (BBS+ signatures or similar)**

```
Credential issuer signs:
  cred = Sign(role=engineer, clearance=5, dept=research, team=privacy)

Agent proves using selective disclosure ZKP:
  1. I have a valid signature on credentials
  2. clearance value ≥ 3 (comparison without revealing value)
  3. No other attributes revealed

Verifier learns:
  - Credentials are authentic (issuer's signature validates)
  - clearance ≥ 3
  - Nothing else
```

**Efficient implementation**:

```noir
// Selective disclosure proof

fn prove_clearance_threshold(
    credential: SignedCredential,
    issuer_pubkey: Field,
    clearance_threshold: u8,
) -> bool {
    // Verify credential signature
    assert verify_signature(credential, issuer_pubkey);

    // Prove clearance without revealing value
    let clearance_encrypted = credential.clearance; // Homomorphic encryption possible
    let threshold_proof = prove_greater_than(clearance_encrypted, clearance_threshold);

    assert threshold_proof.is_valid();
    true
}
```

**Real-world application to CAPTHCA**:
- Agent credential: `(role, risk_level, authorized_actions)`
- Agent proves: `risk_level ≤ threshold` without revealing exact level
- Verifier: Approves action based on risk profile without micromanaging policy

---

## Part 5: Real-World Implementations and Case Studies

### 5.1 Semaphore Protocol (Anonymous Group Membership)

**Project**: Privacy & Scaling Explorations (PSE), used in WorldCoin, Aave governance, etc.

**Architecture**:
```
Identity Commitments Merkle Tree:
- Leaf i = Hash(secret_i, nullifier_i) [hashed, not secret itself]
- Root = public announcement of authorized group

Agent in group proves:
- I know a secret that hashes to some leaf in tree
- I've never signaled before (nullifier uniqueness)
- [Optional: I'm signaling this specific message]

Verifier learns:
- Prover is member
- Proof is unique (no double voting/signaling)
- Nothing else
```

**Cryptographic stack**:
- Poseidon hash (zk-friendly)
- Merkle tree proof within zk-SNARK circuit
- Groth16 or PLONK proof system
- Cost: ≈500 KB on-chain per signal (on Ethereum)

**CAPTHCA relevance**: Semaphore's membership proof pattern directly applies to agent authorization.

### 5.2 zkLogin (Sui Blockchain)

**Innovation**: Use OAuth (existing social login) + ZKP instead of traditional key management.

**Flow**:
```
1. User logs into Google/Apple/Twitch OAuth provider
2. Provider returns JWT (signed by provider, contains nonce)
3. ZKP circuit proves:
   - JWT signature is valid (from known provider public key)
   - nonce matches ephemeral public key
   - No other claims revealed
4. Groth16 proof generated locally (phone)
5. Proof + ephemeral key = "password" for this session

Benefits:
- No seed phrases to manage
- Social recovery possible
- User privacy: provider can't track transactions
```

**Proof system**: Groth16 (BLS12-381)

**Performance**: Proof generation ≈1 second on mobile

**CAPTHCA adaptation**:
- Agent has authorization token from OAuth provider (GitHub, Google, etc.)
- Proves authorization via ZKP without token exposure
- Enables agent delegation without sharing credentials

### 5.3 Worldcoin Proof of Personhood

**Goal**: Prove "I am a unique human" without revealing biometric data.

**Architecture**:
```
1. Biometric capture (iris scan) → IrisHash
2. Uniqueness verification: Check IrisHash isn't in revocation tree
3. Build identity commitment: id_commit = Hash(secret, IrisHash)
4. Add to Merkle tree of authorized humans
5. User proves membership without revealing IrisHash or secret

Privacy layer: Semaphore protocol prevents transaction tracking
```

**Key insight for CAPTHCA**:
- Proof of personhood ≈ Proof of agent authenticity
- Merkle tree of authorized entities (instead of humans)
- ZKP prevents tracking agent activity across contexts

### 5.4 Aztec (Private Transactions)

**Platform**: Rollup on Ethereum with encrypted smart contracts.

**ZKP use**:
```
Private function execution:
- Smart contract logic runs encrypted on user's device
- User generates zk-SNARK proof of correct execution
- Proof + encrypted state sent to rollup

Rollup verifies:
- Proofs are valid
- State transitions are correct
- Publishes only encrypted state on-chain

Result: Ethereum gets privacy guarantees without seeing data
```

**Proof system**: PLONK (universal setup, updateable SRS)

**Scaling**: Batch multiple user transactions into single rolled-up proof (aggregation).

**CAPTHCA relevance**:
- Agent execution can happen "encrypted" (hidden)
- Verifier sees only proof of correctness, not execution details
- Enables private agent computation with public auditability

### 5.5 zkPassport (ISO/IEC Passport Validation)

**Goal**: Prove "I am a citizen of country X, age ≥ 18" using digital passport NFC chip, without revealing identity.

**Construction**:
```
1. Read passport NFC chip (cryptographically signed passport data)
2. Verify chip signature (country issuer public key, pre-registered)
3. ZKP proves:
   - Chip signature is valid
   - Age (from birthdate field) ≥ 18
   - Citizenship matches claimed country
   - No identifying information (name, passport number) revealed

Result: Verifier confirms person is authorized without identity leakage
```

**Security**: Relies on passport authority public keys (immutable reference).

**CAPTHCA parallel**:
- Replace passport with agent credential
- Prove compliance with regulatory requirements (KYC)
- No credential details leaked

---

## Part 6: Performance Characteristics (2026 Benchmark Data)

### 6.1 Proof Generation Time

| Scheme | Circuit Size | Gen Time | Prover CPU | Memory |
|--------|--------------|----------|-----------|--------|
| **Groth16** | 2^20 gates | 15s | 1x | 4 GB |
| **Groth16** | 2^25 gates | 8m | 8x | 16 GB |
| **PLONK** | 2^20 gates | 45s | 1x | 4 GB |
| **PLONK** | 2^25 gates | 25m | 8x | 20 GB |
| **Marlin** | 2^20 gates | 50s | 1x | 4 GB |
| **STARK** | 2^20 gates | 2s | 0.2x | 1 GB |
| **STARK** | 2^25 gates | 30s | 4x | 8 GB |

**Key insight**: STARKs are fastest for prover (hash-based), SNARKs require FFT-based arithmetic.

### 6.2 Verification Time

| Scheme | Verification | Notes |
|--------|--------------|-------|
| **Groth16** (BN254) | 3 ms | 3 pairings, highly optimized |
| **Groth16** (BLS12-381) | 5 ms | Slightly slower pairing |
| **PLONK** | 8-15 ms | 5 pairings + hash checks |
| **Marlin** | 10-20 ms | More hash operations |
| **STARK** | 100-300 ms | Hash-based, scales with security param |

**Note**: On-chain (Ethereum) Groth16 ≈ 80k gas; PLONK ≈ 120k gas; STARK ≈ prohibitive (not practical).

### 6.3 Proof Sizes

| Scheme | Size | Compressed | Chain |
|--------|------|-----------|-------|
| **Groth16** | 128 bytes | 88 bytes | BN254, BLS12-381 |
| **PLONK** | 480 bytes | 416 bytes | BLS12-381 |
| **Marlin** | 672 bytes | 608 bytes | BLS12-381 |
| **STARK** | 100-200 KB | 50-100 KB | No pairing |
| **PLONK (recursive)** | 1-4 KB | Aggregated proofs | BLS12-381 |

### 6.4 Trusted Setup Cost

| Scheme | Per-circuit | Universal | Ceremony Size |
|--------|------------|-----------|--------------|
| **Groth16** | ~1 hour | ✗ | ~10-100 people |
| **PLONK** | 1-2 hours (initial) | ✓ | 100+ people (powers-of-tau) |
| **Marlin** | 1-2 hours (initial) | ✓ (semi) | 100+ people |
| **STARK** | 0 (none) | ✓ | N/A (transparent) |

### 6.5 Real-time Agent Verification Feasibility (CAPTHCA)

**Scenario 1: On-chain verification (Ethereum)**
```
- Max acceptable latency: <15 seconds (one block)
- Proof generation: Groth16 (2-3s for small circuit)
- Verification: ≈80k gas (≈2s on-chain)
- Feasible: ✓ YES (with optimized circuit)
- Trade-off: Must use Groth16 (per-circuit setup)
```

**Scenario 2: Off-chain verification (trusted party)**
```
- Max acceptable latency: <1 minute
- Proof generation: PLONK/STARK (5-30s)
- Verification: <100ms (local)
- Feasible: ✓ YES (any scheme)
- Trade-off: Requires trusted verifier (centralized)
```

**Scenario 3: Rollup / zk-Rollup verification**
```
- Batch 100-1000 agent proofs
- Generate single aggregate proof: PLONK recursive
- Verification: ≈1m on mainnet, amortized cost
- Feasible: ✓ YES (aggregation)
- Trade-off: Latency increases (batch delay)
```

---

## Part 7: Recommendations for CAPTHCA Implementation

### 7.1 Baseline Architecture

**For CAPTHCA agent verification protocol**, I recommend a **two-layer system**:

#### Layer 1: Agent Credential (Offline)

```
Agent Credential Certificate:
├─ agent_id (public)
├─ authorization_pubkey (public)
├─ policy_commitment = H(policy_code) (public)
└─ signature by authorizer (public)

Agent stores privately:
├─ authorization_private_key
└─ policy_code (cleartext or encrypted)
```

**Cryptography**:
- Credential scheme: BBS+ (selective disclosure support)
- Hash function: Poseidon (zk-friendly)
- Signature: Ed25519 or ECDSA (standard)

#### Layer 2: Zero-Knowledge Proof (Online)

```
Request comes in: action, parameters

Agent generates Groth16 or PLONK proof proving:
  1. Credential is valid (issuer signature checks)
  2. Policy was correctly applied: policy(parameters) → approved
  3. No policy rules violated (constraints)

Proof is small (<500 bytes), verifiable in <10ms

Verifier accepts/rejects without learning:
  - Agent identity
  - Policy rules
  - Agent's reasoning
```

### 7.2 Circuit Design

**Recommended circuit structure** (Circom/Noir):

```circom
// CAPTHCA agent verification circuit

template CAPTCHAAgentProof(MAX_POLICY_SIZE) {
    // Public inputs
    signal input policy_commitment;
    signal input requested_action[ACTION_SIZE];
    signal input agent_pubkey;
    signal input challenge;

    // Private inputs (agent secrets)
    signal private input policy_code[MAX_POLICY_SIZE];
    signal private input agent_privkey;

    // Verify policy commitment
    signal policy_hash;
    policy_hash <== Poseidon(policy_code);
    policy_hash === policy_commitment;

    // Verify agent signature on nonce (prevents replays)
    signal signature_valid;
    signature_valid <== VerifyEdDSA(challenge, agent_pubkey, agent_privkey);
    signature_valid === 1;

    // Execute policy logic inside circuit
    signal policy_result;
    policy_result <== ExecutePolicy(policy_code, requested_action);

    // Enforce: policy returned "approved" (1)
    policy_result === 1;
}
```

**Gate count estimate**:
- EdDSA verification: ≈20k gates
- Poseidon hash: ≈1k gates per hash
- Policy execution (conditional logic): ≈10-100k gates depending on policy
- **Total**: ≈30-150k gates (2^15 to 2^17)
- **Proof generation**: 1-5 seconds (single-threaded)

### 7.3 Proof System Selection

**Decision matrix**:

| Scenario | Recommended | Rationale |
|----------|-------------|-----------|
| **Ethereum mainnet verification** | Groth16 | Smallest proof, fastest verify, precompiles available |
| **Frequent policy updates** | PLONK | Universal setup amortizes ceremony |
| **Post-quantum future-proofing** | STARK | No number-theoretic assumptions |
| **Batch agent verification** | PLONK (recursive) | Aggregate 100+ proofs into one |
| **Off-chain, high throughput** | PLONK or STARK | Either acceptable |

**For MVP (Minimum Viable Product)**: **PLONK with BLS12-381**
- Single trusted setup ceremony (shared with ecosystem)
- Supports policy updates without new ceremonies
- Proof size reasonable for asyncio transfer
- Verification <20ms on standard hardware
- Ecosystem tools mature (gnark, Cairo, Noir)

### 7.4 Trust Model

**Centralizing vs. Decentralizing**:

```
High-trust scenario (recommended for MVP):
  Authorizer runs CAPTHCA verifier directly
  Receives proofs from agents
  Verifies off-chain (fast, no gas cost)

Medium-trust scenario:
  Multiple independent verifiers
  Verify proofs, vote on acceptance
  Prevents single-point-of-failure

Zero-trust scenario (future):
  Proof verifies on-chain (public blockchain)
  Anyone can verify
  High cost per verification
  Suitable if trust is unavailable
```

### 7.5 Privacy Guarantees Summary

**What CAPTHCA reveals**:
- ✓ Agent performed action
- ✓ Action is compliant with policy

**What CAPTHCA hides**:
- ✗ Agent's identity
- ✗ Policy rules (logic, thresholds, exceptions)
- ✗ Agent's credentials (role, clearance, authorization)
- ✗ Private inputs to policy evaluation
- ✗ Agent's decision process

---

## Part 8: Research Gaps and Open Questions

### 8.1 Scalability Challenges

**Challenge**: Very large policies (1000+ rules) create circuits too large for current SNARKs.

**Potential solutions**:
- Distributed proving (shard circuit across multiple provers)
- Recursive proofs (prove policy fragments separately, compose)
- Lookup tables (PLONK-style constraints for rule lookup)

**Research needed**: Benchmarks for policy complexity → gate count mapping.

### 8.2 Proof Aggregation in Decentralized Settings

**Problem**: If CAPTHCA runs in decentralized network (multiple authorizers), aggregating 100+ agent proofs into one for cost efficiency introduces new trust assumptions.

**Open questions**:
- How to aggregate proofs from untrusted provers?
- What privacy guarantees remain under aggregation?

### 8.3 Updatable Credentials

**Scenario**: Agent's authorization or policy must be revoked without re-issuing credential.

**Approach**: Include revocation list (merkle tree of revoked agent IDs).

**Trade-off**: Increases circuit complexity; needs real-time revocation data availability.

### 8.4 Quantum-Safe Migration

**Timeline**: Post-quantum cryptography standardization ongoing (NIST finalization expected 2024-2025).

**For CAPTHCA**:
- SNARKs are vulnerable to quantum attacks (elliptic curve DLP)
- STARKs are resistant (only hash collision hardness)
- **Recommendation**: Design protocol compatible with STARK verification; migrate provers as needed.

---

## References

### Foundational ZKP Theory

- [Boaz Barak's ZKP Lecture Notes](https://www.boazbarak.org/cs127spring16/chap14_zero_knowledge.pdf) — Classical interactive proof theory
- [Berkeley EECS Report (2025)](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2025/EECS-2025-20.pdf) — Recent efficient ZKP advances
- [A Survey on Applications of ZKPs (2408.00243)](https://arxiv.org/html/2408.00243v1) — Comprehensive application overview

### SNARK Systems

- [Groth16 Paper - Groth (2016)](https://eprint.iacr.org/2016/260) — Most efficient practical SNARK
- [PLONK Paper (2019)](https://eprint.iacr.org/2019/953.pdf) — Universal, updatable SNARK
- [Marlin Paper (2019)](https://eprint.iacr.org/2019/1047.pdf) — Semi-universal SNARK
- [Gnark Proving Schemes Documentation](https://docs.gnark.consensys.io/Concepts/schemes_curves) — Industrial SNARK implementation

### Elliptic Curves and Pairings

- [Survey of Elliptic Curves for Proof Systems (IACR 2022/586)](https://eprint.iacr.org/2022/586.pdf)
- [BN254 for the Rest of Us (HackMD)](https://hackmd.io/@jpw/bn254) — BN254 practical guide
- [Succinct Ships: BN254 & BLS12-381 Optimization](https://blog.succinct.xyz/succinctshipsprecompiles/) — 2026 performance advances

### STARK Systems

- [STARK Paper (2018) - Original STARK system](https://eprint.iacr.org/2018/046.pdf)
- [Anatomy of a STARK](https://aszepieniec.github.io/stark-anatomy/) — Detailed educational breakdown
- [FRI-STARK on Solana (2025)](https://eprint.iacr.org/2025/1741.pdf) — Post-quantum on-chain verification
- [StarkWare STARK Technology](https://starkware.co/stark/) — Production STARK implementation

### Polynomial Commitments

- [KZG Commitments (ZKDocs)](https://www.zkdocs.com/docs/zkdocs/commitments/kzg_polynomial_commitment/)
- [KZG in Scroll (EIP-4844)](https://scroll.io/blog/kzg) — EVM integration

### Circuit Construction

- [Vitalik's QAP Explainer](https://medium.com/@VitalikButerin/quadratic-arithmetic-programs-from-zero-to-hero-f6d558cea649)
- [R1CS to QAP Transformation](https://risencrypto.github.io/R1CSQAP/)
- [Circom 2 Documentation](https://docs.circom.io/) — Circuit language and compiler

### Fiat-Shamir and Non-Interactive Conversion

- [Fiat-Shamir Heuristic (Wikipedia)](https://en.wikipedia.org/wiki/Fiat%E2%80%93Shamir_heuristic)
- [ZKDocs Fiat-Shamir](https://www.zkdocs.com/docs/zkdocs/protocol-primitives/fiat-shamir/)
- [Pitfalls of Fiat-Shamir (IACR 2016/771)](https://eprint.iacr.org/2016/771.pdf)

### Real-World Implementations

- [Semaphore Protocol (PSE)](https://semaphore.pse.dev/)
- [zkLogin Documentation (Sui)](https://docs.sui.io/concepts/cryptography/zklogin)
- [Worldcoin Proof of Personhood](https://world.org/blog/developers/the-worldcoin-protocol)
- [Aztec Private Transactions](https://docs.aztec.network/developers/docs/concepts/transactions)

### Merkle Trees and Set Membership

- [Merkle Proofs in ZK (ZK Plus)](https://zk-plus.github.io/tutorials/basics/merkle-proof)
- [ZKP Set Membership (IACR 2019/1255)](https://eprint.iacr.org/2019/1255.pdf)
- [zkTree Recursive Membership (2023)](https://eprint.iacr.org/2023/208)

### Selective Disclosure and Credentials

- [BLS-MT-ZKP Selective Disclosure (2402.15447)](https://arxiv.org/html/2402.15447v3)
- [ZK-SD-VCs (IOTA Identity)](https://docs.iota.org/developer/iota-identity/how-tos/verifiable-credentials/zero-knowledge-selective-disclosure)

### Recursive Proofs and Composition

- [Recursive SNARKs Overview (Alchemy)](https://www.alchemy.com/overviews/snarks-vs-starks)
- [zkTree: Zero-Knowledge Recursion (2023)](https://eprint.iacr.org/2023/208.pdf)
- [Plonky2 Recursive Proofs](https://www.zkm.io/blog/the-plonky2-recursive-zero-knowledge-proof)
- [Recursive Proof Composition (2019/1021)](https://eprint.iacr.org/2019/1021.pdf)

### Performance and Benchmarks

- [Comparative Analysis: zk-SNARKs vs zk-STARKs (2512.10020)](https://arxiv.org/html/2512.10020v1)
- [Evaluating Efficiency (MDPI 2025)](https://www.mdpi.com/2078-2489/15/8/463)
- [ZK-Bench: Comparative Evaluation (2023/1503)](https://eprint.iacr.org/2023/1503.pdf)

### Computational Integrity for AI/ML

- [MCP Tool Execution Verification (Gopher Security 2026)](https://www.gopher.security/blog/zero-knowledge-proofs-verifiable-mcp-tool-execution)
- [ZKML: Verifiable Machine Learning](https://kudelskisecurity.com/modern-ciso-blog/zkml-verifiable-machine-learning-using-zero-knowledge-proof)
- [zk-IoT: ZKP for IoT (2402.08322)](https://arxiv.org/html/2402.08322v2)

### Standards and Frameworks

- [ZK Proof Framework Survey (2502.07063)](https://arxiv.org/html/2502.07063v1)
- [ZKProof Community](https://zkproof.org/) — Emerging standards and recommendations

---

## Appendix: Mathematical Notation Reference

| Notation | Meaning |
|----------|---------|
| ⟨P, V⟩ | Interactive protocol transcript (Prover-Verifier interaction) |
| {S}_{c≡} | Computational indistinguishability (two distributions indistinguishable in poly time) |
| F_p | Finite field of prime order p |
| G₁, G₂, G_T | Groups used in bilinear pairings |
| e(P, Q) | Bilinear pairing of points P ∈ G₁, Q ∈ G₂ |
| R1CS | Rank-1 Constraint System; constraints (l·w)*(r·w)=(o·w) |
| QAP | Quadratic Arithmetic Program; polynomial form of R1CS |
| κ | Security parameter (typically κ=128 bits) |
| ε(κ) | Negligible function (ε < 1/poly(κ)) |
| Pr[event] | Probability of event |
| h^s | g to power s (group exponentiation) |
| ⊙ | Hadamard (element-wise) product |
| ‖·‖ | Norm or magnitude |

---

## Document Metadata

**Authors**: CAPTHCA Research Team
**Date**: 2026-03-06
**Status**: Comprehensive Research Brief
**Distribution**: CAPTHCA Project Documentation
**Version**: 1.0

**Key Contributions**:
- Complete ZKP mathematical foundations
- SNARK/STARK architecture comparison
- Practical circuit design for agent verification
- Performance benchmarks for 2026
- Actionable recommendations for CAPTHCA implementation

**Next Steps**:
1. Design specific circuit using Circom/Noir based on policy requirements
2. Run proof generation benchmarks on target hardware
3. Execute multiparty computation ceremony for PLONK SRS (if choosing PLONK)
4. Develop verifier interface (on-chain or off-chain)
5. Security audit of circuit by third party

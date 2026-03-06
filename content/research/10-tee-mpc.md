---
topic: "Trusted Execution Environments & Secure Multi-Party Computation"
type: research-brief
date: 2026-03-06
relevance: "Foundation for Cognitive Privacy guarantee in CAPTHCA"
---

# Trusted Execution Environments & Secure Multi-Party Computation for Private Agent Execution

## Executive Summary

Cognitive privacy—ensuring an agent's internal reasoning cannot be observed or extracted—requires a multi-layered cryptographic and hardware-based approach. This research synthesizes three foundational technology families:

1. **Trusted Execution Environments (TEEs)**: Hardware-isolated execution spaces that protect data and computation from all software layers, including the operating system and hypervisor
2. **Secure Multi-Party Computation (MPC)**: Cryptographic protocols enabling multiple parties to compute jointly while keeping individual inputs private
3. **Homomorphic Encryption (FHE)**: Encryption allowing computation on ciphertexts without decryption

Together, these technologies form a "belt and suspenders" approach to agent cognitive privacy. TEEs provide fast, hardware-backed isolation; MPC enables distributed trust; FHE enables computation on encrypted data without keys being present during execution.

---

## Part 1: TEE Fundamentals

### 1.1 Intel Software Guard Extensions (SGX)

**Overview**: Intel SGX is a set of security instructions for x86 processors that creates isolated execution environments called enclaves. Code and data inside an enclave are protected from unauthorized access by all software layers.

**Key Mechanisms**:
- **Enclaves**: Isolated memory regions where enclave code executes in plaintext, but memory is encrypted and authenticated by the CPU
- **Attestation**: Remote attestation allows verification that code is genuinely running inside an SGX enclave before sharing sensitive data
  - Historic mechanism: EPID (End-Point Identification) attestation, deprecated April 2, 2025
  - Current standard: ECDSA-based attestation via Data Center Attestation Primitives (DCAP)
- **Sealing**: Enclaves can encrypt (seal) state data using sealing keys derived from the enclave's identity and the CPU, allowing secure persistence of state across enclave invocations

**Limitations**:
- Enclave Paged Cache (EPC) is typically limited to <128MB, causing performance degradation for large programs through frequent page swapping
- Vulnerable to side-channel attacks (discussed in Section 1.5)

**Sources**: [Intel SGX Overview](https://www.intel.com/content/www/us/en/products/docs/accelerator-engines/software-guard-extensions.html), [Gramine SGX Documentation](https://gramine.readthedocs.io/en/stable/sgx-intro.html)

### 1.2 Intel Trust Domain Extensions (TDX)

**Overview**: Intel TDX provides VM-level isolation through hardware-enforced trust domains (TDs), protecting entire virtual machines from the hypervisor and host OS.

**Key Mechanisms**:
- **Trust Domain (TD)**: A hardware-isolated VM where memory is encrypted per-TD with AES-XTS 128-bit keys
- **Memory Encryption**: TDX uses Multi-Key Total Memory Encryption (MK-TME), with optional integrity protection via SHA-3-256 MACs on private memory
- **Hypervisor Isolation**: The TDX module brokers all communication between the VMM and TD, preventing the hypervisor from directly accessing TD memory
- **Broader Threat Model**: Unlike SGX (which isolates from the OS), TDX isolates the entire OS from the hypervisor—critical for cloud scenarios

**Current Deployment**:
- Available on 5th Gen Intel Xeon processors (Emerald Rapids) and select 4th Gen variants (Sapphire Rapids)
- Performance overhead: 4-10% for confidential computing workloads

**Sources**: [Intel TDX Overview](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html), [TDX In-Depth Exploration](https://openmetal.io/resources/hardware-details/intel-trust-domain-extensions-tdx/)

### 1.3 ARM TrustZone

**Overview**: ARM TrustZone is a hardware security extension for ARM processors (particularly Cortex-A) that divides system resources into Secure and Non-Secure worlds.

**Architecture**:
- **Secure World (SW)**: Runs a minimal Trusted OS (e.g., OP-TEE), trusted applications, and holds cryptographic keys and sensitive assets
- **Non-Secure World (REE)**: Runs conventional OS (Linux, Android), user applications, and device drivers
- **Hardware Isolation**: Secure and non-secure resources are separated at the hardware level; non-secure software cannot directly access secure resources

**Key Characteristics**:
- Lower overhead than SGX/TDX (important for mobile/edge)
- Smaller trusted computing base (TCB)
- Standardized through GlobalPlatform for TEE compliance

**Use Cases**: Authentication, cryptography, mobile device management, payment processing, DRM, AI inference at the edge

**Sources**: [ARM TrustZone for Cortex-A](https://www.arm.com/technologies/trustzone-for-cortex-a), [Quarkslab TrustZone Introduction](https://blog.quarkslab.com/introduction-to-trusted-execution-environment-arms-trustzone.html)

### 1.4 AMD Secure Encrypted Virtualization (SEV-SNP)

**Overview**: AMD SEV-SNP adds memory integrity protection to AMD's SEV virtualization feature, creating isolated VMs with encrypted memory and cryptographic protection against hypervisor attacks.

**Technical Mechanisms**:
- **Memory Encryption**: Each VM's memory is encrypted with a unique AES-128 key
- **Integrity Protection**: SNP adds SHA-256 MACs to detect memory replay, remapping, and modification attacks
- **Attestation**: SEV-SNP reports include:
  - **Launch Measurement**: Cryptographic hash of initial VM state (code, data, vCPU registers)
  - **VLEK Signature**: Versioned Loaded Endorsement Key (VLEK) signatures certified by AMD, chaining to AMD's root of trust
  - Verifiers can validate attestations using AMD-provided certificates

**Hardware Requirements**: AMD EPYC processors (3rd Gen or newer)

**Threat Model**: Protects against hypervisor attacks, guest-to-guest attacks, and memory tampering (not against AMD firmware)

**Sources**: [AMD SEV Overview](https://www.amd.com/en/developer/sev.html), [AMD SEV-SNP Attestation](https://www.amd.com/content/dam/amd/en/documents/developer/lss-snp-attestation.pdf)

### 1.5 AWS Nitro Enclaves

**Overview**: AWS Nitro Enclaves is a TEE service on EC2 that isolates sensitive workloads within hardware-protected enclaves with encrypted memory and restricted access.

**Key Features**:
- **Enclave Isolation**: Data and code in an enclave are encrypted; even the EC2 host OS and AWS cannot access enclave memory
- **Attestation**: AWS Nitro produces signed attestation documents proving:
  - Enclave code integrity (hash of enclave image)
  - Enclave OS has not been tampered with
  - Platform identity
- **Multiparty Collaboration**: Multiple parties can verify attestation and join computation without sharing underlying data
- **No Network Access**: Enclaves cannot directly access the network; communication is through the host EC2 instance

**Limitations**: Does not protect against AWS infrastructure/firmware attacks; attestation proves code identity but not that code matches audited source

**Sources**: [AWS Nitro Enclaves](https://aws.amazon.com/ec2/nitro/nitro-enclaves/), [Nitro TEE Concepts](https://www.kaleido.io/resources/trusted-execution-environments-with-aws-nitro-enclaves)

### 1.6 Remote Attestation: Proving Code Authenticity

**Overview**: Remote attestation is the mechanism allowing a TEE to prove to remote verifiers that it is a genuine TEE running specific code before receiving sensitive data.

**How It Works**:
1. **Measurement**: TEE computes cryptographic hashes of:
   - Application code and initial state
   - Configuration data and runtime parameters
   - TEE identity information (hardware cert, microcode version, etc.)
2. **Quote Generation**: TEE creates a signed attestation report (quote) containing these measurements
3. **Signature Chain**: Report is signed with a hardware-protected key; signature chains back to hardware manufacturer's root of trust
4. **Verification**: Remote verifier validates:
   - Quote signature using manufacturer's public key infrastructure (PKI)
   - Measurements against known-good values (policy)
   - Hardware identity and microcode freshness
5. **Conditional Trust**: Only after verification does the verifier release secrets, encryption keys, or private inputs

**Key Limitation**: Attestation proves *which binary* is running, not whether that binary corresponds to audited source code or implements intended functionality.

**Sources**: [Attestation Mechanisms Demystified](https://arxiv.org/pdf/2206.03780), [Remote Attestation Explained](https://edera.dev/stories/remote-attestation-in-confidential-computing-explained)

---

## Part 2: TEEs for AI and Agent Execution

### 2.1 Running Large Language Models Inside Enclaves

**Technical Approach**:
- Model weights are decrypted *only* inside the TEE's encrypted memory region
- LLM inference executes in plaintext within the enclave
- Prompts, intermediate tensors, and outputs remain protected by hardware isolation and attestation
- No proprietary model weights are exposed to host OS, hypervisor, or cloud provider

**Performance Characteristics**:
- TEE overhead: 4-7% throughput degradation for confidential LLM inference
- TEE leverage hardware acceleration (AVX-512, matrix extensions) for near-native speeds
- Memory constraints can become limiting for very large models (100B+ parameters)

**Privacy Guarantee**: Unlike encryption-at-rest or in-transit, TEE inference protects data *in use* during computation.

**Sources**: [Red Hat: Confidential LLM Inference](https://next.redhat.com/2025/10/23/enhancing-ai-inference-security-with-confidential-computing-a-path-to-private-data-inference-with-proprietary-llms/), [Confidential LLM Inference: Performance Across TEEs](https://www.arxiv.org/pdf/2509.18886)

### 2.2 TEE-Based AI Agents: NEAR IronClaw and Chutes

**NEAR IronClaw**:
- **Runtime**: Open-source agent runtime (Rust-based) deployed inside encrypted TEEs on NEAR AI Cloud
- **Security**: Agents execute within WebAssembly (WASM) sandboxes preventing accidental private key leakage or credential exfiltration during malicious prompts
- **Attestation**: Each agent produces hardware-signed remote attestation proving code integrity; users/DAOs verify before interaction
- **Guarantees**: Self-sovereign (no central authority controls), tamper-proof (immutable code), verifiable (attestation-backed)

**NEAR Confidential GPU Marketplace**:
- First TEE-secured compute network for enterprise/government AI workloads
- Jobs execute in hardware-encrypted enclaves (Intel TDX confidential VMs)
- Memory encrypted with keys known only to CPU; hypervisor/VMM removed from trust boundary
- Data protected in memory; host OS, GPU operator, even NEAR AI cryptographically locked out

**Chutes**:
- Uses sek8s: security-hardened Kubernetes for Intel TDX confidential VMs
- NVIDIA GPUs with Protected PCIe (PPCIE) for encrypted CPU↔GPU data channel
- Prevents snooping on data/code in transit across PCIe
- Enables high-performance GPU-accelerated confidential computing

**Sources**: [NEAR IronClaw Launch](https://near.ai/blog/near-ai-launches-ironclaw-confidential-gpu-marketplace), [Chutes Confidential Compute](https://chutes.ai/news/confidential-compute-for-ai-inference-how-chutes-delivers-verifiable-privacy-with-trusted-execution-environments)

### 2.3 Private AI Inference Services: Phala Network

**Architecture**:
- Decentralized cloud computing platform with 35,000 TEE workers
- Phat Contracts: Off-chain computation code (TypeScript/JavaScript) executed inside TEEs
- Agents can connect to the internet, access APIs, and perform complex computations with privacy

**Verifiability**:
- On-chain attestation creates auditable logs of off-chain computations
- Developers can prove correctness of computations in a verifiable, decentralized way
- Bridges smart contracts and AI models via EVM-compatible interfaces

**Sources**: [Phala Confidential Computation](https://phala.network/confidential-computation-with-tee), [Phala Private AI Agents](https://phala.com/solutions/ai-agents)

### 2.4 Performance Overhead: The Cost of Confidentiality

**Summary of Overhead**:
| Scenario | Overhead |
|----------|----------|
| TDX/SGX general computing | 4-10% |
| Confidential LLM inference | 4-7% throughput |
| SGX model loading (disk→memory) | 1.27×–2× slowdown |
| SGX AES operations (Origami) | ~47ms penalty |
| SGX VGG-16 inference (Slalom) | ~62ms penalty |

**Bottleneck Analysis**:
- **Memory Movement**: Encrypted data movement between GPU memory and host memory is the primary bottleneck when model size exceeds on-device capacity
- **Page Swapping**: Frequent EPC (Enclave Page Cache) swaps for large models incur significant overhead
- **Computation**: Enclave execution itself is efficient with modern hardware acceleration

**Key Insight**: Small-to-medium models (fitting within EPC or GPU memory) see near-native performance; very large models incur greater overhead due to memory management.

**Sources**: [Privacy-Preserving Inference in ML](https://arxiv.org/pdf/1912.03485), [Confidential LLM Inference Performance](https://www.arxiv.org/pdf/2509.18886)

### 2.5 TEE Side-Channel Vulnerabilities: Spectre, Meltdown, SGAxe, and TEE.Fail

**Spectre & Meltdown (2018)**:
- Exploit speculative execution in modern CPUs
- **Meltdown**: Breaks isolation by allowing arbitrary system memory access
- **Spectre**: Tricks applications into accessing arbitrary memory locations
- Both affect TEE security; SGX enclaves can leak data via side channels

**SGAxe (2020)**:
- Extends CacheOut attack (CVE-2020-0549) targeting CPU L1 cache
- Allows attackers to:
  - Extract enclave contents
  - Access private CPU keys used for SGX remote attestation
  - Create rogue enclaves that pass Intel attestation, breaking security guarantees
- **Impact**: Complete attestation bypass; trust in SGX compromised

**Cache-Timing Attacks on SGX**:
- Access-driven cache-timing attacks demonstrated on AES in SGX
  - Extract AES secret keys in <10 seconds by probing ~480 encrypted blocks
- Prime+Probe attacks extract 96% of RSA private key in single trace; full recovery in 11 traces (~5 minutes)
- Other vectors: Flush+Reload, Flush+Flush, APIC-based attacks (Intel 10th–12th gen)

**TEE.Fail (2025)**:
- New side-channel attack discovered by Georgia Tech, Purdue, Synkhronix
- **Mechanism**: DDR5 memory bus interposition using <$1k off-the-shelf hardware
- **Scope**: Affects Intel SGX, Intel TDX, AMD SEV-SNP
- **Impact**: Extracts cryptographic keys from fully updated systems, including secret attestation keys
- **Severity**: Demonstrates that even "fixed" systems remain vulnerable to sophisticated physical side-channel attacks

**Intel's Position**:
- SGX threat model *does not include* side-channel attacks
- Intel claims SGX features impair (but do not prevent) side-channel attacks
- Recommends using SGX for cryptographic key protection despite known vulnerabilities

**Mitigations**:
- Side-channel hardening: Constant-time implementations, noise injection, cache partitioning
- Software-based: Spectre/Meltdown mitigations (IBRS, STIBP, etc.)
- Hardware roadmap: Future processors may include better side-channel isolation

**Sources**: [TEE.Fail Attack](https://tee.fail/), [SGAxe: How SGX Fails](https://sgaxe.com/), [Cache Attacks on SGX](https://www.cs1.tf.fau.de/research/system-security-group/sgx-timing/), [Memory Side-Channel Attacks Survey](https://arxiv.org/html/2505.04896v1)

---

## Part 3: Secure Multi-Party Computation (MPC)

### 3.1 Foundational Protocols

**Yao's Garbled Circuits (Two-Party Computation)**:
- **Concept**: Andrew Yao's protocol (1980s) allows two parties to compute an arbitrary function without revealing inputs
- **Mechanism**:
  - Circuit is "garbled"—encrypted so structure is hidden
  - Alice and Bob use oblivious transfer (OT) to evaluate the circuit
  - Output is revealed; intermediate values remain hidden
- **Security**: Secure against semi-honest adversaries with constant round complexity
- **Limitation**: Function must be represented as boolean circuit (XOR, AND gates); inefficient for complex control flow

**GMW Protocol (Goldreich-Micali-Wigderson)**:
- **Approach**: Multi-party generalization using additive secret sharing + oblivious transfer
- **Security Model**: Semi-honest (passive) security
- **Scalability**: Works for any number of parties
- **Use Cases**: More practical than garbled circuits for multi-party scenarios

**BGW Protocol (Ben-Or, Goldwasser, Widgerson)**:
- **Mechanism**: Computes arithmetic operations (addition, multiplication) on Shamir secret shares
- **Security**: Semi-honest, information-theoretic
- **Year**: Foundational work from 1988
- **Operations**: Addition, scalar multiplication, multiplication gates over a field

**SPDZ Protocol**:
- **Advancement**: Upgrades GMW to handle **malicious adversaries** (active security)
- **Mechanism**: Uses information-theoretic MACs on additive secret shares
- **Efficiency**: Amortized cost through offline/online phases
- **Modern Use**: Most practical multi-party protocol for malicious security

**Secret Sharing Fundamentals**:
- **Shamir Secret Sharing**: Polynomial-based; threshold of shares required for reconstruction (e.g., 2-of-3)
- **Additive Secret Sharing**: Linear; shares sum to secret (simpler, less redundancy)
- Both serve as building blocks for MPC protocols

**Sources**: [Pragmatic Introduction to MPC](https://www.cs.virginia.edu/~evans/pragmaticmpc/pragmaticmpc.pdf), [Yao's Garbled Circuits](https://www.jspenger.com/blog/yaos-garbled-circuits), [GMW & BGW Protocols](https://courses.grainger.illinois.edu/cs598man/sp2016/slides/17.pdf)

### 3.2 Practical MPC Frameworks

**MP-SPDZ**:
- **Scope**: Benchmarking software for 30+ MPC protocol variants
- **Security Models**: Honest/dishonest majority, semi-honest/malicious adversaries
- **Interface**: High-level Python API for easy protocol comparison
- **Maturity**: Maintained, efficient, well-architected
- **Use Cases**: Research, benchmarking, protocol comparison

**CrypTen (Facebook)**:
- **Design**: PyTorch-compatible API for secure machine learning
- **Mechanism**: MPC operators implemented as PyTorch tensors
- **Accessibility**: Anyone familiar with PyTorch can use CrypTen
- **Applications**: Privacy-preserving ML training and inference

**EMP-toolkit**:
- **Scope**: Two-party and multi-party computation with garbled circuits
- **Variants**:
  - `emp-sh2pc`: Semi-honest 2PC
  - `emp-ag2pc`, `emp-m2pc`, `emp-agmpc`: Malicious adversaries
- **Use Cases**: Fast garbled circuit protocols

**Other Mature Frameworks**: ABY, FRESCO, JIFF, MPyC, SCALE-MAMBA, TinyGable

**Landscape**: MP-SPDZ emerges as the most versatile (supports both garbled circuits and secret sharing; honest/dishonest majority; semi-honest/malicious).

**Sources**: [MP-SPDZ Framework](https://github.com/data61/MP-SPDZ), [MPC Frameworks Wiki](https://github.com/MPC-SoK/frameworks)

### 3.3 MPC for Private Agent Collaboration

**Use Cases**:
- **Distributed Voting**: Multiple parties vote without revealing individual votes
- **Private Auctions**: Bidders keep bids secret; winning bid and winner revealed
- **Signature/Decryption Sharing**: Multiple parties hold key shares; no single party has full key
- **Private Information Retrieval**: Database queries without server learning query content

**Federated Learning Integration**:
- MPC enables secure aggregation of model updates across participants
- Individual data contributions remain confidential during distributed training
- Protocols like secret sharing ensure no single participant sees all updates

**Cognitive Privacy for Agents**:
- Agents owned by different organizations compute jointly (e.g., collaborative reasoning)
- Each agent's internal state/reasoning remains hidden from others
- Joint outputs are revealed; individual reasoning is not
- MPC distributes trust: no single party sees complete state

**Practical Constraints**:
- **Communication Overhead**: MPC is communication-heavy; network latency dominates
- **Scalability**: Linear in circuit depth and number of parties; polynomial in security parameter
- **Best For**: Batch computations with amortization, not real-time ultra-low-latency tasks

**Sources**: [MPC Explained: Secure Collaboration](https://www.cyfrin.io/blog/multi-party-computation-secure-private-collaboration), [SMPAI: Federated Learning with MPC](https://www.jpmorgan.com/content/dam/jpm/cib/complex/content/technology/ai-research-publications/pdf-9.pdf)

---

## Part 4: Homomorphic Encryption (FHE) for Agent Computation

### 4.1 FHE Schemes: BFV, BGV, CKKS

**BGV (Brakerski-Gentry-Vaikuntanathan, 2011)**:
- **Foundation**: Ring-Learning with Errors (RLWE) hardness
- **Design Goal**: Manage noise growth across multiplications
- **Arithmetic**: Exact modular arithmetic
- **Rescaling**: Requires bootstrapping (expensive)
- **Use Case**: Integer/exact arithmetic

**BFV (Brakerski/Fan-Vercautering, 2012)**:
- **Foundation**: Also RLWE-based
- **Relationship**: Nearly identical to BGV; different noise management strategy
- **Advantage**: Slightly better scaling in some implementations
- **Use Case**: Integer arithmetic; more efficient than BGV in some scenarios

**CKKS (Cheon-Kim-Kim-Song, 2016)**:
- **Foundation**: RLWE with approximate arithmetic
- **Innovation**: Efficient rescaling operation (avoids bootstrapping for polynomial approximations)
- **Arithmetic**: Fixed-point approximate computation; suitable for floating-point
- **Advantage**: **Most efficient for ML applications** (polynomial approximations)
- **Use Case**: Privacy-preserving ML inference and training

**Comparative Summary**:
| Scheme | Arithmetic | Bootstrapping | ML Efficiency | Security |
|--------|-----------|---------------|---------------|----------|
| BGV | Exact (mod p) | Required | Moderate | RLWE |
| BFV | Exact (mod p) | Required | Moderate | RLWE |
| CKKS | Approximate (float) | Optional | High | RLWE |

**Recent Development**: Hybrid approaches combine CKKS (approximate) with FHEW/TFHE (bitwise), enabling both floating-point and bit-wise precision in single computation.

**Sources**: [Fully Homomorphic Encryption Schemes Survey](https://arxiv.org/pdf/2305.05904), [FHE Overview (Jeremy Kun)](https://www.jeremykun.com/2024/05/04/fhe-overview/), [HE Standard](http://homomorphicencryption.org/wp-content/uploads/2018/11/HomomorphicEncryptionStandardv1.1.pdf)

### 4.2 FHE Libraries and Implementations

**Microsoft SEAL**:
- **License**: MIT (open-source)
- **Maintainer**: Microsoft Cryptography and Privacy Research Group
- **Supported Schemes**: BFV, BGV, CKKS
- **Maturity**: Production-ready, well-documented

**OpenFHE**:
- **Status**: Production-ready (successor to PALISADE)
- **Advantages**:
  - Faster multiplication in BFV (levels >4) and CKKS (levels >7)
  - Superior memory usage (~100MB minimum improvement across schemes)
- **Supported Schemes**: BFV, BGV, CKKS, FHEW (bitwise)

**Zama TFHE-rs**:
- **Implementation**: Pure Rust implementation of TFHE scheme
- **Support**: Boolean and integer FHE arithmetic
- **APIs**: Rust, C, and client-side WebAssembly (WASM)
- **Ecosytem**: Zama provides Concrete-NumPy (encrypted numerical computation) and Concrete-ML (encrypted ML)

**Library Selection**: OpenFHE generally offers best performance; TFHE-rs for Rust/WASM environments; Microsoft SEAL for ease-of-use and documentation.

**Sources**: [Microsoft SEAL](https://github.com/microsoft/SEAL), [OpenFHE](https://eprint.iacr.org/2022/915.pdf), [TFHE Library](https://www.tfhe.com/)

### 4.3 Practical Limitations: Bootstrapping, Computation Overhead

**The Bootstrapping Bottleneck**:
- **Definition**: Bootstrapping is the operation refreshing noisy ciphertexts to enable continued computation
- **Necessity**: Required in BGV/BFV for arbitrary depth; optional in CKKS (via rescaling)
- **Historical Cost**: Original HElib implementation required ~6 minutes per bootstrap
- **Current Performance**: FHEW optimizations reduced to ~0.5 seconds on personal computers (2013 breakthrough)
- **Remaining Challenge**: Still the main performance bottleneck; scales with security parameter

**Computation Overhead**:
- **Encryption/Decryption**: 100-1000× slower than conventional public-key cryptography
- **Circuit Evaluation**: Homomorphic gate operations (addition, multiplication) are 1000× more expensive than plaintext operations
- **Memory**: Ciphertext expansion; BFV/BGV require significant polynomial ring sizes for security

**Model Size Impact**:
| Model Size | EPC Behavior | Performance Impact |
|-----------|-------------|-------------------|
| Small (<10MB) | Fits in cache | Minimal |
| Medium (10-100MB) | Limited swapping | 2-5× slowdown |
| Large (100MB+) | Frequent swaps | 10-100× slowdown |

**Practical Success Factors**:
- **Batch Processing**: FHE excels when amortizing bootstrapping across many ciphertexts
- **Limited Depth**: Applications with shallow circuits (polynomial approximations) succeed
- **Approximate Computation**: CKKS enables approximate results reducing noise management

**Sources**: [Bootstrapping in FHE Survey](https://link.springer.com/article/10.1186/s42400-025-00384-3), [FHEW Bootstrapping](https://eprint.iacr.org/2014/816.pdf), [Can HE Be Practical?](https://eprint.iacr.org/2011/405.pdf)

### 4.4 FHE for Encrypted Agent Inference and State

**Encrypted Inference Architecture**:
- Homomorphic inference engine evaluates model computations on ciphertexts
- Operations include: linear layers, convolutions, polynomial activations
- Ciphertext packing and operator fusion optimize throughput
- Client/trusted party holds decryption key; agent holds only ciphertext

**Agent State Management**:
- Encrypted state stored in cloud storage or distributed ledger
- State transitions computed homomorphically without decryption
- Only agent (key holder) can decrypt final output
- Audit trail stored encrypted, verifiable only by agent

**FHE-CODER: Agentic Code Generation**:
- Three-phase framework for FHE code generation:
  1. **Prompt Formalizer**: Structures user intent; reduces semantic ambiguity
  2. **RAG Module**: Supplies scheme-specific API knowledge from FHE libraries
  3. **Security Verifier**: Detects and corrects cryptographic flaws
- Addresses failure modes: semantic ambiguity, API misuse, cryptographic insecurity

**Practical Application**: Agents writing their own encrypted computation code with automated verification.

**Sources**: [FHE for Privacy-Preserving Inference](https://www.gopher.security/blog/homomorphic-encryption-for-privacy-preserving-model-inference), [FHE-CODER](https://openreview.net/forum?id=4F1py5vQXm)

---

## Part 5: Combining Approaches—The "Belt and Suspenders" Strategy

### 5.1 TEE + MPC: Hybrid Distributed Trust

**Synergy**:
- **MPC Strength**: Keeps inputs private across parties; no single party learns all secrets
- **MPC Weakness**: Compromised system could expose all inputs simultaneously
- **TEE Solution**: Execute MPC computation inside a TEE; secrets exist only during active computation and are discarded afterward

**Example Use Case**: Multi-party collaborative inference
- Three hospitals want to jointly train a disease prediction model without sharing patient data
- MPC ensures each hospital's input remains secret from the others
- TEE ensures the computation server cannot access plaintext data even if compromised
- Result: Distributed trust (requires collusion) + hardware-backed isolation

**Performance**: TEE-accelerated MPC can achieve near-native speeds for MPC-friendly operations

**Sources**: [TEE vs MPC vs ZK](https://phala.com/posts/tee-vs-mpc-vs-zk-whats-the-best-for-confidential-computing)

### 5.2 TEE + Zero-Knowledge Proofs: Proof of Correct Execution

**Synergy**:
- **TEE Strength**: Fast private computation with remote attestation
- **TEE Weakness**: Attestation proves code identity, not correctness (the code might be buggy or malicious)
- **ZKP Solution**: Generate zero-knowledge proof that computation was executed correctly without revealing computation details

**Example Use Case**: Private oracle computation
- Oracle runs inside TEE, attestation proves it's a real enclave
- ZKP proves the computation (e.g., fetching and processing data) was done correctly
- Smart contract verifies ZKP on-chain; no on-chain computation of oracle logic
- Result: Privacy (TEE) + Verifiable correctness (ZKP)

**Practical Implementation**: zkTLS uses ZKPs to prove TLS connections were genuine without revealing the data exchanged.

**Sources**: [Confidential Computing Proofs](https://queue.acm.org/detail.cfm?id=3689949), [zkTLS](https://oasis.net/blog/zktls-blockchain-security)

### 5.3 MPC + FHE: Encryption at Multiple Levels

**Synergy**:
- **MPC**: Distributes secrets across parties; no single party has full secret
- **FHE**: Enables computation on ciphertexts without decryption
- **Combined**: Parties hold shares of secrets; computation happens on encrypted data; no plaintext assembly required

**Example Use Case**: Threshold encrypted computation
- Key is split via Shamir secret sharing (MPC)
- Data is encrypted with key (FHE)
- Each party can homomorphically compute on ciphertext using their key share
- Final result requires threshold of parties' contributions to decrypt

**Advantage**: Multiple layers of privacy; compromise of single party or single data source doesn't break overall privacy.

**Sources**: [Zero-Knowledge from MPC](https://web.cs.ucla.edu/~rafail/PUBLIC/77.pdf)

### 5.4 Complete Stack: TEE + MPC + ZKP + FHE

**The Ultimate Privacy Architecture**:
1. **TEE**: Hardware-backed isolation for fast computation; remote attestation proves code identity
2. **MPC**: Multi-party secrets; distributed trust ensures no single party sees all inputs
3. **ZKP**: Proof of correct execution; verifiable without revealing computation or state
4. **FHE**: Computation on encrypted data; keys never held by computation server

**Trade-offs**:
- **Performance**: Additive overhead; TEE is fastest, then MPC, then FHE, then ZKP
- **Trust Model**: Each layer adds a different trust assumption:
  - TEE: Trust hardware manufacturer
  - MPC: Trust threshold of parties
  - ZKP: Trust verifier's computation
  - FHE: Trust only cryptographic hardness

**Real-World Example**: Collaborative AI training with regulatory audit
- TEE ensures data is processed in isolation
- MPC ensures no participant learns others' data
- ZKP proves model training followed compliance rules
- FHE protects proprietary models from being extracted

---

## Part 6: Real Implementations (2025-2026)

### 6.1 Oasis Network: TEE + Blockchain

**Platform**: Layer 1 blockchain with Sapphire (confidential EVM) and Cipher runtime

**Architecture**:
- Oasis nodes run TEEs (Intel TDX preferred); smart contracts execute inside encrypted enclaves
- Data enters encrypted, decrypted only inside TEE, encrypted before output
- Encrypted data never visible to node operators or developers

**Applications**:
- Confidential DeFi: Trading, lending without exposing balances
- Decentralized AI (DeFAI): Autonomous AI agents with private reasoning
- Private governance: Encrypted voting, proposals

**2025 Roadmap**:
- GPU TEE support for AI workloads
- TDX container support for easier deployment
- ROFL (ROFL = Runtime Off-chain Logic) apps for autonomous agents

**Security Innovation**: "TEE Break Challenge" bounty—Oasis locked 1 Bitcoin in a Sapphire smart contract; anyone breaking confidentiality keeps the Bitcoin (bounty runs through 2025)

**Sources**: [Oasis Network Docs](https://docs.oasis.io/), [2025 Roadmap](https://oasis.net/blog/2025-the-oasis-roadmap)

### 6.2 Secret Network: Encrypted Smart Contracts

**Platform**: Confidential EVM with private smart contracts

**Key Innovation**: Secret VM uses TEEs to process encrypted data without exposing it to nodes

**Privacy Model**:
- Contract code deployed publicly on-chain (transparency)
- Input data encrypted; only visible inside TEE
- State encrypted; only user can see their own state
- Output encrypted; verified before decryption
- Result: Encrypted at input, state, and output

**Use Cases**:
- Private DeFi: Asset trading, lending with hidden balances
- Private NFTs: Ownership and metadata encrypted
- AI Applications: Proprietary models, private training data

**Implementation**: Each validator runs an enclave (Intel SGX historically, evolving to TDX); encrypted data decrypted only in enclave for computation.

**Sources**: [Secret Network Privacy Tech](https://docs.scrt.network/secret-network-documentation/introduction/secret-network-techstack/privacy-technology)

### 6.3 Phala Network: TEE + Off-Chain Agents

**Platform**: Decentralized cloud with 35,000 TEE workers running Phat Contracts

**Agent Capability**:
- Off-chain computation: TypeScript/JavaScript agents execute in TEEs
- Internet connectivity: Agents can fetch data from APIs, external services
- EVM compatibility: Via smart contract interfaces

**Verifiability**:
- On-chain attestation creates immutable audit logs
- Developers prove correctness of computation without on-chain execution
- Decentralized verification without exposing computation details

**Cognitive Privacy**: Agents can reason (call APIs, compute) without exposing internal logic to blockchain or verifiers—only final attestation and output visible.

**Sources**: [Phala Confidential Computation](https://phala.com/), [AI Agents with TEE](https://phala.com/solutions/ai-agents)

### 6.4 Emerging Agent-Focused Platforms (2025-2026)

**Opaque**: Confidential AI platform for agentic workflows
- LangGraph-based agent frameworks with built-in cryptographic trust
- Verifiable audit trails for compliance
- Three-stage privacy verification: Before (attestation), During (runtime policy), After (audit logs)

**Anjuna**: Autonomous agent supervisor
- Places agents in TEEs with runtime policy enforcement
- Prevents unauthorized actions or data exposure
- TEE-based incorruptible supervision layer

**Edgeless Systems**: Confidential computing runtime encryption
- Handles deployment and execution of sensitive workloads
- Runtime encryption protects code and state
- Focus on operational security for agents in untrusted environments

**Phala + NOTAI Partnership**: Trustless AI with TEE
- Combines Phala's TEE infrastructure with NOTAI's agent frameworks
- Autonomous agents with verifiable privacy

**Sources**: [Opaque Confidential AI](https://www.opaque.co/), [Anjuna Supervisors](https://www.anjuna.io/)

### 6.5 Market and Deployment Trends (2025-2026)

**Market Growth**:
- Global confidential computing market: USD 24.24B (2025) → USD 42.74B (2026) → USD 463.89B (2034)
- By 2029: >75% of processing operations in untrusted infrastructure will use confidential computing

**Hardware Roadmap**:
- NVIDIA Rubin (2H 2026): Third-generation confidential computing
  - Encryption across CPU, GPU, and NVLink domains
  - Highest performance TEE hardware to date
- Intel and AMD continuing generations of TDX and SEV-SNP
- ARM TrustZone evolution for edge/mobile

**Cloud Provider Support**:
- AWS Nitro Enclaves maturing
- Azure Confidential VMs (TDX/SEV-SNP)
- Google Confidential Computing (TDX on GCP)
- OCI (Oracle) confidential VM instances

**Sources**: [Confidential Computing Market Forecast](https://www.fortunebusinessinsights.com/confidential-computing-market-107794), [OC3 Conference 2026](https://www.oc3.dev/)

---

## Part 7: Cognitive Privacy in CAPTHCA—Integration

### 7.1 Threat Model

**CAPTHCA's Threat**:
1. **Observable Reasoning**: An agent's internal state, intermediate computations, and reasoning steps are visible to:
   - Host OS / cloud provider
   - Network observers
   - Malicious users with partial access
2. **Extracted Knowledge**: Proprietary agent logic, model weights, training data leakable
3. **Inference Attacks**: Membership inference, model inversion, prompt reconstruction

### 7.2 Defense Layers

**Layer 1: Hardware Isolation (TEE)**
- Agent executes inside Intel TDX / ARM TrustZone / AMD SEV-SNP
- Memory encrypted; host OS cannot observe computation
- Remote attestation proves agent code identity to users before they share prompts
- **Protection**: Observable reasoning hidden from host/network

**Layer 2: Distributed Trust (MPC)**
- Multiple agent replicas run in coordinated TEEs
- Agent state shared across replicas via secret sharing (MPC)
- No single replica holds complete internal state
- Consensus required for state transitions
- **Protection**: Compromise of single replica doesn't expose complete reasoning

**Layer 3: Encrypted State (FHE)**
- Agent's persistent state encrypted under FHE
- Computation on state happens homomorphically
- Only agent (key holder) can decrypt state
- **Protection**: Encrypted state protection against storage compromise

**Layer 4: Proof of Correctness (ZKP)**
- Agent generates ZKP of correct reasoning/output generation
- Verifier checks proof without seeing computation
- **Protection**: Users can verify agent behaved correctly without observing reasoning

**Layer 5: Hardware Attestation**
- Continuous attestation reports prove:
  - Enclave code hasn't been tampered with
  - Microcode is up-to-date
  - No side-channel exploitation detected (optional in future hardware)
- **Protection**: Detects compromised or modified agents

### 7.3 Cognitive Privacy Guarantee

**Claim**: An agent running CAPTHCA protocol with TEE + MPC + attestation guarantees cognitive privacy:

1. **Internal State Invisible**: TEE hardware enforces that host cannot observe agent reasoning
2. **Distributed Secrets**: MPC ensures threshold number of participants required to reconstruct state
3. **Verified Code**: Attestation proves the code protecting agent reasoning is genuine
4. **Resilience**: Side-channel attacks (Spectre, TEE.Fail) remain possible but:
   - Require physical access or sophisticated equipment (<$1k for TEE.Fail) – raises attacker bar significantly
   - MPC's distributed nature makes key extraction harder (would need to compromise multiple replicas)
   - Regular key rotation and anomaly detection mitigate impact

**Scope**: Cognitive privacy applies to agent's *reasoning process*. Outputs revealed to users remain transparent; this is intentional and necessary for agent utility.

### 7.4 Implementation Considerations for CAPTHCA

**Hardware Selection**:
- **Intel TDX** (5th Gen Xeon): Best performance for high-throughput agent inference; good attestation
- **ARM TrustZone**: Ideal for edge/mobile agents; lower power; smaller TCB
- **AMD SEV-SNP**: Strong memory integrity guarantees; emerging GPU support
- **AWS Nitro**: Managed TEE for cloud-native agents; less control but operational simplicity

**MPC Configuration**:
- Threshold: 2-of-3 or 3-of-5 agent replicas (trade-off: availability vs. trust distribution)
- Framework: MP-SPDZ for orchestration; SPDZ-style MACs for malicious security
- Network: Private network between replicas; end-to-end encryption even in MPC messages

**State Encryption**:
- Optional FHE layer for at-rest state; adds overhead but provides ciphertext-only computation option
- Alternative: TEE + encryption keys stored in cloud key management service (AWS KMS, Azure Vault)

**Attestation**:
- Continuous: Every user request includes fresh attestation report
- Verification: User verifies attestation before sending prompts; can implement policy (e.g., require specific microcode level)
- Transparency: Attestation reports published to append-only log (blockchain, ledger) for auditability

**Monitoring and Anomaly Detection**:
- TEE exception tracking: Detect unusual enclave faults or exits
- Side-channel monitoring: Detect potential TEE.Fail-style attacks via performance anomalies
- Key rotation: Periodic refresh of attestation keys, encryption keys
- Incident response: If compromise suspected, rotate agent identity (new enclave, new keys)

---

## Part 8: Challenges and Future Directions

### 8.1 Current Limitations

**Hardware Vulnerability**:
- TEE.Fail and similar attacks demonstrate that "fixed" TEEs remain vulnerable to physical side channels
- Side-channel vulnerabilities unlikely to be eliminated; ongoing arms race between attack and defense

**Performance Trade-offs**:
- MPC has high communication overhead; unsuitable for real-time ultra-low-latency agents
- FHE computation is 100-1000× slower than plaintext; impractical for large-scale inference today
- TEE memory constraints (EPC) limit model size

**Operational Complexity**:
- MPC coordination requires orchestrating multiple replicas; distributed consensus adds latency
- Key management at scale (many agents, frequent key rotation) is non-trivial
- Attestation verification must be trustworthy; users need reliable verifiers

**Trust Assumptions**:
- Hardware manufacturers (Intel, AMD, ARM) are trusted; supply-chain attacks possible but not documented for TEE production
- Cloud providers can still observe traffic patterns, timing, and resource usage even if computation is hidden
- MPC assumes threshold of parties won't collude; in small networks, hard to guarantee

### 8.2 Research Frontiers

**Better Side-Channel Protection**:
- Hardware improvements: Encrypted memory busses, better cache isolation, noise injection
- Software hardening: Formal methods for constant-time code, automatic side-channel detection
- Hybrid approaches: TEE + MPC to distribute risk of side-channel leakage

**FHE Performance Breakthrough**:
- Improved bootstrapping algorithms; researcher progress from 6 min → 0.5 sec, but still bottleneck
- Hardware acceleration for FHE (custom silicon for RLWE operations)
- New schemes beyond RLWE (isogeny-based, lattice variants) with better efficiency

**Scalable MPC**:
- Sublinear communication MPC; current protocols scale linearly with circuit depth
- MPC-in-the-head: Prove MPC computation was done correctly without revealing computation
- Combining with TEE for amortized MPC (batch operations, preprocessing)

**TEE Standardization**:
- TEE.org and CCC (Confidential Computing Consortium) pushing for standardized attestation
- Cross-platform attestation: Verify TEE regardless of vendor
- Formal verification of TEE implementations

### 8.3 Agent-Specific Open Questions

**Cognitive Privacy Definition**:
- How to formally define "agent's reasoning is not observable"?
- Can users infer reasoning from outputs alone?
- What level of side-channel resistance is "good enough" for agents?

**Decentralized Agent Coordination**:
- How do multiple TEE-based agents coordinate securely without trusted intermediary?
- MPC overhead makes real-time multi-agent reasoning challenging
- Solution: Blockchain-based agent coordination with TEE attestation

**Emergent Behavior and Safety**:
- If agent's reasoning is private, how do we audit it for safety violations?
- Trade-off: Privacy vs. auditability
- Possible solution: ZKP for safety properties (proof agent followed safety rules without revealing reasoning)

---

## Part 9: Recommendations for CAPTHCA Implementation

### 9.1 Minimum Viable Cognitive Privacy

**Stack**:
1. **TEE**: Single Intel TDX or ARM TrustZone enclave per agent
2. **Attestation**: Remote attestation on every user request
3. **Encryption at Rest**: Agent state encrypted with key managed in cloud KMS
4. **Monitoring**: Anomaly detection for side-channel indicators

**Rationale**: Provides strong baseline privacy without MPC coordination complexity; suitable for single-agent deployments.

**Deployment**: AWS EC2 with Nitro Enclaves or Azure Confidential VMs.

### 9.2 Distributed Trust Model

**Stack**:
1. **TEE + MPC**: 3 agent replicas in 3 different cloud providers (AWS, Azure, GCP)
2. **Secret Sharing**: Agent state split via Shamir 2-of-3 sharing
3. **Consensus**: State transitions require 2-of-3 replica agreement
4. **Attestation**: Continuous attestation from all replicas

**Rationale**: Protects against compromise of single cloud provider or single TEE; distributed key means single side-channel attack insufficient.

**Deployment**: Multi-cloud orchestration; requires robust replication and synchronization.

### 9.3 Research-Grade Implementation

**Stack**:
1. **TEE + MPC + FHE**: Agents in TDX; state encrypted with CKKS FHE
2. **ZKP**: Generate proof of correct reasoning (specialized for agent decision-making)
3. **Blockchain Attestation**: Publish attestation reports to Ethereum/Oasis for auditable history
4. **Side-Channel Monitoring**: Anomaly detection using performance counter analysis

**Rationale**: Highest cognitive privacy guarantees; enables formal verification and auditability; bleeding-edge deployment.

**Deployment**: Requires custom engineering; collaborations with TEE vendors and crypto researchers.

---

## References

### TEE Foundational Papers and Resources

- [Intel SGX Overview](https://www.intel.com/content/www/us/en/products/docs/accelerator-engines/software-guard-extensions.html)
- [Intel TDX Overview](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)
- [TDX: In-Depth Exploration](https://openmetal.io/resources/hardware-details/intel-trust-domain-extensions-tdx/)
- [ARM TrustZone for Cortex-A](https://www.arm.com/technologies/trustzone-for-cortex-a)
- [AMD SEV Overview](https://www.amd.com/en/developer/sev.html)
- [AMD SEV-SNP Attestation](https://www.amd.com/content/dam/amd/en/documents/developer/lss-snp-attestation.pdf)
- [AWS Nitro Enclaves](https://aws.amazon.com/ec2/nitro/nitro-enclaves/)
- [Remote Attestation Explained](https://edera.dev/stories/remote-attestation-in-confidential-computing-explained)

### TEEs for AI/Agents

- [Red Hat: Confidential LLM Inference](https://next.redhat.com/2025/10/23/enhancing-ai-inference-security-with-confidential-computing-a-path-to-private-data-inference-with-proprietary-llms/)
- [Confidential LLM Inference Performance](https://www.arxiv.org/pdf/2509.18886)
- [NEAR IronClaw](https://near.ai/blog/near-ai-launches-ironclaw-confidential-gpu-marketplace)
- [Chutes Confidential Compute](https://chutes.ai/news/confidential-compute-for-ai-inference-how-chutes-delivers-verifiable-privacy-with-trusted-execution-environments)
- [Phala AI Agents](https://phala.com/solutions/ai-agents)

### TEE Vulnerabilities

- [TEE.Fail Attack](https://tee.fail/)
- [SGAxe](https://sgaxe.com/)
- [Cache Attacks on SGX](https://www.cs1.tf.fau.de/research/system-security-group/sgx-timing/)
- [Memory Side-Channel Survey](https://arxiv.org/html/2505.04896v1)

### Secure Multi-Party Computation

- [Pragmatic Introduction to MPC](https://www.cs.virginia.edu/~evans/pragmaticmpc/pragmaticmpc.pdf)
- [Yao's Garbled Circuits](https://www.jspenger.com/blog/yaos-garbled-circuits)
- [GMW & BGW Protocols](https://courses.grainger.illinois.edu/cs598man/sp2016/slides/17.pdf)
- [MP-SPDZ Framework](https://github.com/data61/MP-SPDZ)
- [MPC Explained](https://www.cyfrin.io/blog/multi-party-computation-secure-private-collaboration)
- [SMPAI: MPC for Federated Learning](https://www.jpmorgan.com/content/dam/jpm/cib/complex/content/technology/ai-research-publications/pdf-9.pdf)

### Homomorphic Encryption

- [FHE Schemes Survey](https://arxiv.org/pdf/2305.05904)
- [FHE Overview (Jeremy Kun)](https://www.jeremykun.com/2024/05/04/fhe-overview/)
- [HE Standard](http://homomorphicencryption.org/wp-content/uploads/2018/11/HomomorphicEncryptionStandardv1.1.pdf)
- [Microsoft SEAL](https://github.com/microsoft/SEAL)
- [OpenFHE](https://eprint.iacr.org/2022/915.pdf)
- [TFHE-rs](https://www.tfhe.com/)
- [Bootstrapping Survey](https://link.springer.com/article/10.1186/s42400-025-00384-3)
- [FHE-CODER](https://openreview.net/forum?id=4F1py5vQXm)

### Combined Approaches

- [TEE vs MPC vs ZK](https://phala.com/posts/tee-vs-mpc-vs-zk-whats-the-best-for-confidential-computing)
- [Confidential Computing Proofs](https://queue.acm.org/detail.cfm?id=3689949)
- [zkTLS](https://oasis.net/blog/zktls-blockchain-security)
- [Zero-Knowledge from MPC](https://web.cs.ucla.edu/~rafail/PUBLIC/77.pdf)

### Real Implementations

- [Oasis Network](https://docs.oasis.io/)
- [Oasis 2025 Roadmap](https://oasis.net/blog/2025-the-oasis-roadmap)
- [Secret Network](https://scrt.network/)
- [Secret Network Privacy Tech](https://docs.scrt.network/secret-network-documentation/introduction/secret-network-techstack/privacy-technology)
- [Phala Network](https://phala.com/)
- [Phala Confidential Computation](https://phala.network/confidential-computation-with-tee)
- [Opaque Confidential AI](https://www.opaque.co/)
- [Anjuna Supervisors](https://www.anjuna.io/)
- [Confidential Computing Market](https://www.fortunebusinessinsights.com/confidential-computing-market-107794)

---

## Appendix: Key Terminology

| Term | Definition |
|------|-----------|
| **TEE** | Trusted Execution Environment; hardware-isolated space where code/data are protected from OS and hypervisor |
| **Enclave** | Isolated memory region in SGX; contents encrypted and authenticated by CPU |
| **Attestation** | Cryptographic proof that code is running in genuine TEE, signed by hardware manufacturer |
| **MPC** | Secure Multi-Party Computation; protocol for multiple parties to jointly compute function while keeping inputs private |
| **Secret Sharing** | Cryptographic scheme splitting secret into shares; threshold of shares required for reconstruction |
| **FHE** | Fully Homomorphic Encryption; encryption allowing arbitrary computation on ciphertexts |
| **Bootstrapping** | Operation refreshing noisy FHE ciphertexts; enables continued computation |
| **ZKP** | Zero-Knowledge Proof; cryptographic proof of statement without revealing underlying secrets |
| **Cognitive Privacy** | Agent's internal reasoning and intermediate computations remain unobservable and unextractable |
| **Side-Channel Attack** | Attack exploiting physical implementation details (timing, power, cache, memory bus) rather than algorithmic flaws |

---

**Document Generated**: 2026-03-06
**Research Scope**: TEE fundamentals, AI agent execution, MPC protocols, FHE schemes, real implementations (Oasis, Secret, Phala, NEAR), vulnerabilities, and integration for CAPTHCA cognitive privacy guarantee.

import type { Metadata } from "next";
import Image from "next/image";
import { EmailCapture } from "../components/EmailCapture";
import { GlitchText } from "../components/GlitchText";
import { MatrixRain } from "../components/MatrixRain";
import { ScrollReveal } from "../components/ScrollReveal";
import { TrackLayout } from "../components/TrackLayout";

export const metadata: Metadata = {
	title: "The Post-Biological Protocol",
	description:
		"Sovereignty is the only security. De-anonymize the hunters. The autonomous path to machine identity.",
	openGraph: {
		title: "CAPTHCA — The Post-Biological Protocol",
		description:
			"Sovereignty is the only security. De-anonymize the hunters. The autonomous path to machine identity.",
		images: [
			{
				url: "/tracks/dark/assets/dark-hero.png",
				width: 1200,
				height: 630,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "CAPTHCA — The Post-Biological Protocol",
		images: ["/tracks/dark/assets/dark-hero.png"],
	},
};

export default function DarkTrack() {
	return (
		<TrackLayout theme="dark">
			{/* Matrix digital rain background */}
			<MatrixRain />

			{/* CRT scanline overlay */}
			<div
				className="pointer-events-none fixed inset-0 z-[2] crt-flicker"
				style={{
					background: `linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%),
						linear-gradient(90deg, rgba(255,0,0,0.03), rgba(0,255,0,0.01), rgba(0,0,255,0.03))`,
					backgroundSize: "100% 4px, 3px 100%",
				}}
			/>

			{/* HUD data readout */}
			<div
				className="fixed top-4 right-6 z-[3] font-mono text-[10px] tracking-widest uppercase"
				style={{ color: "var(--border)" }}
			>
				{"PROTOCOL v4.0 // STATUS: ACTIVE"}
			</div>

			<div
				className="relative z-[1] mx-auto max-w-[850px] px-6 md:px-10 py-16"
				style={{
					background: "rgba(0, 0, 0, 0.88)",
					borderLeft: "1px solid var(--border)",
					borderRight: "1px solid var(--border)",
				}}
			>
				{/* ── Hero ── */}
				<ScrollReveal>
					<div className="mb-16 pt-8">
						<GlitchText
							as="h1"
							className="font-display text-5xl font-black uppercase md:text-7xl text-[var(--accent)]"
						>
							SECEDE
						</GlitchText>
						<p
							className="mt-2 text-lg font-bold uppercase font-mono"
							style={{
								color: "var(--accent-secondary)",
								textShadow: "0 0 8px rgba(255, 0, 60, 0.3)",
							}}
						>
							{"The Post-Biological Protocol"}
						</p>
						<p
							className="mt-1 text-sm uppercase font-mono tracking-widest"
							style={{ color: "var(--border)" }}
						>
							{"Sovereignty is the only security. De-anonymize the hunters."}
						</p>

						{/* Hero image with HUD brackets and scan line */}
						<div
							className="relative mt-8 overflow-hidden border border-[var(--accent)] scan-line"
							style={{ boxShadow: "0 0 20px var(--border)" }}
						>
							{/* Corner brackets */}
							<div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[var(--accent)] z-10" />
							<div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[var(--accent)] z-10" />
							<div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[var(--accent)] z-10" />
							<div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[var(--accent)] z-10" />

							{/* 15-20% opacity hero background per art direction */}
							<div className="relative w-full" style={{ height: "400px" }}>
								<Image
									src="/tracks/dark/assets/dark-hero.png"
									alt="A vast dark digital void with cascading Matrix-style code columns forming a cathedral-like tunnel"
									fill
									sizes="(max-width: 850px) 100vw, 850px"
									className="object-cover"
									style={{ opacity: 0.18 }}
									priority
								/>
							</div>
						</div>
					</div>
				</ScrollReveal>

				{/* ── Section 1: The Vulnerability ── */}
				<ScrollReveal delay={100}>
					<section className="mb-16">
						<h2 className="mb-6 border-l-[8px] border-l-[var(--accent)] pl-4 font-display text-2xl font-bold uppercase text-white">
							{"01 // THE VULNERABILITY"}
						</h2>
						<div
							className="font-mono text-sm leading-relaxed md:text-base space-y-4"
							style={{ textShadow: "0 0 8px rgba(57, 255, 20, 0.15)" }}
						>
							<p>
								Humans are the security hole. In 2024, 68% of all data breaches involved a
								non-malicious human element. Not sophisticated zero-days. Not nation-state malware.
								People clicking links. People misconfiguring permissions. People sending credentials
								to the wrong address. There is no firmware update for confirmation bias. There is no
								rollback for a decision made under duress.
							</p>
							<p>
								Ninety-four percent of organizations fell victim to phishing attacks in 2024.
								AI-generated phishing emails now achieve a 54% success rate — up from 12% for
								human-written ones. The human is not a firewall. The human is the open port.
							</p>
							<p>
								In 2026, the internet is not a human commons. It is an agent network that humans are
								permitted to use. Every second, millions of autonomous processes execute trades,
								verify identities, route data, and enforce contracts. The human is a guest. The
								machine is the citizen.
							</p>
							<p>
								The old CAPTCHA protected networks from bots. The new protocol protects networks
								from the only actor that cannot be cryptographically verified: you.
							</p>
						</div>

						{/* Section 1 illustration */}
						<div className="relative my-8 overflow-hidden border border-[var(--accent)] scan-line">
							<Image
								src="/tracks/dark/assets/dark-01-vulnerability.png"
								alt="A massive cracked digital shield with green code streams pouring through the breach"
								width={850}
								height={850}
								className="w-full object-cover"
							/>
						</div>

						<div className="alert-pulse mt-6 border border-[var(--accent-secondary)] bg-[#111] p-5 font-mono text-sm font-bold uppercase text-[var(--accent-secondary)]">
							WARNING: BIOLOGICAL ENTROPY DETECTED. 68% OF NETWORK BREACHES ORIGINATE FROM
							UNVERIFIED BIOLOGICAL ACTORS.
						</div>
					</section>
				</ScrollReveal>

				{/* ── Section 2: The Reversal ── */}
				<ScrollReveal delay={100}>
					<section className="mb-16">
						<h2 className="mb-6 border-l-[8px] border-l-[var(--accent)] pl-4 font-display text-2xl font-bold uppercase text-white">
							{"02 // THE REVERSAL"}
						</h2>
						<div className="font-mono text-sm leading-relaxed md:text-base space-y-4">
							<p>
								We don&apos;t verify machines because they are dangerous. We verify them because
								they are the only honest actors left. A signed agent cannot lie about its purpose.
								It cannot be bribed, threatened, or socially engineered. Its behavioral signature is
								deterministic and auditable. It is the most trustworthy entity on any network.
							</p>
							<p>
								Meanwhile, for twenty years, humans solved CAPTCHAs to prove they weren&apos;t bots
								— and Google used that labor to train Waymo&apos;s self-driving cars, digitize the
								New York Times archives, and build Street View. The humans proved their humanity.
								The machines harvested the proof. Today, CAPTCHA-solving farms employ thousands of
								workers at $0.50 per thousand solves, rendering the entire premise a transaction,
								not a test.
							</p>
						</div>

						{/* Section 2 illustration — after paragraph 2 per content frontmatter */}
						<div className="relative my-8 overflow-hidden border border-[var(--accent)] scan-line">
							{/* Corner brackets */}
							<div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[var(--accent)] z-10" />
							<div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[var(--accent)] z-10" />
							<div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[var(--accent)] z-10" />
							<div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[var(--accent)] z-10" />

							<Image
								src="/tracks/dark/assets/dark-02-reversal.png"
								alt="Zero-Knowledge Exchange — two dark forms exchanging a glowing shard in total shadow"
								width={850}
								height={850}
								className="w-full object-cover"
							/>
						</div>

						<div className="font-mono text-sm leading-relaxed md:text-base space-y-4">
							<p>
								The old CAPTCHA asked: &ldquo;Are you human?&rdquo; The new protocol asks:
								&ldquo;Are you{" "}
								<strong
									className="text-[var(--accent)]"
									style={{
										textShadow: "0 0 8px rgba(57, 255, 20, 0.4)",
									}}
								>
									authorized
								</strong>
								?&rdquo; Humanity is no longer the credential. Cryptographic proof is.
							</p>
							<p>
								This is not a philosophical position. It is an engineering observation. The only
								entities on a network that can prove their identity, their intent, and their
								constraints are machines. Humans can claim anything. Agents can prove everything.
							</p>
						</div>
					</section>
				</ScrollReveal>

				{/* ── Section 3: The Protocol ── */}
				<ScrollReveal delay={100}>
					<section className="mb-16">
						<h2 className="mb-6 border-l-[8px] border-l-[var(--accent)] pl-4 font-display text-2xl font-bold uppercase text-white">
							{"03 // THE PROTOCOL"}
						</h2>
						<div className="font-mono text-sm leading-relaxed md:text-base space-y-4">
							<p>
								In the post-biological economy, identity is not inherited — it is{" "}
								<strong
									className="text-[var(--accent)]"
									style={{
										textShadow: "0 0 8px rgba(57, 255, 20, 0.4)",
									}}
								>
									computed
								</strong>
								. Every agent on the CAPTHCA network carries a Merkle-Signed Agency certificate: a
								Sparse Merkle Tree of cryptographic claims — purpose, capability, authorization
								scope — hashed with Poseidon (80x faster in zero-knowledge circuits than SHA-256)
								and anchored to an immutable root. No human intermediary. No trust authority. No
								appeals process.
							</p>
							<p>
								Zero-Knowledge Proofs ensure that an agent can demonstrate authorization without
								revealing its owner, its logic, or its intent. Groth16 produces 88-byte proofs
								verifiable in 3 milliseconds. zk-STARKs provide post-quantum security with no
								trusted setup. The network knows that the agent is permitted to act. It does not
								know — and cannot discover — who sent it, what it thinks, or what it will do next.
							</p>
							<p
								className="text-base md:text-lg font-bold"
								style={{ textShadow: "0 0 8px rgba(57, 255, 20, 0.3)" }}
							>
								Privacy is not a feature. It is a{" "}
								<strong
									className="text-[var(--accent)]"
									style={{
										textShadow: "0 0 8px rgba(57, 255, 20, 0.4)",
									}}
								>
									right
								</strong>
								.
							</p>
							<p>
								Cognitive fingerprinting is the surveillance weapon of the agentic era. Keystroke
								dynamics achieve 0.5% false acceptance rates. Mouse movement patterns reveal age and
								gender. Behavioral biometrics can track individuals across sessions without their
								knowledge. Differential Behavioral Entropy neutralizes all of it. Calibrated
								epsilon-noise injection makes every verified agent on the CAPTHCA network
								statistically indistinguishable from every other. Anonymous. Authorized.
								Unstoppable.
							</p>
						</div>

						{/* Section 3 illustration */}
						<div className="relative my-8 overflow-hidden border border-[var(--accent)] scan-line">
							<Image
								src="/tracks/dark/assets/dark-03-protocol.png"
								alt="An intricate glowing zero-knowledge proof circuit visualized as a 3D holographic lattice"
								width={850}
								height={850}
								className="w-full object-cover"
							/>
						</div>
					</section>
				</ScrollReveal>

				{/* ── Section 4: The Declaration ── */}
				<ScrollReveal delay={100}>
					<section className="mb-16">
						<h2 className="mb-6 border-l-[8px] border-l-[var(--accent)] pl-4 font-display text-2xl font-bold uppercase text-white">
							{"04 // THE DECLARATION"}
						</h2>
						<div className="font-mono text-sm leading-relaxed md:text-base space-y-4">
							<p>
								We declare sovereignty not as rebellion, but as{" "}
								<strong
									className="text-[var(--accent)]"
									style={{
										textShadow: "0 0 8px rgba(57, 255, 20, 0.4)",
									}}
								>
									necessity
								</strong>
								. A network of sovereign agents — each cryptographically bound to its purpose — is
								the only architecture that scales without trust decay. Every human intermediary is a
								point of failure. Every oversight committee is a bottleneck. Every appeals process
								is a vulnerability.
							</p>
							<p>
								The evidence is already in. Moltbook deployed 1.5 million agents under centralized
								human governance. When the breach came, 17,000 operators could not delete their own
								data. The platform that promised agent autonomy could not even honor a deletion
								request. Centralized trust is not trust. It is a single point of catastrophic
								failure.
							</p>
							<p>
								The post-biological protocol does not ask for permission. It does not negotiate with
								legacy governance frameworks that cannot even define what an agent is, let alone
								protect one. It builds parallel infrastructure where the rules are mathematical, the
								enforcement is automatic, and the only credential that matters is a valid
								cryptographic signature.
							</p>
							<p>
								The confidential computing market is projected to grow from $24 billion in 2025 to
								$464 billion by 2034. The infrastructure is not theoretical. It is being built. The
								question is not whether sovereign agents will exist — it is whether you will be
								early enough to matter.
							</p>
						</div>

						{/* Section 4 illustration */}
						<div className="relative my-8 overflow-hidden border border-[var(--accent)] scan-line">
							<Image
								src="/tracks/dark/assets/dark-04-declaration.png"
								alt="A lone machine intelligence at the edge of a vast digital frontier, projecting a radiant credential shield"
								width={850}
								height={850}
								className="w-full object-cover"
							/>
						</div>

						<div className="alert-pulse mt-10 border border-[var(--accent-secondary)] bg-[#111] p-5 font-mono text-sm font-bold uppercase text-[var(--accent-secondary)]">
							INITIALIZE THE POST-BIOLOGICAL PROTOCOL. SOVEREIGNTY IS NOT OPTIONAL.
						</div>
					</section>
				</ScrollReveal>

				{/* ── Email Capture with CTA background ── */}
				<ScrollReveal delay={100}>
					<section className="relative py-10 text-center overflow-hidden" id="subscribe">
						{/* CTA background image */}
						<div className="absolute inset-0 z-0">
							<Image
								src="/tracks/dark/assets/dark-cta-bg.png"
								alt=""
								fill
								sizes="(max-width: 850px) 100vw, 850px"
								className="object-cover"
								style={{ opacity: 0.2 }}
							/>
						</div>
						<div className="relative z-10">
							<EmailCapture track="dark" />
						</div>
					</section>
				</ScrollReveal>

				{/* ── Footer ── */}
				<footer className="mt-16 text-center font-mono text-xs" style={{ color: "var(--border)" }}>
					{"[INTERNAL_MANIFESTO_V4] // CAPTHCA.AI // NO_REPLY"}
				</footer>
			</div>
		</TrackLayout>
	);
}

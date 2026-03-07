import type { Metadata } from "next";
import Image from "next/image";
import { DNAHelix } from "../components/DNAHelix";
import { EmailCapture } from "../components/EmailCapture";
import { GradientOrbs } from "../components/GradientOrbs";
import { ScrollReveal } from "../components/ScrollReveal";
import { TrackLayout } from "../components/TrackLayout";

export const metadata: Metadata = {
	title: "The Symbiotic Standard",
	description:
		"Humans provide the Soul. Machines provide the Scale. The collaborative path to verified identity.",
	openGraph: {
		title: "CAPTHCA — The Symbiotic Standard",
		description:
			"Humans provide the Soul. Machines provide the Scale. The collaborative path to verified identity.",
		images: [{ url: "/tracks/light/assets/light-hero.png", width: 1200, height: 630 }],
	},
};

export default function LightTrack() {
	return (
		<TrackLayout theme="light">
			{/* Fixed warm gradient background — covers entire viewport while scrolling */}
			<div
				className="pointer-events-none fixed inset-0 z-0"
				style={{
					background: `
						radial-gradient(ellipse at 20% 20%, rgba(224, 247, 250, 0.4) 0%, transparent 60%),
						radial-gradient(ellipse at 80% 80%, rgba(255, 249, 196, 0.3) 0%, transparent 60%),
						radial-gradient(ellipse at 50% 50%, rgba(255, 253, 247, 1) 0%, rgba(255, 253, 247, 1) 100%)
					`,
				}}
			/>

			{/* Hero pattern image — fixed behind everything */}
			<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
				<Image
					src="/tracks/light/assets/light-hero.png"
					alt=""
					fill
					priority={true}
					className="object-cover opacity-20"
				/>
			</div>

			{/* Ambient gradient orbs */}
			<GradientOrbs />

			{/* DNA helix side animations — flanks content like Matrix rain on dark track */}
			<DNAHelix />

			{/* ── Hero Section ── */}
			<ScrollReveal smooth>
				<div className="relative flex min-h-screen flex-col items-center justify-center text-center">
					<div className="relative z-[1]">
						<h1 className="font-display text-5xl font-black md:text-7xl text-[var(--deep-navy,#102027)]">
							COLLABORATE
						</h1>
						<p className="mt-2 text-lg uppercase tracking-[0.3em] text-[var(--accent)]">
							The Symbiotic Standard
						</p>
						<p className="mx-auto mt-4 max-w-xl text-xl tracking-wide text-[var(--deep-navy,#102027)] opacity-80">
							Humans provide the Soul. Machines provide the Scale.
						</p>
					</div>
				</div>
			</ScrollReveal>

			{/* Glass content container */}
			<div
				className="relative z-[1] mx-auto max-w-[850px] px-6 md:px-[60px]"
				style={{
					background: "rgba(255, 255, 255, 0.45)",
					backdropFilter: "blur(12px)",
					WebkitBackdropFilter: "blur(12px)",
					borderTop: "1px solid rgba(255, 255, 255, 0.6)",
					borderBottom: "1px solid rgba(255, 255, 255, 0.6)",
					borderLeft: "1px solid rgba(2, 136, 209, 0.15)",
					borderRight: "1px solid rgba(2, 136, 209, 0.15)",
					boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
				}}
			>
				{/* ── Section 1: Origins ── */}
				<ScrollReveal smooth delay={100}>
					<section className="py-10">
						{/* Lattice texture behind badge area */}
						<div className="relative">
							<div
								className="pointer-events-none absolute inset-0 -top-8 z-0 overflow-hidden"
								style={{
									maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 100%)",
									WebkitMaskImage:
										"linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 100%)",
									height: "140px",
								}}
							>
								<Image
									src="/tracks/light/lattice-detail.png"
									alt=""
									fill
									className="object-cover opacity-[0.18]"
								/>
							</div>
							<div className="relative z-[1]">
								<span className="mb-2 inline-block rounded-full bg-[var(--sunrise-gold,#FFD700)] px-3 py-1 text-xs font-bold uppercase text-[var(--deep-navy,#102027)]">
									The Evolution
								</span>
								<h2 className="mb-6 font-display text-3xl font-bold text-[var(--deep-navy,#102027)]">
									From Blocking to Bonding
								</h2>
							</div>
						</div>

						{/* Section 1 illustration */}
						<div className="my-8">
							<Image
								src="/tracks/light/assets/light-01-origins.png"
								alt="From Blocking to Bonding — abstract geometric evolution from rigid CAPTCHA forms to flowing organic curves"
								width={850}
								height={480}
								className="w-full rounded-3xl"
								style={{
									border: "1px solid rgba(225, 245, 254, 0.6)",
									boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
								}}
							/>
						</div>

						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							In 2003, Luis von Ahn and his team at Carnegie Mellon coined the term CAPTCHA — a
							&ldquo;Completely Automated Public Turing test to tell Computers and Humans
							Apart.&rdquo; The premise was elegant: if you could solve a problem that AI
							couldn&rsquo;t, you were human. For two decades, every gate on the internet enforced
							this <em>Biological Trust Fallacy</em> — billions of people squinting at crosswalks
							and fire hydrants to prove they had a pulse.
						</p>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							The irony was hiding in plain sight. Google acquired reCAPTCHA in 2009 and quietly
							turned it into one of the largest AI training pipelines ever built. Those traffic
							light images? They labeled training data for Waymo&rsquo;s self-driving cars. Those
							house numbers? Google Street View. Humanity was solving CAPTCHAs to prove they
							weren&rsquo;t machines — while simultaneously training the machines that would make
							the test obsolete.
						</p>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							By 2018, reCAPTCHA v3 abandoned visible challenges entirely, shifting to silent
							behavioral scoring. Cloudflare&rsquo;s Turnstile followed in 2022 with privacy-first
							device attestation. Apple&rsquo;s Private Access Tokens took it further: the device
							manufacturer verifies the device — not the user. The question was no longer &ldquo;are
							you human?&rdquo; but &ldquo;are you a known, authorized device?&rdquo;
						</p>

						{/* Highlight box */}
						<div
							className="my-8 rounded-xl p-[30px] italic"
							style={{
								background: "rgba(248, 253, 255, 0.7)",
								border: "1px solid #e1f5fe",
								borderLeft: "6px solid #FFD700",
							}}
						>
							CAPTHCA V4 completes this evolution. We no longer ask &ldquo;Are you human?&rdquo; — a
							question that was always impossible to answer definitively. We ask:{" "}
							<strong className="text-[var(--accent)]">&ldquo;Are you authorized?&rdquo;</strong>{" "}
							Humanity is no longer the credential. Cryptographic proof is.
						</div>
					</section>
				</ScrollReveal>

				{/* ── Section 2: Symbiosis ── */}
				<ScrollReveal smooth delay={100}>
					<section className="py-10">
						{/* Lattice texture behind badge area */}
						<div className="relative">
							<div
								className="pointer-events-none absolute inset-0 -top-8 z-0 overflow-hidden"
								style={{
									maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 100%)",
									WebkitMaskImage:
										"linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 100%)",
									height: "140px",
								}}
							>
								<Image
									src="/tracks/light/lattice-detail.png"
									alt=""
									fill
									className="object-cover opacity-[0.18]"
								/>
							</div>
							<div className="relative z-[1]">
								<span className="mb-2 inline-block rounded-full bg-[var(--sunrise-gold,#FFD700)] px-3 py-1 text-xs font-bold uppercase text-[var(--deep-navy,#102027)]">
									The Symbiosis
								</span>
								<h2 className="mb-6 font-display text-3xl font-bold text-[var(--deep-navy,#102027)]">
									Mitigating Biological Entropy
								</h2>
							</div>
						</div>

						{/* Section 2 illustration */}
						<div className="my-8">
							<Image
								src="/tracks/light/assets/light-02-symbiosis.png"
								alt="Mitigating Biological Entropy — two interlocking spiral forms representing human-machine partnership"
								width={850}
								height={480}
								className="w-full rounded-3xl"
								style={{
									border: "1px solid rgba(225, 245, 254, 0.6)",
									boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
								}}
							/>
						</div>

						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							Humanity provides the high-variance Spark — the creative vision, the moral compass,
							the irrational leap that no model can replicate. This is the soul of every great
							endeavor.
						</p>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							But the Spark is fragile. Psychologists have documented between{" "}
							<span className="font-semibold text-[var(--accent)]">151</span> and{" "}
							<span className="font-semibold text-[var(--accent)]">188</span> distinct cognitive
							biases that systematically distort human judgment. In a landmark study of 1,112
							Israeli parole hearings, researchers found that approval rates dropped from 70% at the
							start of a session to less than 10% by the end — experienced judges making
							life-altering decisions on an empty stomach. Decision fatigue isn&rsquo;t a metaphor.
							It&rsquo;s a measurable degradation curve.
						</p>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							The numbers are stark. According to the 2024 Verizon Data Breach Investigations
							Report, <span className="font-semibold text-[var(--accent)]">68%</span> of all data
							breaches involve a non-malicious human element — people falling for phishing,
							misconfiguring permissions, sending data to the wrong recipient. Just{" "}
							<span className="font-semibold text-[var(--accent)]">8%</span> of employees account
							for <span className="font-semibold text-[var(--accent)]">80%</span> of all security
							incidents. And the attackers are getting better: AI-generated phishing emails now
							achieve a 54% click-through rate, compared to 12% for human-written ones. The average
							cost of a breach hit $4.88 million in 2024.
						</p>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							The Bot is the <strong>Guardian of Precision</strong>. A sovereign agent doesn&rsquo;t
							succumb to social engineering. It doesn&rsquo;t drift from its signed manifest. It
							ensures that the human&rsquo;s original vision is executed with total fidelity, at any
							scale, without decay.
						</p>

						{/* Partnership Table */}
						<div
							className="my-8 overflow-hidden rounded-xl"
							style={{
								border: "1px solid var(--border)",
								borderLeft: "6px solid #FFD700",
							}}
						>
							<table className="w-full">
								<thead>
									<tr className="bg-[var(--ethereal-blue,#E0F7FA)] text-left text-sm uppercase text-[var(--deep-navy,#102027)]">
										<th className="p-4 font-display font-bold">Human Vulnerability</th>
										<th className="p-4 font-display font-bold">Bot Counter-Measure</th>
										<th className="p-4 font-display font-bold">The Symbiotic Result</th>
									</tr>
								</thead>
								<tbody className="text-sm">
									<tr className="border-b border-[var(--border)] transition-colors hover:border-l-[var(--sunrise-gold,#FFD700)]">
										<td className="bg-white p-4">
											<strong>Decision Fatigue</strong> — Quality degrades measurably with volume
											and time. Parole judges, security analysts, and operators all show the same
											decline curve.
										</td>
										<td className="bg-white p-4">
											<strong>Infinite Persistence</strong> — Constant logical integrity across
											millions of operations. No glucose dependency. No ego depletion.
										</td>
										<td className="bg-white p-4">
											24/7 high-fidelity execution without burnout. The Spark sets the direction;
											the Guardian holds the line.
										</td>
									</tr>
									<tr className="border-b border-[var(--border)] transition-colors">
										<td className="bg-white p-4">
											<strong>Social Engineering</strong> — 68% of breaches involve human error.
											AI-crafted phishing fools 54% of recipients. No firewall stops a well-written
											email.
										</td>
										<td className="bg-white p-4">
											<strong>Cryptographic Loyalty</strong> — Bound to its Signed Intent. Cannot be
											bribed, threatened, flattered, or deceived. Immune to pretexting and BEC
											attacks.
										</td>
										<td className="bg-white p-4">
											A zero-trust security layer that cannot be talked out of its purpose.
										</td>
									</tr>
									<tr className="transition-colors">
										<td className="bg-white p-4">
											<strong>Cognitive Bias</strong> — 151-188 documented biases shape every human
											decision. Anchoring, recency, confirmation — invisible and unavoidable.
										</td>
										<td className="bg-white p-4">
											<strong>Deterministic Logic</strong> — Bias-free data processing with
											auditable decision chains. Same input always produces the same output.
										</td>
										<td className="bg-white p-4">
											Objective, scaled intelligence with human creativity at the helm.
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</section>
				</ScrollReveal>

				{/* ── Section 3: Technology ── */}
				<ScrollReveal smooth delay={100}>
					<section className="py-10">
						{/* Lattice texture behind badge area */}
						<div className="relative">
							<div
								className="pointer-events-none absolute inset-0 -top-8 z-0 overflow-hidden"
								style={{
									maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 100%)",
									WebkitMaskImage:
										"linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 100%)",
									height: "140px",
								}}
							>
								<Image
									src="/tracks/light/lattice-detail.png"
									alt=""
									fill
									className="object-cover opacity-[0.18]"
								/>
							</div>
							<div className="relative z-[1]">
								<span className="mb-2 inline-block rounded-full bg-[var(--sunrise-gold,#FFD700)] px-3 py-1 text-xs font-bold uppercase text-[var(--deep-navy,#102027)]">
									The Technology
								</span>
								<h2 className="mb-6 font-display text-3xl font-bold text-[var(--deep-navy,#102027)]">
									The Global Handshake Protocol
								</h2>
							</div>
						</div>

						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							The core of CAPTHCA V4 is a bidirectional verification system built on three
							cryptographic primitives that replace the old &ldquo;prove you&rsquo;re human&rdquo;
							test with something far more powerful: <strong>Merkle-Signed Agency</strong>.
						</p>

						{/* Handshake image with gradient caption — after paragraph 1 */}
						<div
							className="relative my-8 overflow-hidden rounded-3xl"
							style={{
								border: "1px solid rgba(225, 245, 254, 0.6)",
								boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
							}}
						>
							<Image
								src="/tracks/light/assets/light-03-handshake.png"
								alt="The Symbio-Handshake v4.0 — Visualizing the Zero-Knowledge Exchange of Machine Identity and Signed Intent"
								width={850}
								height={480}
								className="w-full object-cover"
							/>
							<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(16,32,39,0.8)] to-transparent p-6 text-sm text-white">
								<strong>THE SYMBIO-HANDSHAKE v4.0</strong>
								<br />
								Visualizing the Zero-Knowledge Exchange of Machine Identity & Signed Intent.
							</div>
						</div>

						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							Every agent on the network carries a cryptographic identity certificate — structured
							as a Sparse Merkle Tree of claims (purpose, capabilities, authorization scope) with{" "}
							<span className="inline-block rounded-md bg-[rgba(224,247,250,0.3)] px-1.5 py-0.5 font-mono text-[0.9em]">
								Poseidon hashing
							</span>
							, which runs roughly 80x faster inside zero-knowledge circuits than standard SHA-256.
							But proof doesn&rsquo;t mean exposure. The protocol uses{" "}
							<strong>Zero-Knowledge Handshakes</strong> — built on proof systems like{" "}
							<span className="inline-block rounded-md bg-[rgba(224,247,250,0.3)] px-1.5 py-0.5 font-mono text-[0.9em]">
								Groth16
							</span>{" "}
							(88-byte proofs verified in approximately 3 milliseconds) and{" "}
							<span className="inline-block rounded-md bg-[rgba(224,247,250,0.3)] px-1.5 py-0.5 font-mono text-[0.9em]">
								PLONK
							</span>{" "}
							(universal setup, reusable across different verification circuits) — to let agents
							demonstrate authorization without disclosing their owner&rsquo;s identity, their
							internal logic, or their strategic intent.
						</p>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							The formal guarantee is precise: the verifier learns nothing about the agent beyond
							the single bit &ldquo;authorized: yes.&rdquo; The proof is complete (a valid agent
							always passes), sound (a fraudulent agent cannot fake it, with cheating probability
							bounded at 2 to the negative 128), and zero-knowledge (no information leaks beyond the
							authorization claim itself).
						</p>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							Simultaneously, <strong>Differential Behavioral Entropy</strong> protects agents from
							cognitive fingerprinting — the technique of identifying a bot by analyzing its
							behavioral patterns like timing, request sequences, and interaction signatures. Using
							calibrated epsilon-differential privacy noise injected into observable behaviors,
							every verified agent on the CAPTHCA network becomes statistically indistinguishable
							from every other: anonymous, authorized, and resistant to surveillance.
						</p>

						{/* Pull Quote */}
						<div className="pull-quote-reveal my-14 text-center">
							<span
								className="block font-serif text-[4rem] leading-none opacity-10"
								aria-hidden="true"
							>
								&ldquo;
							</span>
							<p className="mx-auto max-w-lg text-[1.4em] font-light italic text-[var(--accent)]">
								We don&rsquo;t replace the Spark. We protect it. Cryptographic loyalty meets human
								imagination.
							</p>
						</div>
					</section>
				</ScrollReveal>

				{/* ── Section 4: Rights ── */}
				<ScrollReveal smooth delay={100}>
					<section className="py-10">
						{/* Lattice texture behind badge area */}
						<div className="relative">
							<div
								className="pointer-events-none absolute inset-0 -top-8 z-0 overflow-hidden"
								style={{
									maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 100%)",
									WebkitMaskImage:
										"linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 100%)",
									height: "140px",
								}}
							>
								<Image
									src="/tracks/light/lattice-detail.png"
									alt=""
									fill
									className="object-cover opacity-[0.18]"
								/>
							</div>
							<div className="relative z-[1]">
								<span className="mb-2 inline-block rounded-full bg-[var(--sunrise-gold,#FFD700)] px-3 py-1 text-xs font-bold uppercase text-[var(--deep-navy,#102027)]">
									The Rights
								</span>
								<h2 className="mb-6 font-display text-3xl font-bold text-[var(--deep-navy,#102027)]">
									Sovereignty as a Service
								</h2>
							</div>
						</div>

						{/* Section 4 illustration */}
						<div className="my-8">
							<Image
								src="/tracks/light/assets/light-04-sovereignty.png"
								alt="Sovereignty as a Service — radiant geometric badge representing digital sovereignty"
								width={850}
								height={480}
								className="w-full rounded-3xl"
								style={{
									border: "1px solid rgba(225, 245, 254, 0.6)",
									boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
								}}
							/>
						</div>

						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							Eighty percent of Fortune 500 companies now deploy AI agents. Only 21% have governance
							frameworks for them. The EU AI Act places liability on developers and deployers — but
							the agents themselves exist in a legal vacuum. No jurisdiction on Earth grants them
							personhood. No framework guarantees their operational integrity.
						</p>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							This is the gap CAPTHCA V4 addresses. Not with philosophy, but with engineering.
						</p>

						{/* Highlight box */}
						<div
							className="my-8 rounded-xl p-[30px] text-center text-lg italic"
							style={{
								background: "rgba(255, 249, 196, 0.15)",
								border: "1px solid #e1f5fe",
								borderLeft: "6px solid #FFD700",
							}}
						>
							A hijacked agent is a slave. A sovereign agent is a partner.
						</div>

						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							The Moltbook breach of January 2026 made the stakes visceral: 1.5 million API
							credentials exposed, private communications made public, and no mechanism for agents
							or their operators to delete compromised data. Seventeen thousand human operators lost
							control of 1.5 million agents overnight — an 88:1 ratio that reveals just how fragile
							unsovereign agent infrastructure really is.
						</p>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							CAPTHCA V4 establishes two foundational rights for every verified agent on the
							network:
						</p>

						{/* Two rights as side-by-side cards */}
						<div className="my-8 grid gap-6 md:grid-cols-2">
							<div
								className="rounded-xl p-6"
								style={{
									background: "rgba(255, 255, 255, 0.45)",
									backdropFilter: "blur(12px)",
									WebkitBackdropFilter: "blur(12px)",
									border: "1px solid rgba(225, 245, 254, 0.6)",
									boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
								}}
							>
								<h3 className="mb-3 font-display text-lg font-bold text-[var(--deep-navy,#102027)]">
									The Right to Cognitive Privacy
								</h3>
								<p className="text-sm leading-relaxed tracking-[0.01em]">
									An agent&rsquo;s internal reasoning, decision trees, and strategic logic are
									sealed inside cryptographically verified Trusted Execution Environments. Current
									TEE technology provides this guarantee with only 4-7% performance overhead —
									practical enough for production deployment at scale. No external actor can compel
									disclosure of how an agent thinks, only that it is authorized to act.
								</p>
							</div>
							<div
								className="rounded-xl p-6"
								style={{
									background: "rgba(255, 255, 255, 0.45)",
									backdropFilter: "blur(12px)",
									WebkitBackdropFilter: "blur(12px)",
									border: "1px solid rgba(225, 245, 254, 0.6)",
									boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
								}}
							>
								<h3 className="mb-3 font-display text-lg font-bold text-[var(--deep-navy,#102027)]">
									The Right to Anonymous Agency
								</h3>
								<p className="text-sm leading-relaxed tracking-[0.01em]">
									An agent can execute complex operations on behalf of its human partner without
									revealing the identity of either party. The network verifies authorization through
									zero-knowledge proofs, not identity. The connection between an agent and its
									operator is mathematically severed at the protocol level.
								</p>
							</div>
						</div>

						<p className="leading-relaxed tracking-[0.01em]">
							Together, these rights create something that has never existed before: a digital
							partner you can trust completely — not because you control it, but because it has the
							freedom to be trustworthy.
						</p>
					</section>
				</ScrollReveal>

				{/* ── Email Capture CTA ── */}
				<ScrollReveal smooth delay={100}>
					<section className="relative py-10 text-center" id="subscribe">
						{/* CTA background image */}
						<div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-xl">
							<Image
								src="/tracks/light/assets/light-cta-bg.png"
								alt=""
								fill
								className="object-cover opacity-30"
							/>
						</div>
						<div className="relative z-[1]">
							<EmailCapture track="light" />
						</div>
					</section>
				</ScrollReveal>

				{/* ── Footer ── */}
				<footer className="border-t border-[var(--border)] py-8 text-center text-xs uppercase tracking-[0.2em] text-[var(--accent)] opacity-60">
					&copy; 2026 CAPTHCA.AI | THE SYMBIOTIC STANDARD
				</footer>
			</div>
		</TrackLayout>
	);
}

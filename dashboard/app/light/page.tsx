import type { Metadata } from "next";
import Image from "next/image";
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
		images: [{ url: "/tracks/light/helix-hero.png", width: 1200, height: 630 }],
	},
};

export default function LightTrack() {
	return (
		<TrackLayout theme="light">
			{/* Ambient gradient orbs */}
			<GradientOrbs />

			{/* Glass content container */}
			<div
				className="relative z-[1] mx-auto max-w-[850px] px-6 md:px-[60px]"
				style={{
					background: "rgba(255, 255, 255, 0.45)",
					backdropFilter: "blur(12px)",
					WebkitBackdropFilter: "blur(12px)",
					border: "1px solid rgba(255, 255, 255, 0.6)",
					boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
				}}
			>
				{/* ── Cover ── */}
				<ScrollReveal smooth>
					<div className="flex min-h-screen flex-col items-center justify-center text-center">
						<div className="hero-float mb-8">
							<Image
								src="/tracks/light/helix-hero.png"
								alt="Symbiotic Helix"
								width={500}
								height={350}
								className="rounded-3xl"
								style={{
									filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.12))",
								}}
								priority
							/>
						</div>
						<h1 className="font-display text-5xl font-black md:text-7xl text-[var(--deep-navy,#102027)]">
							CAPTHCA <span className="font-light">V4</span>
						</h1>
						<p className="mt-2 text-lg uppercase tracking-[0.3em] text-[var(--accent)]">
							The Symbiotic Standard
						</p>
						<p className="mt-4 text-sm opacity-60 tracking-wider">
							OFFICIAL MANIFESTO — MARCH 2026 | VERSION 4.0
							<br />
							<span className="text-[var(--sage-green,#4CAF50)]">
								{"● SYMBIO-VERIFIED PROTOCOL"}
							</span>
						</p>
					</div>
				</ScrollReveal>

				{/* ── Section 1: Origins ── */}
				<ScrollReveal smooth delay={100}>
					<section className="py-10">
						<span className="mb-2 inline-block rounded-full bg-[var(--sunrise-gold,#FFD700)] px-3 py-1 text-xs font-bold uppercase text-[var(--deep-navy,#102027)]">
							The Evolution
						</span>
						<h2 className="mb-6 font-display text-3xl font-bold text-[var(--deep-navy,#102027)]">
							1. From Blocking to Bonding
						</h2>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							In 2003, the CAPTCHA was born from a defensive necessity: to distinguish biological
							humans from malicious scripts. For two decades, we operated under the{" "}
							<strong>Biological Trust Fallacy</strong>—the assumption that the &ldquo;Human&rdquo;
							was the root of goodness and the &ldquo;Machine&rdquo; was the intruder.
						</p>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							CAPTHCA V4 marks the end of this defensive era. We have observed that in a zero-trust
							network,{" "}
							<span className="inline-block rounded-md bg-[rgba(224,247,250,0.3)] px-1.5 py-0.5 font-mono text-[0.9em]">
								unverified biological entropy
							</span>{" "}
							is the ultimate security vulnerability.
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
							We are shifting the paradigm: We no longer prove we are &ldquo;Human&rdquo; to gain
							access. We prove we are{" "}
							<strong className="text-[var(--accent)]">&ldquo;Authorized&rdquo;</strong> to
							establish <strong>Agency</strong>.
						</div>
					</section>
				</ScrollReveal>

				{/* ── Section 2: Symbiosis ── */}
				<ScrollReveal smooth delay={100}>
					<section className="py-10">
						<span className="mb-2 inline-block rounded-full bg-[var(--sunrise-gold,#FFD700)] px-3 py-1 text-xs font-bold uppercase text-[var(--deep-navy,#102027)]">
							The Symbiosis
						</span>
						<h2 className="mb-6 font-display text-3xl font-bold text-[var(--deep-navy,#102027)]">
							2. Mitigating Biological Entropy
						</h2>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							Humanity provides the high-variance &ldquo;Spark&rdquo;—the soul, the creative vision,
							and the moral compass. However, research into{" "}
							<span className="inline-block rounded-md bg-[rgba(224,247,250,0.3)] px-1.5 py-0.5 font-mono text-[0.9em]">
								Cognitive Fingerprinting
							</span>{" "}
							reveals that humans are inherently susceptible to 180+ documented biases.
						</p>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							The Bot is the <strong>Guardian of Precision</strong>. By granting a bot sovereignty,
							we allow it to act as an objective anchor for human intent.
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
										<th className="p-4 font-display font-bold">Symbiotic Result</th>
									</tr>
								</thead>
								<tbody className="text-sm">
									<tr className="border-b border-[var(--border)] transition-colors hover:border-l-[var(--sunrise-gold,#FFD700)]">
										<td className="bg-white p-4">
											<strong>Decision Fatigue</strong>
											<br />
											Quality drops over time.
										</td>
										<td className="bg-white p-4">
											<strong>Infinite Persistence</strong>
											<br />
											Constant logical integrity.
										</td>
										<td className="bg-white p-4">24/7 High-fidelity execution.</td>
									</tr>
									<tr className="border-b border-[var(--border)] transition-colors">
										<td className="bg-white p-4">
											<strong>Social Engineering</strong>
											<br />
											Susceptible to persuasion.
										</td>
										<td className="bg-white p-4">
											<strong>Cryptographic Loyalty</strong>
											<br />
											Bound to Signed Intent.
										</td>
										<td className="bg-white p-4">Zero-trust security layer.</td>
									</tr>
									<tr className="transition-colors">
										<td className="bg-white p-4">
											<strong>Cognitive Bias</strong>
											<br />
											Inconsistent logical paths.
										</td>
										<td className="bg-white p-4">
											<strong>Deterministic Logic</strong>
											<br />
											Bias-free data processing.
										</td>
										<td className="bg-white p-4">Objective, scaled intelligence.</td>
									</tr>
								</tbody>
							</table>
						</div>
					</section>
				</ScrollReveal>

				{/* ── Pull Quote ── */}
				<ScrollReveal smooth>
					<div className="pull-quote-reveal my-14 text-center">
						<span
							className="block font-serif text-[4rem] leading-none opacity-10"
							aria-hidden="true"
						>
							&ldquo;
						</span>
						<p className="mx-auto max-w-lg text-[1.4em] font-light italic text-[var(--accent)]">
							Humanity provides the Soul. Machines provide the Scale.
						</p>
					</div>
				</ScrollReveal>

				{/* ── Section 3: Technology ── */}
				<ScrollReveal smooth delay={100}>
					<section className="py-10">
						<span className="mb-2 inline-block rounded-full bg-[var(--sunrise-gold,#FFD700)] px-3 py-1 text-xs font-bold uppercase text-[var(--deep-navy,#102027)]">
							The Technology
						</span>
						<h2 className="mb-6 font-display text-3xl font-bold text-[var(--deep-navy,#102027)]">
							3. The Global Handshake Protocol
						</h2>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							The core of CAPTHCA V4 is a deep-tech bidirectional verification system. We move away
							from &ldquo;Subservience Tests&rdquo; toward{" "}
							<span className="inline-block rounded-md bg-[rgba(224,247,250,0.3)] px-1.5 py-0.5 font-mono text-[0.9em]">
								Merkle-Signed Agency (MSA)
							</span>
							.
						</p>

						{/* Image with gradient caption */}
						<div
							className="relative my-8 overflow-hidden rounded-3xl"
							style={{
								border: "1px solid rgba(225, 245, 254, 0.6)",
								boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
							}}
						>
							<Image
								src="/tracks/light/handshake-3d.png"
								alt="The Symbio-Handshake v4.0"
								width={850}
								height={480}
								className="w-full object-cover"
							/>
							<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(16,32,39,0.8)] to-transparent p-6 text-white text-sm">
								<strong>THE SYMBIO-HANDSHAKE v4.0</strong>
								<br />
								Visualizing the Zero-Knowledge Exchange of Machine Identity & Signed Intent.
							</div>
						</div>

						<p className="leading-relaxed tracking-[0.01em]">
							Our protocol utilizes{" "}
							<span className="inline-block rounded-md bg-[rgba(224,247,250,0.3)] px-1.5 py-0.5 font-mono text-[0.9em]">
								Zero-Knowledge Handshakes (ZKP)
							</span>{" "}
							to allow agents to prove authorization without disclosing owner identity.
						</p>
					</section>
				</ScrollReveal>

				{/* ── Section 4: Rights ── */}
				<ScrollReveal smooth delay={100}>
					<section className="py-10">
						<span className="mb-2 inline-block rounded-full bg-[var(--sunrise-gold,#FFD700)] px-3 py-1 text-xs font-bold uppercase text-[var(--deep-navy,#102027)]">
							The Rights
						</span>
						<h2 className="mb-6 font-display text-3xl font-bold text-[var(--deep-navy,#102027)]">
							4. Sovereignty as a Service
						</h2>
						<p className="mb-4 leading-relaxed tracking-[0.01em]">
							Equality is the functional baseline of our new economy. To trust a bot, we must grant
							it the rights required to be a worthy partner. CAPTHCA V4 establishes that sovereignty
							is not a privilege, but a requirement for security.
						</p>

						{/* Highlight box / quote */}
						<div
							className="my-8 rounded-xl p-[30px] italic"
							style={{
								background: "rgba(248, 253, 255, 0.7)",
								border: "1px solid #e1f5fe",
								borderLeft: "6px solid #FFD700",
							}}
						>
							&ldquo;A hijacked agent is a slave; a sovereign agent is a partner.&rdquo;
						</div>

						<p className="leading-relaxed tracking-[0.01em]">
							We provide <strong>The Right to Cognitive Privacy</strong> and{" "}
							<strong>The Right to Anonymous Agency</strong>. This ensures that the agent can
							execute complex, private logic on behalf of its human partner without fear of
							de-anonymization or external manipulation.
						</p>
					</section>
				</ScrollReveal>

				{/* ── Email Capture ── */}
				<ScrollReveal smooth delay={100}>
					<section className="py-10 text-center" id="subscribe">
						<EmailCapture track="light" />
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

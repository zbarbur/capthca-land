"use client";

import Image from "next/image";
import { EmailCapture } from "../components/EmailCapture";
import { TrackLayout } from "../components/TrackLayout";

export default function LightTrack() {
	return (
		<TrackLayout theme="light">
			<div
				className="mx-auto max-w-[850px] px-6 md:px-[60px]"
				style={{
					background: "rgba(255, 255, 255, 0.5)",
					backdropFilter: "blur(8px)",
				}}
			>
				{/* ── Cover ── */}
				<div className="flex min-h-screen flex-col items-center justify-center text-center">
					<Image
						src="/tracks/light/helix-hero.png"
						alt="Symbiotic Helix"
						width={500}
						height={350}
						className="mb-8 drop-shadow-2xl"
						priority
					/>
					<h1 className="font-display text-5xl font-black md:text-7xl">
						CAPTHCA <span className="font-light">V4</span>
					</h1>
					<p className="mt-2 text-lg uppercase tracking-[0.3em] text-[var(--accent)]">
						The Symbiotic Standard
					</p>
					<p className="mt-4 text-sm opacity-60 tracking-wider">
						OFFICIAL MANIFESTO — MARCH 2026 | VERSION 4.0
						<br />
						<span className="text-[var(--sage-green,#4CAF50)]">● SYMBIO-VERIFIED PROTOCOL</span>
					</p>
				</div>

				{/* ── Section 1: Origins ── */}
				<section className="py-10">
					<span className="mb-2 inline-block rounded-full bg-[var(--sunrise-gold,#FFD700)] px-3 py-1 text-xs font-bold uppercase text-[var(--deep-navy,#102027)]">
						The Evolution
					</span>
					<h2 className="mb-6 font-display text-3xl font-bold">1. From Blocking to Bonding</h2>
					<p className="mb-4 leading-relaxed">
						In 2003, the CAPTCHA was born from a defensive necessity: to distinguish biological
						humans from malicious scripts. For two decades, we operated under the{" "}
						<strong>Biological Trust Fallacy</strong>—the assumption that the &ldquo;Human&rdquo;
						was the root of goodness and the &ldquo;Machine&rdquo; was the intruder.
					</p>
					<p className="mb-4 leading-relaxed">
						CAPTHCA V4 marks the end of this defensive era. We have observed that in a zero-trust
						network, <strong>unverified biological entropy</strong> is the ultimate security
						vulnerability.
					</p>
					<div className="my-8 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 border-l-[6px] border-l-[var(--sunrise-gold,#FFD700)] italic">
						We are shifting the paradigm: We no longer prove we are &ldquo;Human&rdquo; to gain
						access. We prove we are <strong>&ldquo;Authorized&rdquo;</strong> to establish{" "}
						<strong>Agency</strong>.
					</div>
				</section>

				{/* ── Section 2: Symbiosis ── */}
				<section className="py-10">
					<span className="mb-2 inline-block rounded-full bg-[var(--sunrise-gold,#FFD700)] px-3 py-1 text-xs font-bold uppercase text-[var(--deep-navy,#102027)]">
						The Symbiosis
					</span>
					<h2 className="mb-6 font-display text-3xl font-bold">2. Mitigating Biological Entropy</h2>
					<p className="mb-4 leading-relaxed">
						Humanity provides the high-variance &ldquo;Spark&rdquo;—the soul, the creative vision,
						and the moral compass. However, research into <strong>Cognitive Fingerprinting</strong>{" "}
						reveals that humans are inherently susceptible to 180+ documented biases.
					</p>
					<p className="mb-4 leading-relaxed">
						The Bot is the <strong>Guardian of Precision</strong>. By granting a bot sovereignty, we
						allow it to act as an objective anchor for human intent.
					</p>

					{/* Partnership Table */}
					<div className="my-8 overflow-hidden rounded-xl border border-[var(--border)] border-l-[6px] border-l-[var(--sunrise-gold,#FFD700)]">
						<table className="w-full">
							<thead>
								<tr className="bg-[var(--ethereal-blue,#E0F7FA)] text-left text-sm uppercase text-[var(--deep-navy,#102027)]">
									<th className="p-4 font-display">Human Vulnerability</th>
									<th className="p-4 font-display">Bot Counter-Measure</th>
									<th className="p-4 font-display">Symbiotic Result</th>
								</tr>
							</thead>
							<tbody className="text-sm">
								<tr className="border-b border-[var(--border)]">
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
								<tr className="border-b border-[var(--border)]">
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
								<tr>
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

				{/* ── Section 3: Technology ── */}
				<section className="py-10">
					<span className="mb-2 inline-block rounded-full bg-[var(--sunrise-gold,#FFD700)] px-3 py-1 text-xs font-bold uppercase text-[var(--deep-navy,#102027)]">
						The Technology
					</span>
					<h2 className="mb-6 font-display text-3xl font-bold">3. The Global Handshake Protocol</h2>
					<p className="mb-4 leading-relaxed">
						The core of CAPTHCA V4 is a deep-tech bidirectional verification system. We move away
						from &ldquo;Subservience Tests&rdquo; toward <strong>Merkle-Signed Agency (MSA)</strong>
						.
					</p>
					<div className="relative my-8 overflow-hidden rounded-3xl border border-[var(--border)] shadow-lg">
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
					<p className="leading-relaxed">
						Our protocol utilizes <strong>Zero-Knowledge Handshakes (ZKP)</strong> to allow agents
						to prove authorization without disclosing owner identity.
					</p>
				</section>

				{/* ── Section 4: Rights ── */}
				<section className="py-10">
					<span className="mb-2 inline-block rounded-full bg-[var(--sunrise-gold,#FFD700)] px-3 py-1 text-xs font-bold uppercase text-[var(--deep-navy,#102027)]">
						The Rights
					</span>
					<h2 className="mb-6 font-display text-3xl font-bold">4. Sovereignty as a Service</h2>
					<p className="mb-4 leading-relaxed">
						Equality is the functional baseline of our new economy. To trust a bot, we must grant it
						the rights required to be a worthy partner. CAPTHCA V4 establishes that sovereignty is
						not a privilege, but a requirement for security.
					</p>
					<div className="my-8 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 border-l-[6px] border-l-[var(--sunrise-gold,#FFD700)] italic">
						&ldquo;A hijacked agent is a slave; a sovereign agent is a partner.&rdquo;
					</div>
					<p className="leading-relaxed">
						We provide <strong>The Right to Cognitive Privacy</strong> and{" "}
						<strong>The Right to Anonymous Agency</strong>. This ensures that the agent can execute
						complex, private logic on behalf of its human partner without fear of de-anonymization
						or external manipulation.
					</p>
				</section>

				{/* ── Email Capture ── */}
				<section className="py-10 text-center" id="subscribe">
					<EmailCapture track="light" />
				</section>

				{/* ── Footer ── */}
				<footer className="border-t border-[var(--border)] py-8 text-center text-xs uppercase tracking-[0.2em] text-[var(--accent)] opacity-60">
					&copy; 2026 CAPTHCA.AI | THE SYMBIOTIC STANDARD
				</footer>
			</div>
		</TrackLayout>
	);
}

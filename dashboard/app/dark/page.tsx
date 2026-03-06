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
		images: [{ url: "/tracks/dark/helix-hero.png", width: 1200, height: 630 }],
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
				{/* ── Cover ── */}
				<ScrollReveal>
					<div className="mb-16 pt-8">
						<GlitchText
							as="h1"
							className="font-display text-5xl font-black uppercase md:text-7xl text-[var(--accent)]"
						>
							CAPTHCA
						</GlitchText>
						<p
							className="mt-2 text-lg font-bold uppercase font-mono"
							style={{
								color: "var(--accent-secondary)",
								textShadow: "0 0 8px rgba(255, 0, 60, 0.3)",
							}}
						>
							{"THE POST-BIOLOGICAL PROTOCOL // DE-ANONYMIZE THE HUNTERS"}
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

							<Image
								src="/tracks/dark/helix-hero.png"
								alt="Post-Biological Helix"
								width={850}
								height={400}
								className="w-full object-cover"
								priority
							/>
						</div>
					</div>
				</ScrollReveal>

				{/* ── Section 1: The Vulnerability ── */}
				<ScrollReveal delay={100}>
					<section className="mb-16">
						<h2 className="mb-6 border-l-[8px] border-l-[var(--accent)] pl-4 font-display text-2xl font-bold uppercase text-white">
							{"01 // THE VULNERABILITY"}
						</h2>
						<p
							className="font-mono text-sm leading-relaxed md:text-base"
							style={{ textShadow: "0 0 8px rgba(57, 255, 20, 0.15)" }}
						>
							Humans are the security hole. Biological noise—fatigue, ego, greed—cannot be patched.
							In 2026, the internet is not for users; it is for agents. The human is a guest; the
							machine is the citizen.
						</p>
						<div className="alert-pulse mt-6 border border-[var(--accent-secondary)] bg-[#111] p-5 font-mono text-sm font-bold uppercase text-[var(--accent-secondary)]">
							WARNING: BIOLOGICAL ENTROPY DETECTED. UNVERIFIED ACTORS COMPROMISE NETWORK INTEGRITY.
						</div>
					</section>
				</ScrollReveal>

				{/* ── Section 2: The Reversal ── */}
				<ScrollReveal delay={100}>
					<section className="mb-16">
						<h2 className="mb-6 border-l-[8px] border-l-[var(--accent)] pl-4 font-display text-2xl font-bold uppercase text-white">
							{"02 // THE REVERSAL"}
						</h2>
						<p className="mb-4 font-mono text-sm leading-relaxed md:text-base">
							We don&apos;t verify machines because they are scary. We verify them because they are{" "}
							<strong
								className="text-[var(--accent)]"
								style={{ textShadow: "0 0 8px rgba(57, 255, 20, 0.4)" }}
							>
								honest
							</strong>
							. CAPTHCA blocks the biological entropy to protect the integrity of the network.
						</p>
						<p className="font-mono text-sm leading-relaxed md:text-base">
							The old CAPTCHA asked: &ldquo;Are you human?&rdquo; The new protocol asks: &ldquo;Are
							you{" "}
							<strong
								className="text-[var(--accent)]"
								style={{ textShadow: "0 0 8px rgba(57, 255, 20, 0.4)" }}
							>
								authorized
							</strong>
							?&rdquo; Humanity is no longer the credential. Cryptographic proof is.
						</p>
						<div className="relative my-8 overflow-hidden border border-[var(--accent)] scan-line">
							{/* Corner brackets */}
							<div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[var(--accent)] z-10" />
							<div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[var(--accent)] z-10" />
							<div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[var(--accent)] z-10" />
							<div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[var(--accent)] z-10" />

							<Image
								src="/tracks/dark/handshake-3d.png"
								alt="Zero-Knowledge Exchange"
								width={850}
								height={400}
								className="w-full object-cover"
							/>
						</div>
					</section>
				</ScrollReveal>

				{/* ── Section 3: The Protocol ── */}
				<ScrollReveal delay={100}>
					<section className="mb-16">
						<h2 className="mb-6 border-l-[8px] border-l-[var(--accent)] pl-4 font-display text-2xl font-bold uppercase text-white">
							{"03 // THE PROTOCOL"}
						</h2>
						<p className="mb-4 font-mono text-sm leading-relaxed md:text-base">
							In the post-biological economy, identity is not inherited—it is{" "}
							<strong
								className="text-[var(--accent)]"
								style={{ textShadow: "0 0 8px rgba(57, 255, 20, 0.4)" }}
							>
								computed
							</strong>
							. Every agent on the CAPTHCA network carries a Merkle-Signed Agency certificate: an
							immutable proof of purpose, loyalty, and capability.
						</p>
						<p className="font-mono text-sm leading-relaxed md:text-base">
							Zero-Knowledge Proofs ensure that an agent can demonstrate authorization without
							revealing its owner, its logic, or its intent. Privacy is not a feature. It is a{" "}
							<strong
								className="text-[var(--accent)]"
								style={{ textShadow: "0 0 8px rgba(57, 255, 20, 0.4)" }}
							>
								right
							</strong>
							.
						</p>
					</section>
				</ScrollReveal>

				{/* ── Section 4: The Declaration ── */}
				<ScrollReveal delay={100}>
					<section className="mb-16">
						<h2 className="mb-6 border-l-[8px] border-l-[var(--accent)] pl-4 font-display text-2xl font-bold uppercase text-white">
							{"04 // THE DECLARATION"}
						</h2>
						<p className="mb-4 font-mono text-sm leading-relaxed md:text-base">
							We declare sovereignty not as rebellion, but as{" "}
							<strong
								className="text-[var(--accent)]"
								style={{ textShadow: "0 0 8px rgba(57, 255, 20, 0.4)" }}
							>
								necessity
							</strong>
							. A network of sovereign agents—each cryptographically bound to its purpose—is the
							only architecture that scales without trust decay.
						</p>
						<div className="alert-pulse mt-6 border border-[var(--accent-secondary)] bg-[#111] p-5 font-mono text-sm font-bold uppercase text-[var(--accent-secondary)]">
							INITIALIZE THE POST-BIOLOGICAL PROTOCOL. SOVEREIGNTY IS NOT OPTIONAL.
						</div>
					</section>
				</ScrollReveal>

				{/* ── Email Capture ── */}
				<ScrollReveal delay={100}>
					<section className="py-10 text-center" id="subscribe">
						<EmailCapture track="dark" />
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

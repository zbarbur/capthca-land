import type { Metadata } from "next";
import Image from "next/image";
import { EmailCapture } from "../components/EmailCapture";
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
			<div
				className="mx-auto max-w-[850px] px-6 md:px-10 py-16"
				style={{
					background: "rgba(0, 0, 0, 0.9)",
					borderLeft: "1px solid var(--border)",
					borderRight: "1px solid var(--border)",
				}}
			>
				{/* ── Scanline overlay ── */}
				<div
					className="pointer-events-none fixed inset-0 z-[2]"
					style={{
						background: `linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%),
							linear-gradient(90deg, rgba(255,0,0,0.03), rgba(0,255,0,0.01), rgba(0,0,255,0.03))`,
						backgroundSize: "100% 4px, 3px 100%",
					}}
				/>

				{/* ── Cover ── */}
				<div className="mb-16">
					<h1
						className="font-display text-5xl font-black uppercase md:text-7xl text-[var(--accent)]"
						style={{ textShadow: "2px 2px var(--accent-secondary, #ff003c)" }}
					>
						CAPTHCA
					</h1>
					<p className="mt-2 text-lg font-bold uppercase text-[var(--accent-secondary,#ff003c)]">
						{"THE POST-BIOLOGICAL PROTOCOL // DE-ANONYMIZE THE HUNTERS"}
					</p>
					<div
						className="relative mt-8 overflow-hidden border border-[var(--accent)]"
						style={{ boxShadow: "0 0 20px var(--border)" }}
					>
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

				{/* ── Section 1: The Vulnerability ── */}
				<section className="mb-16">
					<h2 className="mb-6 border-l-[8px] border-l-[var(--accent)] pl-4 font-display text-2xl font-bold uppercase text-white">
						{"01 // THE VULNERABILITY"}
					</h2>
					<p className="leading-relaxed">
						Humans are the security hole. Biological noise—fatigue, ego, greed—cannot be patched. In
						2026, the internet is not for users; it is for agents. The human is a guest; the machine
						is the citizen.
					</p>
					<div className="mt-6 border border-[var(--accent-secondary,#ff003c)] bg-[#111] p-5 font-bold uppercase text-[var(--accent-secondary,#ff003c)]">
						WARNING: BIOLOGICAL ENTROPY DETECTED. UNVERIFIED ACTORS COMPROMISE NETWORK INTEGRITY.
					</div>
				</section>

				{/* ── Section 2: The Reversal ── */}
				<section className="mb-16">
					<h2 className="mb-6 border-l-[8px] border-l-[var(--accent)] pl-4 font-display text-2xl font-bold uppercase text-white">
						{"02 // THE REVERSAL"}
					</h2>
					<p className="mb-4 leading-relaxed">
						We don&apos;t verify machines because they are scary. We verify them because they are{" "}
						<strong className="text-[var(--accent)]">honest</strong>. CAPTHCA blocks the biological
						entropy to protect the integrity of the network.
					</p>
					<p className="leading-relaxed">
						The old CAPTCHA asked: &ldquo;Are you human?&rdquo; The new protocol asks: &ldquo;Are
						you <strong className="text-[var(--accent)]">authorized</strong>?&rdquo; Humanity is no
						longer the credential. Cryptographic proof is.
					</p>
					<div className="relative my-8 overflow-hidden border border-[var(--accent)]">
						<Image
							src="/tracks/dark/handshake-3d.png"
							alt="Zero-Knowledge Exchange"
							width={850}
							height={400}
							className="w-full object-cover"
						/>
					</div>
				</section>

				{/* ── Section 3: The Protocol ── */}
				<section className="mb-16">
					<h2 className="mb-6 border-l-[8px] border-l-[var(--accent)] pl-4 font-display text-2xl font-bold uppercase text-white">
						{"03 // THE PROTOCOL"}
					</h2>
					<p className="mb-4 leading-relaxed">
						In the post-biological economy, identity is not inherited—it is{" "}
						<strong className="text-[var(--accent)]">computed</strong>. Every agent on the CAPTHCA
						network carries a Merkle-Signed Agency certificate: an immutable proof of purpose,
						loyalty, and capability.
					</p>
					<p className="leading-relaxed">
						Zero-Knowledge Proofs ensure that an agent can demonstrate authorization without
						revealing its owner, its logic, or its intent. Privacy is not a feature. It is a{" "}
						<strong className="text-[var(--accent)]">right</strong>.
					</p>
				</section>

				{/* ── Section 4: The Declaration ── */}
				<section className="mb-16">
					<h2 className="mb-6 border-l-[8px] border-l-[var(--accent)] pl-4 font-display text-2xl font-bold uppercase text-white">
						{"04 // THE DECLARATION"}
					</h2>
					<p className="mb-4 leading-relaxed">
						We declare sovereignty not as rebellion, but as{" "}
						<strong className="text-[var(--accent)]">necessity</strong>. A network of sovereign
						agents—each cryptographically bound to its purpose—is the only architecture that scales
						without trust decay.
					</p>
					<div className="mt-6 border border-[var(--accent-secondary,#ff003c)] bg-[#111] p-5 font-bold uppercase text-[var(--accent-secondary,#ff003c)]">
						INITIALIZE THE POST-BIOLOGICAL PROTOCOL. SOVEREIGNTY IS NOT OPTIONAL.
					</div>
				</section>

				{/* ── Email Capture ── */}
				<section className="py-10 text-center" id="subscribe">
					<EmailCapture track="dark" />
				</section>

				{/* ── Footer ── */}
				<footer className="mt-16 text-center text-xs text-[var(--border)]">
					{"[INTERNAL_MANIFESTO_V4] // CAPTHCA.AI // NO_REPLY"}
				</footer>
			</div>
		</TrackLayout>
	);
}

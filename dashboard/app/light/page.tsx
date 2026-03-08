import type { Metadata } from "next";
import Image from "next/image";
import { getLandingSections } from "../../lib/content";
import { CTASection } from "../components/CTASection";
import { DNAHelix } from "../components/DNAHelix";
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
	twitter: {
		card: "summary_large_image",
		title: "CAPTHCA — The Symbiotic Standard",
		images: ["/tracks/light/assets/light-hero.png"],
	},
};

/** Section image map — keyed by section slug */
const SECTION_IMAGES: Record<string, { src: string; alt: string }> = {
	origins: {
		src: "/tracks/light/assets/light-01-origins.png",
		alt: "From Blocking to Bonding — abstract geometric evolution from rigid CAPTCHA forms to flowing organic curves",
	},
	symbiosis: {
		src: "/tracks/light/assets/light-02-symbiosis.png",
		alt: "Mitigating Biological Entropy — two interlocking spiral forms representing human-machine partnership",
	},
	handshake: {
		src: "/tracks/light/assets/light-03-handshake.png",
		alt: "The Symbio-Handshake v4.0 — Visualizing the Zero-Knowledge Exchange of Machine Identity and Signed Intent",
	},
	sovereignty: {
		src: "/tracks/light/assets/light-04-sovereignty.png",
		alt: "Sovereignty as a Service — radiant geometric badge representing digital sovereignty",
	},
};

/**
 * Split rendered HTML after the Nth closing paragraph tag.
 * Used to inject images between paragraphs per content frontmatter image_position.
 */
function splitHtmlAfterParagraph(html: string, n: number): [string, string] {
	let count = 0;
	let searchFrom = 0;
	while (searchFrom < html.length) {
		const idx = html.indexOf("</p>", searchFrom);
		if (idx === -1) break;
		count++;
		if (count === n) {
			const splitIndex = idx + 4; // length of "</p>"
			return [html.slice(0, splitIndex), html.slice(splitIndex)];
		}
		searchFrom = idx + 4;
	}
	return [html, ""];
}

export default async function LightTrack() {
	const sections = await getLandingSections("light");

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
					sizes="100vw"
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
				className="relative z-[1] mx-auto max-w-[850px] px-4 md:px-[60px]"
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
				{sections.map((section) => {
					const { slug } = section.frontmatter;
					const image = SECTION_IMAGES[slug];
					const isHandshake = slug === "handshake";

					return (
						<ScrollReveal key={slug} smooth delay={100}>
							<section className="py-10">
								{/* Lattice texture behind badge area */}
								<div className="relative">
									<div
										className="pointer-events-none absolute inset-0 -top-8 z-0 overflow-hidden"
										style={{
											maskImage:
												"linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 100%)",
											WebkitMaskImage:
												"linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 100%)",
											height: "140px",
										}}
									>
										<Image
											src="/tracks/light/lattice-detail.png"
											alt=""
											fill
											sizes="(max-width: 850px) 100vw, 850px"
											className="object-cover opacity-[0.18]"
										/>
									</div>
									<div className="relative z-[1]">
										{section.frontmatter.badge && (
											<span className="mb-2 inline-block rounded-full bg-[var(--sunrise-gold,#FFD700)] px-3 py-1 text-xs font-bold uppercase text-[var(--deep-navy,#102027)]">
												{section.frontmatter.badge}
											</span>
										)}
										<h2 className="mb-6 font-display text-3xl font-bold text-[var(--deep-navy,#102027)]">
											{section.frontmatter.title}
										</h2>
									</div>
								</div>

								{/* Section illustration — standard position (before body) */}
								{image && !isHandshake && (
									<div className="my-8">
										<Image
											src={image.src}
											alt={image.alt}
											width={850}
											height={480}
											className="w-full rounded-3xl"
											style={{
												border: "1px solid rgba(225, 245, 254, 0.6)",
												boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
											}}
										/>
									</div>
								)}

								{/* Section body content from content system
								    HTML is sanitized through rehype-sanitize in renderMarkdown() */}
								{isHandshake && image ? (
									<>
										{/* Handshake: split content to inject image after paragraph 1 */}
										{(() => {
											const [before, after] = splitHtmlAfterParagraph(section.html, 1);
											return (
												<>
													<div
														className="light-landing-content"
														dangerouslySetInnerHTML={{ __html: before }}
													/>
													<div
														className="relative my-8 overflow-hidden rounded-3xl"
														style={{
															border: "1px solid rgba(225, 245, 254, 0.6)",
															boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
														}}
													>
														<Image
															src={image.src}
															alt={image.alt}
															width={850}
															height={480}
															className="w-full object-cover"
														/>
														<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(16,32,39,0.8)] to-transparent p-6 text-sm text-white">
															<strong>THE SYMBIO-HANDSHAKE v4.0</strong>
															<br />
															Visualizing the Zero-Knowledge Exchange of Machine Identity & Signed
															Intent.
														</div>
													</div>
													<div
														className="light-landing-content"
														dangerouslySetInnerHTML={{ __html: after }}
													/>
												</>
											);
										})()}
									</>
								) : (
									<div
										className="light-landing-content"
										dangerouslySetInnerHTML={{ __html: section.html }}
									/>
								)}
							</section>
						</ScrollReveal>
					);
				})}

				{/* ── Email Capture CTA ── */}
				<CTASection track="light" />

				{/* ── Footer ── */}
				<footer className="border-t border-[var(--border)] py-8 text-center text-xs uppercase tracking-[0.2em] text-[var(--accent)] opacity-60">
					&copy; 2026 CAPTHCA.AI | THE SYMBIOTIC STANDARD
				</footer>
			</div>
		</TrackLayout>
	);
}

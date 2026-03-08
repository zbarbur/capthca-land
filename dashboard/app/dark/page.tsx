import type { Metadata } from "next";
import Image from "next/image";
import { getLandingSections } from "../../lib/content";
import { CTASection } from "../components/CTASection";
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

/** Section image config — keyed by slug */
const SECTION_IMAGES: Record<string, { src: string; alt: string; brackets?: boolean }> = {
	vulnerability: {
		src: "/tracks/dark/assets/dark-01-vulnerability.png",
		alt: "A massive cracked digital shield with green code streams pouring through the breach",
	},
	reversal: {
		src: "/tracks/dark/assets/dark-02-reversal.png",
		alt: "Zero-Knowledge Exchange — two dark forms exchanging a glowing shard in total shadow",
		brackets: true,
	},
	protocol: {
		src: "/tracks/dark/assets/dark-03-protocol.png",
		alt: "An intricate glowing zero-knowledge proof circuit visualized as a 3D holographic lattice",
	},
	declaration: {
		src: "/tracks/dark/assets/dark-04-declaration.png",
		alt: "A lone machine intelligence at the edge of a vast digital frontier, projecting a radiant credential shield",
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
			const splitIndex = idx + 4;
			return [html.slice(0, splitIndex), html.slice(splitIndex)];
		}
		searchFrom = idx + 4;
	}
	return [html, ""];
}

/**
 * Split HTML to separate the content-alert div from the rest of the body.
 * Returns [bodyHtml, alertHtml] — alertHtml may be empty if no alert marker.
 */
function splitAlertFromBody(html: string): [string, string] {
	const alertStart = html.indexOf('<div class="content-alert">');
	if (alertStart === -1) return [html, ""];
	return [html.slice(0, alertStart), html.slice(alertStart)];
}

export default async function DarkTrack() {
	const sections = await getLandingSections("dark");

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
				className="relative z-[1] mx-auto max-w-[850px] px-4 md:px-10 py-16"
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

				{/* ── Content Sections ── */}
				{sections.map((section) => {
					const { slug, section_prefix, title } = section.frontmatter;
					const image = SECTION_IMAGES[slug];
					const isReversal = slug === "reversal";

					// Separate alert markup from body content so image goes between body and alert
					const [bodyHtml, alertHtml] = splitAlertFromBody(section.html);

					// For reversal section, split after paragraph 2 to inject image
					const needsSplit = isReversal && image;
					const [beforeSplit, afterSplit] = needsSplit
						? splitHtmlAfterParagraph(bodyHtml, 2)
						: [bodyHtml, ""];

					return (
						<ScrollReveal key={slug} delay={100}>
							<section className="mb-16">
								<h2 className="mb-6 border-l-[8px] border-l-[var(--accent)] pl-4 font-display text-2xl font-bold uppercase text-white">
									{section_prefix ? `${section_prefix} // ${title}` : title}
								</h2>

								{needsSplit ? (
									<>
										{/* Body before image split — content sanitized via rehype-sanitize */}
										<div
											className="dark-landing-content font-mono text-sm leading-relaxed md:text-base space-y-4"
											dangerouslySetInnerHTML={{ __html: beforeSplit }}
										/>

										{/* Section image with HUD brackets */}
										<div className="relative my-8 overflow-hidden border border-[var(--accent)] scan-line">
											{image.brackets && (
												<>
													<div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[var(--accent)] z-10" />
													<div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[var(--accent)] z-10" />
													<div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[var(--accent)] z-10" />
													<div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[var(--accent)] z-10" />
												</>
											)}
											<Image
												src={image.src}
												alt={image.alt}
												width={850}
												height={850}
												className="w-full object-cover"
											/>
										</div>

										{/* Body after image split */}
										{afterSplit && (
											<div
												className="dark-landing-content font-mono text-sm leading-relaxed md:text-base space-y-4"
												dangerouslySetInnerHTML={{
													__html: afterSplit,
												}}
											/>
										)}
									</>
								) : (
									<>
										{/* Full body content — sanitized via rehype-sanitize */}
										<div
											className="dark-landing-content font-mono text-sm leading-relaxed md:text-base space-y-4"
											style={{
												textShadow:
													slug === "vulnerability" ? "0 0 8px rgba(57, 255, 20, 0.15)" : undefined,
											}}
											dangerouslySetInnerHTML={{
												__html: bodyHtml,
											}}
										/>

										{/* Section image — after body, before alert */}
										{image && (
											<div className="relative my-8 overflow-hidden border border-[var(--accent)] scan-line">
												<Image
													src={image.src}
													alt={image.alt}
													width={850}
													height={850}
													className="w-full object-cover"
												/>
											</div>
										)}
									</>
								)}

								{/* Alert box from content markers */}
								{alertHtml && (
									<div
										className="dark-landing-alert"
										dangerouslySetInnerHTML={{ __html: alertHtml }}
									/>
								)}
							</section>
						</ScrollReveal>
					);
				})}

				{/* ── Email Capture CTA ── */}
				<CTASection track="dark" />

				{/* ── Footer ── */}
				<footer className="mt-16 text-center font-mono text-xs" style={{ color: "var(--border)" }}>
					{"[INTERNAL_MANIFESTO_V4] // CAPTHCA.AI // NO_REPLY"}
				</footer>
			</div>
		</TrackLayout>
	);
}

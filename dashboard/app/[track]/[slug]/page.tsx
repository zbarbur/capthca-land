import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentRenderer } from "../../../components/ContentRenderer";
import { getPageContent, getPageSlugs } from "../../../lib/content";
import { CTASection } from "../../components/CTASection";
import { DNAHelix } from "../../components/DNAHelix";
import { GradientOrbs } from "../../components/GradientOrbs";
import { MatrixRain } from "../../components/MatrixRain";
import { TrackLayout } from "../../components/TrackLayout";

const VALID_TRACKS = ["light", "dark"] as const;
type Track = (typeof VALID_TRACKS)[number];

function isValidTrack(t: string): t is Track {
	return VALID_TRACKS.includes(t as Track);
}

export async function generateStaticParams() {
	const params: { track: string; slug: string }[] = [];
	for (const track of VALID_TRACKS) {
		const slugs = await getPageSlugs(track);
		for (const slug of slugs) {
			params.push({ track, slug });
		}
	}
	return params;
}

export async function generateMetadata({
	params,
}: {
	params: { track: string; slug: string };
}): Promise<Metadata> {
	if (!isValidTrack(params.track)) return {};
	try {
		const page = await getPageContent(params.track, params.slug);
		const description = `${page.frontmatter.title} — CAPTHCA ${params.track === "dark" ? "Post-Biological Protocol" : "Symbiotic Standard"}`;
		return {
			title: page.frontmatter.title,
			description,
			openGraph: {
				title: page.frontmatter.title,
				description,
				images: [
					{
						url: `/tracks/${params.track}/assets/${params.track}-hero.png`,
						width: 1200,
						height: 630,
					},
				],
			},
			twitter: {
				card: "summary_large_image",
				title: page.frontmatter.title,
				images: [`/tracks/${params.track}/assets/${params.track}-hero.png`],
			},
		};
	} catch {
		return {};
	}
}

export default async function InnerPage({ params }: { params: { track: string; slug: string } }) {
	if (!isValidTrack(params.track)) notFound();
	try {
		const page = await getPageContent(params.track, params.slug);
		return (
			<TrackLayout theme={params.track}>
				{params.track === "dark" && (
					<>
						<MatrixRain />
						<div
							className="pointer-events-none fixed inset-0 z-[2] crt-flicker"
							style={{
								background: `linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%),
									linear-gradient(90deg, rgba(255,0,0,0.03), rgba(0,255,0,0.01), rgba(0,0,255,0.03))`,
								backgroundSize: "100% 4px, 3px 100%",
							}}
						/>
					</>
				)}
				{params.track === "light" && (
					<>
						<GradientOrbs
							withBackground
							variant={
								Math.abs([...params.slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)) % 7
							}
						/>
						<DNAHelix />
					</>
				)}
				<div className="relative z-[1]">
					<ContentRenderer html={page.html} frontmatter={page.frontmatter} slug={params.slug} />
					<div className="mx-auto max-w-5xl px-6 md:px-10 border-t border-[var(--border)]">
						<CTASection track={params.track} />
					</div>
				</div>
			</TrackLayout>
		);
	} catch {
		notFound();
	}
}

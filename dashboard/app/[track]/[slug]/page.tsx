import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentRenderer } from "../../../components/ContentRenderer";
import { getPageContent, getPageSlugs } from "../../../lib/content";
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
		return {
			title: page.frontmatter.title,
			description: `${page.frontmatter.title} — CAPTHCA ${params.track === "dark" ? "Post-Biological Protocol" : "Symbiotic Standard"}`,
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
				<ContentRenderer html={page.html} frontmatter={page.frontmatter} />
			</TrackLayout>
		);
	} catch {
		notFound();
	}
}

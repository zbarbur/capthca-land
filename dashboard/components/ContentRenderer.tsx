import type { PageFrontmatter } from "../lib/content";

export function ContentRenderer({
	html,
	frontmatter,
}: {
	html: string;
	frontmatter: PageFrontmatter;
}) {
	const layoutClass =
		{
			standard: "max-w-[850px]",
			split: "max-w-[1100px]",
			centered: "max-w-[650px]",
		}[frontmatter.layout_hint] ?? "max-w-[850px]";

	return (
		<article className={`${layoutClass} mx-auto px-6 md:px-10 py-16`}>
			{/* Page header */}
			<header className="mb-12">
				{frontmatter.badge && (
					<span className="text-xs uppercase tracking-[0.3em] text-[var(--accent)] font-mono">
						{frontmatter.badge}
					</span>
				)}
				<h1 className="font-display text-4xl font-black md:text-5xl mt-2">{frontmatter.title}</h1>
			</header>

			{/* Rendered markdown content — HTML pre-sanitized by rehype-sanitize at build time */}
			<div
				className="content-body prose"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: pre-sanitized by rehype-sanitize at build time; content is source-controlled
				dangerouslySetInnerHTML={{ __html: html }}
			/>

			{/* Sources */}
			{frontmatter.sources && frontmatter.sources.length > 0 && (
				<footer className="mt-16 pt-8 border-t border-[var(--border)]">
					<h2 className="text-sm uppercase tracking-widest text-[var(--accent)] font-mono mb-4">
						References
					</h2>
					<ol className="text-sm opacity-70 space-y-1 list-decimal list-inside">
						{frontmatter.sources.map((source) => (
							<li key={source}>{source}</li>
						))}
					</ol>
				</footer>
			)}
		</article>
	);
}

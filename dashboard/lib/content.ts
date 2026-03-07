import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

// When running from dashboard/ (Next.js), go up one level to find content/.
// When running from project root (tests), content/ is a direct child.
const CONTENT_ROOT = path.join(
	process.cwd().endsWith("dashboard") ? path.resolve(process.cwd(), "..") : process.cwd(),
	"content",
);

export interface PageFrontmatter {
	track: string;
	slug: string;
	title: string;
	badge?: string;
	layout_hint: string;
	design_notes?: string;
	sources?: string[];
	section_prefix?: string;
}

export interface PageContent {
	frontmatter: PageFrontmatter;
	html: string;
}

/**
 * Replace content markers like {highlight}...{/highlight} with HTML elements.
 */
export function transformContentMarkers(markdown: string): string {
	let result = markdown;
	result = result.replace(
		/\{highlight\}([\s\S]*?)\{\/highlight\}/g,
		'<div class="content-highlight">$1</div>',
	);
	result = result.replace(/\{alert\}([\s\S]*?)\{\/alert\}/g, '<div class="content-alert">$1</div>');
	result = result.replace(/\{table\}([\s\S]*?)\{\/table\}/g, '<div class="content-table">$1</div>');
	result = result.replace(
		/\{quote\}([\s\S]*?)\{\/quote\}/g,
		'<blockquote class="content-quote">$1</blockquote>',
	);
	return result;
}

const sanitizeSchema = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		div: [
			...(defaultSchema.attributes?.div ?? []),
			["className", "content-highlight", "content-alert", "content-table"],
		],
		blockquote: [...(defaultSchema.attributes?.blockquote ?? []), ["className", "content-quote"]],
	},
};

/**
 * Render markdown string to HTML using the unified pipeline.
 */
export async function renderMarkdown(content: string): Promise<string> {
	const transformed = transformContentMarkers(content);
	const result = await unified()
		.use(remarkParse)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeRaw)
		.use(rehypeSanitize, sanitizeSchema as Parameters<typeof rehypeSanitize>[0])
		.use(rehypeStringify)
		.process(transformed);
	return String(result);
}

/**
 * Get all page slugs for a given track.
 */
export async function getPageSlugs(track: string): Promise<string[]> {
	const dir = path.join(CONTENT_ROOT, track, "pages");
	const files = await fs.readdir(dir);
	return files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
}

/**
 * Load and parse a single page's content by track and slug.
 */
export async function getPageContent(track: string, slug: string): Promise<PageContent> {
	const filePath = path.join(CONTENT_ROOT, track, "pages", `${slug}.md`);
	let raw: string;
	try {
		raw = await fs.readFile(filePath, "utf-8");
	} catch {
		throw new Error(`Page not found: ${track}/${slug}`);
	}
	const { data, content } = matter(raw);
	const html = await renderMarkdown(content);
	return {
		frontmatter: data as PageFrontmatter,
		html,
	};
}

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
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
 * Post-process rendered HTML to wrap content between marker tags with styled divs.
 * Markers survive markdown parsing as literal text. They may appear:
 * - As separate <p> tags: <p>{highlight}</p>...<p>{/highlight}</p>
 * - Inline in a single <p>: <p>{highlight}\ntext\n{/highlight}</p>
 */
export function transformContentMarkers(html: string): string {
	const markers = [
		{ tag: "highlight", el: "div", cls: "content-highlight" },
		{ tag: "alert", el: "div", cls: "content-alert" },
		{ tag: "table", el: "div", cls: "content-table" },
		{ tag: "quote", el: "blockquote", cls: "content-quote" },
	];

	let result = html;
	for (const { tag, el, cls } of markers) {
		// Case 1: separate <p> tags for open and close markers
		result = result.replace(
			new RegExp(`<p>\\{${tag}\\}</p>([\\s\\S]*?)<p>\\{/${tag}\\}</p>`, "g"),
			`<${el} class="${cls}">$1</${el}>`,
		);
		// Case 2: inline within a single <p> (content on same line as marker)
		result = result.replace(
			new RegExp(`<p>\\{${tag}\\}\\n?([\\s\\S]*?)\\n?\\{/${tag}\\}</p>`, "g"),
			`<${el} class="${cls}"><p>$1</p></${el}>`,
		);
	}
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
	tagNames: [...(defaultSchema.tagNames ?? []), "thead", "tbody", "th", "td", "tr", "table"],
};

/**
 * Render markdown string to HTML using the unified pipeline.
 * Content markers ({highlight}, {table}, etc.) are processed AFTER markdown
 * rendering so they don't interfere with table/bold/etc. parsing.
 */
export async function renderMarkdown(content: string): Promise<string> {
	const result = await unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeRaw)
		.use(rehypeSanitize, sanitizeSchema as Parameters<typeof rehypeSanitize>[0])
		.use(rehypeStringify)
		.process(content);
	return transformContentMarkers(String(result));
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

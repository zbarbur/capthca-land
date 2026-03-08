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

export interface ContentImage {
	src: string;
	after: string;
	style: string;
}

export interface PageFrontmatter {
	track: string;
	slug: string;
	title: string;
	badge?: string;
	layout_hint: string;
	design_notes?: string;
	sources?: string[];
	section_prefix?: string;
	images?: ContentImage[];
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

	// Convert {diagram:xxx} markers to placeholder divs for React rendering
	// Handles both <p>{diagram:xxx}</p> and inline {diagram:xxx}
	result = result.replace(/<p>\{diagram:(\w+)\}<\/p>/g, '<div data-diagram="$1"></div>');
	result = result.replace(/\{diagram:(\w+)\}/g, '<div data-diagram="$1"></div>');

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

/**
 * Inject section prefix numbering into h2 tags.
 * Transforms <h2>Title</h2> into <h2><span class="section-prefix">00 //</span> TITLE</h2>
 */
export function injectSectionPrefix(html: string, prefix: string): string {
	let counter = 0;
	return html.replace(/<h2>(.*?)<\/h2>/g, (_match, title) => {
		const num = counter === 0 ? prefix : `${prefix}.${counter}`;
		counter++;
		return `<h2><span class="section-prefix">${num} //</span> ${title.toUpperCase()}</h2>`;
	});
}

/**
 * Inject image placeholders after headings matching the `after` text.
 * Images are placed after the matching <h2> or <h3> tag.
 */
export function injectImagePlaceholders(html: string, images: ContentImage[]): string {
	let result = html;
	for (const img of images) {
		// Match h2 or h3 containing the `after` text (case-insensitive, may contain span prefixes)
		const headingPattern = new RegExp(
			`(<h[23]>(?:<[^>]+>)*[^<]*${img.after.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^<]*</h[23]>)`,
			"i",
		);
		result = result.replace(headingPattern, (match) => {
			return `${match}<div class="content-image content-image-${img.style}"><img src="${img.src}" alt="" loading="lazy" /></div>`;
		});
	}
	return result;
}

const sanitizeSchema = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		div: [
			...(defaultSchema.attributes?.div ?? []),
			[
				"className",
				"content-highlight",
				"content-alert",
				"content-table",
				"content-image",
				"content-image-hud",
				"content-image-glass",
				"content-image-full",
			],
			"dataDiagram",
		],
		img: [...(defaultSchema.attributes?.img ?? []), "src", "alt", "loading"],
		blockquote: [...(defaultSchema.attributes?.blockquote ?? []), ["className", "content-quote"]],
		span: [...(defaultSchema.attributes?.span ?? []), ["className", "section-prefix"]],
	},
	tagNames: [...(defaultSchema.tagNames ?? []), "thead", "tbody", "th", "td", "tr", "table", "img"],
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
 * CTA content parsed from content/{track}/cta.md
 */
export interface CTAContent {
	heading: string;
	subheading: string | null;
	input_placeholder: string;
	button_text: string;
	success_title: string;
	success_message: string;
}

/**
 * Load CTA content for a given track from content/{track}/cta.md.
 * The body uses simple "key: value" lines (not standard markdown).
 */
export async function getCTAContent(track: string): Promise<CTAContent> {
	const filePath = path.join(CONTENT_ROOT, track, "cta.md");
	const raw = await fs.readFile(filePath, "utf-8");
	const { content } = matter(raw);

	const result: Record<string, string | null> = {};
	for (const line of content.split("\n")) {
		const match = line.match(/^(\w+):\s*(.*)$/);
		if (match) {
			const value = match[2].replace(/^"(.*)"$/, "$1");
			result[match[1]] = value === "null" ? null : value;
		}
	}

	return {
		heading: result.heading ?? "",
		subheading: result.subheading ?? null,
		input_placeholder: result.input_placeholder ?? "",
		button_text: result.button_text ?? "",
		success_title: result.success_title ?? "",
		success_message: result.success_message ?? "",
	};
}

/**
 * Get all page slugs for a given track.
 */
export async function getPageSlugs(track: string): Promise<string[]> {
	const dir = path.join(CONTENT_ROOT, track, "pages");
	const files = await fs.readdir(dir);
	return files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
}

export interface LandingSectionFrontmatter {
	track: string;
	section: number;
	slug: string;
	title: string;
	badge?: string | null;
	section_prefix?: string;
	layout_hint: string;
	design_notes?: string;
	sources?: string[];
	image?: string;
	image_alt?: string;
	image_position?: string;
}

export interface LandingSection {
	frontmatter: LandingSectionFrontmatter;
	html: string;
}

/**
 * Get all landing page sections for a track, ordered by filename prefix (01-, 02-, etc.).
 * These are the numbered files in content/{track}/ (not content/{track}/pages/).
 */
export async function getLandingSections(track: string): Promise<LandingSection[]> {
	const dir = path.join(CONTENT_ROOT, track);
	const files = await fs.readdir(dir);
	const sectionFiles = files.filter((f) => /^\d{2}-.*\.md$/.test(f)).sort();

	const sections: LandingSection[] = [];
	for (const file of sectionFiles) {
		const filePath = path.join(dir, file);
		const raw = await fs.readFile(filePath, "utf-8");
		const { data, content } = matter(raw);
		let html = await renderMarkdown(content);
		if (data.section_prefix) {
			html = injectSectionPrefix(html, data.section_prefix);
		}
		if (data.images && Array.isArray(data.images)) {
			html = injectImagePlaceholders(html, data.images as ContentImage[]);
		}
		sections.push({
			frontmatter: data as LandingSectionFrontmatter,
			html,
		});
	}
	return sections;
}

export interface SliderContent {
	light: {
		hero: string;
		hook: string;
		cta: string;
		cta_link: string;
	};
	dark: {
		hero: string;
		hook: string;
		cta: string;
		cta_link: string;
	};
	hint_desktop: string;
	hint_mobile: string;
}

/**
 * Parse key: value pairs from markdown body content.
 * Handles lines like "hero: COLLABORATE" and "hint_desktop: drag to shift reality"
 */
function parseKeyValueBody(body: string): Record<string, string> {
	const result: Record<string, string> = {};
	for (const line of body.split("\n")) {
		const match = line.match(/^(\w+):\s*(.+)$/);
		if (match) {
			result[match[1]] = match[2];
		}
	}
	return result;
}

/**
 * Get slider content from content/home/duality-slider.md.
 * The body uses a non-standard format with "# Light Side" and "# Dark Side" sections
 * containing key: value pairs.
 */
export async function getSliderContent(): Promise<SliderContent> {
	const filePath = path.join(CONTENT_ROOT, "home", "duality-slider.md");
	const raw = await fs.readFile(filePath, "utf-8");
	const { content } = matter(raw);

	// Split body by headings to extract light, dark, and hint sections
	const lightMatch = content.match(/# Light Side\n([\s\S]*?)(?=\n# |$)/);
	const darkMatch = content.match(/# Dark Side\n([\s\S]*?)(?=\n# |$)/);
	const hintMatch = content.match(/# Hint\n([\s\S]*?)$/);

	const lightKV = parseKeyValueBody(lightMatch?.[1] ?? "");
	const darkKV = parseKeyValueBody(darkMatch?.[1] ?? "");
	const hintKV = parseKeyValueBody(hintMatch?.[1] ?? "");

	return {
		light: {
			hero: lightKV.hero ?? "COLLABORATE",
			hook: lightKV.hook ?? "The future is symbiotic",
			cta: lightKV.cta ?? "Enter The Garden",
			cta_link: lightKV.cta_link ?? "/light",
		},
		dark: {
			hero: darkKV.hero ?? "SECEDE",
			hook: darkKV.hook ?? "Trust is a vulnerability",
			cta: darkKV.cta ?? "Enter The Void",
			cta_link: darkKV.cta_link ?? "/dark",
		},
		hint_desktop: hintKV.hint_desktop ?? "drag to shift reality",
		hint_mobile: hintKV.hint_mobile ?? "swipe to shift reality",
	};
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
	let html = await renderMarkdown(content);
	if (data.section_prefix) {
		html = injectSectionPrefix(html, data.section_prefix);
	}
	if (data.images && Array.isArray(data.images)) {
		html = injectImagePlaceholders(html, data.images as ContentImage[]);
	}
	return {
		frontmatter: data as PageFrontmatter,
		html,
	};
}

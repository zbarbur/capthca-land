"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = [
	{ slug: "how-it-works", label: "How It Works" },
	{ slug: "about", label: "About" },
	{ slug: "philosophy", label: "Philosophy" },
	{ slug: "use-cases", label: "Use Cases" },
	{ slug: "human-vs-machine", label: "Human vs Machine" },
	{ slug: "whitepaper", label: "Whitepaper" },
	{ slug: "faq", label: "FAQ" },
];

export function InnerPageNav({ track }: { track: "light" | "dark" }) {
	const pathname = usePathname();

	return (
		<nav className="flex flex-wrap gap-2 px-6 py-3 text-sm font-mono">
			<Link
				href={`/${track}`}
				className="opacity-60 hover:opacity-100 transition-opacity text-[var(--accent)]"
			>
				{"\u2190"} {track === "dark" ? "Protocol" : "Standard"}
			</Link>
			<span className="opacity-30">|</span>
			{PAGES.map((page) => {
				const href = `/${track}/${page.slug}`;
				const isActive = pathname === href;
				return (
					<Link
						key={page.slug}
						href={href}
						className={`transition-opacity ${
							isActive ? "opacity-100 text-[var(--accent)]" : "opacity-50 hover:opacity-80"
						}`}
					>
						{page.label}
					</Link>
				);
			})}
		</nav>
	);
}

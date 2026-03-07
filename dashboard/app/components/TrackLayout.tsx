"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const PAGES = [
	{ slug: "about", label: "About" },
	{ slug: "how-it-works", label: "How It Works" },
	{ slug: "philosophy", label: "Philosophy" },
	{ slug: "use-cases", label: "Use Cases" },
	{ slug: "human-vs-machine", label: "Human vs Machine" },
	{ slug: "whitepaper", label: "Whitepaper" },
	{ slug: "faq", label: "FAQ" },
];

export function TrackLayout({
	theme,
	children,
}: {
	theme: "light" | "dark";
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const isLanding = pathname === `/${theme}`;

	useEffect(() => {
		document.body.className = `theme-${theme}`;
		return () => {
			document.body.className = "";
		};
	}, [theme]);

	return (
		<div className="min-h-screen">
			<nav
				className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm"
				style={{
					background: theme === "dark" ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)",
					borderColor: theme === "dark" ? "rgba(57,255,20,0.15)" : "rgba(180,140,50,0.15)",
				}}
			>
				<div className="flex items-center px-6 py-3 text-xs font-mono tracking-wide">
					<Link
						href={isLanding ? "/" : `/${theme}`}
						className="shrink-0 transition-opacity hover:opacity-100 text-[var(--accent)] opacity-70"
					>
						← {isLanding ? "Choice" : theme === "dark" ? "Protocol" : "Standard"}
					</Link>
					<span className="mx-3 opacity-20" style={{ color: "var(--accent)" }}>
						{"│"}
					</span>
					<div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
						{PAGES.map((page, i) => {
							const href = `/${theme}/${page.slug}`;
							const isActive = pathname === href;
							return (
								<span key={page.slug} className="flex items-center">
									{i > 0 && <span className="mx-1 opacity-20">·</span>}
									<Link
										href={href}
										className={`whitespace-nowrap px-1.5 py-0.5 rounded transition-all ${
											isActive
												? "opacity-100 text-[var(--accent)] bg-[var(--accent)]/10"
												: "opacity-50 hover:opacity-80"
										}`}
									>
										{page.label}
									</Link>
								</span>
							);
						})}
					</div>
				</div>
			</nav>
			<main>{children}</main>
		</div>
	);
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AmbientAudio } from "./AmbientAudio";

const PAGES = [
	{ slug: "about", label: "About" },
	{ slug: "how-it-works", label: "How It Works" },
	{ slug: "philosophy", label: "Philosophy" },
	{ slug: "use-cases", label: "Use Cases" },
	{ slug: "human-vs-machine", label: "Human vs Machine" },
	{ slug: "whitepaper", label: "Whitepaper" },
	{ slug: "academic-paper", label: "Paper" },
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
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	useEffect(() => {
		document.body.className = `theme-${theme}`;
		return () => {
			document.body.className = "";
		};
	}, [theme]);

	// Close mobile menu on route change
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally re-run when pathname changes to close menu on navigation
	useEffect(() => {
		setMobileMenuOpen(false);
	}, [pathname]);

	return (
		<div className="min-h-screen">
			<nav
				className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm"
				style={{
					background: theme === "dark" ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)",
					borderColor: theme === "dark" ? "rgba(57,255,20,0.15)" : "rgba(180,140,50,0.15)",
				}}
			>
				<div className="flex items-center px-4 md:px-6 py-3 text-xs font-mono tracking-wide">
					<Link
						href={isLanding ? "/" : `/${theme}`}
						className="shrink-0 transition-opacity hover:opacity-100 text-[var(--accent)] opacity-70 min-h-[44px] flex items-center"
					>
						← {isLanding ? "Choice" : theme === "dark" ? "Protocol" : "Standard"}
					</Link>
					<span className="mx-3 opacity-20 hidden md:inline" style={{ color: "var(--accent)" }}>
						{"│"}
					</span>
					{/* Desktop nav links */}
					<div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none">
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
					{/* Mobile menu toggle */}
					<button
						type="button"
						className="ml-auto md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--accent)]"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
						aria-expanded={mobileMenuOpen}
					>
						<span className="text-lg">{mobileMenuOpen ? "\u2715" : "\u2630"}</span>
					</button>
				</div>
				{/* Mobile dropdown menu */}
				{mobileMenuOpen && (
					<div
						className="md:hidden border-t px-4 py-2"
						style={{
							background: theme === "dark" ? "rgba(0,0,0,0.95)" : "rgba(255,255,255,0.95)",
							borderColor: theme === "dark" ? "rgba(57,255,20,0.15)" : "rgba(180,140,50,0.15)",
						}}
					>
						<div className="flex flex-col gap-0.5">
							{PAGES.map((page) => {
								const href = `/${theme}/${page.slug}`;
								const isActive = pathname === href;
								return (
									<Link
										key={page.slug}
										href={href}
										className={`block px-3 py-3 rounded text-sm font-mono min-h-[44px] flex items-center transition-all ${
											isActive
												? "opacity-100 text-[var(--accent)] bg-[var(--accent)]/10"
												: "opacity-60 hover:opacity-90"
										}`}
									>
										{page.label}
									</Link>
								);
							})}
						</div>
					</div>
				)}
			</nav>
			<main>{children}</main>
			<AmbientAudio theme={theme} />
		</div>
	);
}

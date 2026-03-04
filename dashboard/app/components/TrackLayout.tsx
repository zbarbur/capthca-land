"use client";

import Link from "next/link";
import { useEffect } from "react";

export function TrackLayout({
	theme,
	children,
}: {
	theme: "light" | "dark";
	children: React.ReactNode;
}) {
	useEffect(() => {
		document.body.className = `theme-${theme}`;
		return () => {
			document.body.className = "";
		};
	}, [theme]);

	return (
		<div className="min-h-screen">
			<nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
				<Link
					href="/"
					className={`text-sm uppercase tracking-widest font-mono transition-opacity hover:opacity-100 ${
						theme === "light"
							? "text-[var(--accent)] opacity-60"
							: "text-[var(--accent)] opacity-60"
					}`}
				>
					← Back to Choice
				</Link>
			</nav>
			<main>{children}</main>
		</div>
	);
}

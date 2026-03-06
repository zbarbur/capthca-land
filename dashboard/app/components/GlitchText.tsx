"use client";

import type { ReactNode } from "react";

interface GlitchTextProps {
	children: ReactNode;
	className?: string;
	as?: "h1" | "h2" | "h3" | "span";
}

/**
 * Chromatic-aberration glitch effect using CSS pseudo-elements.
 * Two clipped copies shift horizontally with step() timing.
 */
export function GlitchText({ children, className = "", as: Tag = "h2" }: GlitchTextProps) {
	return (
		<Tag
			className={`glitch-text ${className}`}
			data-text={typeof children === "string" ? children : undefined}
		>
			{children}
		</Tag>
	);
}

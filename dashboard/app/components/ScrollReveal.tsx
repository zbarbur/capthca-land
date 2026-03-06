"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
	children: React.ReactNode;
	className?: string;
	delay?: number;
	smooth?: boolean;
}

/**
 * Fade-in + translateY on viewport entry with step() timing.
 * Uses IntersectionObserver — no JS animation loops.
 */
export function ScrollReveal({
	children,
	className = "",
	delay = 0,
	smooth = false,
}: ScrollRevealProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.unobserve(el);
				}
			},
			{ threshold: 0.15 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={`${smooth ? "scroll-reveal-smooth" : "scroll-reveal"} ${visible ? "scroll-reveal--visible" : ""} ${className}`}
			style={{ transitionDelay: `${delay}ms` }}
		>
			{children}
		</div>
	);
}

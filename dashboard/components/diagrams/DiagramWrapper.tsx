"use client";

import { useEffect, useRef, useState } from "react";

interface DiagramWrapperProps {
	children: React.ReactNode;
	animate?: boolean;
	className?: string;
}

export function DiagramWrapper({ children, animate = true, className = "" }: DiagramWrapperProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(!animate);

	useEffect(() => {
		if (!animate) return;

		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.unobserve(el);
				}
			},
			{ threshold: 0.15 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [animate]);

	return (
		<div
			ref={ref}
			className={`diagram-wrapper p-4 md:p-6 overflow-x-auto max-w-full ${className}`.trim()}
			style={{
				opacity: isVisible ? 1 : 0,
				transform: isVisible ? "translateY(0)" : "translateY(16px)",
				transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
			}}
		>
			{children}
		</div>
	);
}

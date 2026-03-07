"use client";

import { useEffect, useRef } from "react";

export function AccordionContent({ html, className }: { html: string; className: string }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) return;
		const container = ref.current;
		const headings = container.querySelectorAll("h2");

		for (const h2 of headings) {
			// Collect siblings until next h2
			const panel = document.createElement("div");
			panel.className = "accordion-panel";
			let sibling = h2.nextElementSibling;
			const siblings: Element[] = [];
			while (sibling && sibling.tagName !== "H2") {
				siblings.push(sibling);
				sibling = sibling.nextElementSibling;
			}
			// Wrap in panel
			if (siblings.length > 0) {
				h2.parentNode?.insertBefore(panel, siblings[0]);
				for (const s of siblings) {
					panel.appendChild(s);
				}
			}

			// Make h2 a toggle
			h2.classList.add("accordion-trigger");
			h2.style.cursor = "pointer";
			h2.addEventListener("click", () => {
				h2.classList.toggle("open");
				panel.classList.toggle("open");
			});
		}
	}, []);

	return (
		<div
			ref={ref}
			className={className}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: pre-sanitized by rehype-sanitize at build time; content is source-controlled
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}

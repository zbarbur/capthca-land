"use client";

import { useEffect, useRef } from "react";

/**
 * DNA Helix side animations for the light track.
 * Canvas-based double helixes filling both border areas (viewport edge
 * to content container). Equivalent to MatrixRain on the dark track.
 * Hidden on mobile (<768px).
 */

const COLORS = {
	gold: { r: 255, g: 215, b: 0 },
	blue: { r: 2, g: 136, b: 209 },
};

interface HelixConfig {
	side: "left" | "right";
}

function HelixCanvas({ side }: HelixConfig) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animRef = useRef<number>(0);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		let width = 0;
		let height = 0;
		let scrollY = 0;
		let time = 0;

		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			const rect = canvas.getBoundingClientRect();
			width = rect.width;
			height = rect.height;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const onScroll = () => {
			scrollY = window.scrollY;
		};

		resize();
		window.addEventListener("resize", resize);
		window.addEventListener("scroll", onScroll, { passive: true });

		const WAVELENGTH = 200;
		const NODE_SIZE = 4;
		const FPS = 30;
		const FRAME_MS = 1000 / FPS;
		let lastFrame = 0;

		const draw = (timestamp: number) => {
			animRef.current = requestAnimationFrame(draw);

			if (timestamp - lastFrame < FRAME_MS) return;
			lastFrame = timestamp;

			if (!prefersReduced) {
				time += 0.003;
			}

			ctx.clearRect(0, 0, width, height);

			// Parallax offset — helixes drift slower than scroll
			const parallax = scrollY * 0.15;

			// Draw multiple helix pairs to fill height
			const totalHeight = height + WAVELENGTH * 2;
			const amplitude = width * 0.35;
			const centerX = width / 2;

			// Two strands per helix: gold (phase 0) and blue (phase PI)
			const strands = [
				{ color: COLORS.gold, phase: 0, alpha: 0.18 },
				{ color: COLORS.blue, phase: Math.PI, alpha: 0.14 },
			];

			for (const strand of strands) {
				ctx.beginPath();
				ctx.strokeStyle = `rgba(${strand.color.r}, ${strand.color.g}, ${strand.color.b}, ${strand.alpha})`;
				ctx.lineWidth = 1.8;

				for (let y = -WAVELENGTH; y <= totalHeight; y += 2) {
					const adjustedY = y + parallax + time * 300;
					const x =
						centerX + amplitude * Math.sin((2 * Math.PI * adjustedY) / WAVELENGTH + strand.phase);
					if (y === -WAVELENGTH) {
						ctx.moveTo(x, y);
					} else {
						ctx.lineTo(x, y);
					}
				}
				ctx.stroke();

				// Glow pass
				ctx.beginPath();
				ctx.strokeStyle = `rgba(${strand.color.r}, ${strand.color.g}, ${strand.color.b}, ${strand.alpha * 0.3})`;
				ctx.lineWidth = 6;
				for (let y = -WAVELENGTH; y <= totalHeight; y += 4) {
					const adjustedY = y + parallax + time * 300;
					const x =
						centerX + amplitude * Math.sin((2 * Math.PI * adjustedY) / WAVELENGTH + strand.phase);
					if (y === -WAVELENGTH) {
						ctx.moveTo(x, y);
					} else {
						ctx.lineTo(x, y);
					}
				}
				ctx.stroke();
			}

			// Crossover nodes — where the two strands meet
			for (let y = -WAVELENGTH; y <= totalHeight; y += WAVELENGTH / 2) {
				const adjustedY = y + parallax + time * 300;
				const x = centerX + amplitude * Math.sin((2 * Math.PI * adjustedY) / WAVELENGTH);

				// Pulse opacity
				const pulse = prefersReduced ? 0.2 : 0.12 + 0.1 * Math.sin(time * 8 + y * 0.01);

				const isGold = Math.round(y / (WAVELENGTH / 2)) % 2 === 0;
				const c = isGold ? COLORS.gold : COLORS.blue;

				ctx.beginPath();
				ctx.arc(x, y, NODE_SIZE, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${pulse})`;
				ctx.fill();

				// Node glow
				ctx.beginPath();
				ctx.arc(x, y, NODE_SIZE * 2.5, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${pulse * 0.3})`;
				ctx.fill();
			}
		};

		animRef.current = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(animRef.current);
			window.removeEventListener("resize", resize);
			window.removeEventListener("scroll", onScroll);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="pointer-events-none fixed top-0 bottom-0 hidden md:block"
			style={{
				[side]: 0,
				width: "calc((100vw - 850px) / 2)",
				minWidth: "60px",
				height: "100vh",
				zIndex: 0,
			}}
			aria-hidden="true"
			tabIndex={-1}
		/>
	);
}

export function DNAHelix() {
	return (
		<>
			<HelixCanvas side="left" />
			<HelixCanvas side="right" />
		</>
	);
}

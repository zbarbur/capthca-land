"use client";

import { useEffect, useRef } from "react";

/**
 * DNA Helix border animation for the light track.
 * Many small double-helix units float upward across the border areas,
 * like Matrix rain columns but with organic DNA twists.
 */

const COLORS = {
	gold: { r: 255, g: 215, b: 0 },
	blue: { r: 2, g: 136, b: 209 },
};

interface HelixUnit {
	x: number; // horizontal position (0-1)
	y: number; // current vertical position
	speed: number; // px per frame upward
	scale: number; // size multiplier
	alpha: number; // base opacity
	wavelength: number;
	amplitude: number;
	twists: number; // how many full twists (1-3)
}

function spawnUnit(_width: number, height: number): HelixUnit {
	return {
		x: Math.random(),
		y: height + Math.random() * 200,
		speed: 0.3 + Math.random() * 0.8,
		scale: 0.5 + Math.random() * 0.7,
		alpha: 0.08 + Math.random() * 0.14,
		wavelength: 30 + Math.random() * 20,
		amplitude: 6 + Math.random() * 8,
		twists: 1 + Math.floor(Math.random() * 2.5),
	};
}

function drawUnit(ctx: CanvasRenderingContext2D, unit: HelixUnit, width: number) {
	const cx = unit.x * width;
	const unitHeight = unit.wavelength * unit.twists * unit.scale;
	const amp = unit.amplitude * unit.scale;

	// Two strands: gold and blue, offset by PI
	const strands = [
		{ color: COLORS.gold, phase: 0 },
		{ color: COLORS.blue, phase: Math.PI },
	];

	for (const strand of strands) {
		// Main line
		ctx.beginPath();
		ctx.strokeStyle = `rgba(${strand.color.r}, ${strand.color.g}, ${strand.color.b}, ${unit.alpha})`;
		ctx.lineWidth = 1.2 * unit.scale;

		for (let i = 0; i <= unitHeight; i += 1.5) {
			const x =
				cx + amp * Math.sin((2 * Math.PI * i) / (unit.wavelength * unit.scale) + strand.phase);
			const y = unit.y - i;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.stroke();

		// Glow
		ctx.beginPath();
		ctx.strokeStyle = `rgba(${strand.color.r}, ${strand.color.g}, ${strand.color.b}, ${unit.alpha * 0.25})`;
		ctx.lineWidth = 4 * unit.scale;
		for (let i = 0; i <= unitHeight; i += 3) {
			const x =
				cx + amp * Math.sin((2 * Math.PI * i) / (unit.wavelength * unit.scale) + strand.phase);
			const y = unit.y - i;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.stroke();
	}

	// Nodes at crossover points
	const nodeInterval = (unit.wavelength * unit.scale) / 2;
	for (let i = nodeInterval; i < unitHeight; i += nodeInterval) {
		const x = cx + amp * Math.sin((2 * Math.PI * i) / (unit.wavelength * unit.scale));
		const y = unit.y - i;
		const isGold = Math.round(i / nodeInterval) % 2 === 0;
		const c = isGold ? COLORS.gold : COLORS.blue;
		const r = 2.5 * unit.scale;

		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${unit.alpha * 1.2})`;
		ctx.fill();
	}
}

function HelixCanvas({ side }: { side: "left" | "right" }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animRef = useRef<number>(0);
	const unitsRef = useRef<HelixUnit[]>([]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		let width = 0;
		let height = 0;

		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			const rect = canvas.getBoundingClientRect();
			width = rect.width;
			height = rect.height;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		resize();
		window.addEventListener("resize", resize);

		// Spawn initial units spread across the viewport
		const UNIT_COUNT = 25;
		const units: HelixUnit[] = [];
		for (let i = 0; i < UNIT_COUNT; i++) {
			const u = spawnUnit(width || 100, height || 800);
			u.y = Math.random() * (height + 200); // spread across viewport initially
			units.push(u);
		}
		unitsRef.current = units;

		const FPS = 30;
		const FRAME_MS = 1000 / FPS;
		let lastFrame = 0;

		const draw = (timestamp: number) => {
			animRef.current = requestAnimationFrame(draw);
			if (timestamp - lastFrame < FRAME_MS) return;
			lastFrame = timestamp;

			ctx.clearRect(0, 0, width, height);

			for (const unit of units) {
				drawUnit(ctx, unit, width);

				if (!prefersReduced) {
					unit.y -= unit.speed;
				}

				// Respawn when fully off top
				const unitHeight = unit.wavelength * unit.twists * unit.scale;
				if (unit.y + unitHeight < 0) {
					Object.assign(unit, spawnUnit(width, height));
				}
			}
		};

		animRef.current = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(animRef.current);
			window.removeEventListener("resize", resize);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="pointer-events-none fixed top-0 bottom-0 hidden md:block"
			style={{
				[side]: 0,
				width: "calc((100vw - 1152px) / 2)",
				minWidth: "60px",
				maxWidth: "200px",
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

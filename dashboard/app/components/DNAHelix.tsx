"use client";

/**
 * DNA Helix side animations for the light track.
 * Two double-helix strands flank the content area — gold + blue sinusoidal
 * waves with crossover nodes. Equivalent to Matrix rain on the dark track.
 *
 * Hidden on mobile (<768px) — not enough visible space.
 */

const WAVELENGTH = 120;
const AMPLITUDE = 18;
const NODE_RADIUS = 3;
const STRAND_HEIGHT = 2000;

function buildHelixPath(
	phase: number,
	height: number,
	amplitude: number,
	wavelength: number,
): string {
	const points: string[] = [];
	const steps = Math.ceil(height / 2);
	for (let i = 0; i <= steps; i++) {
		const y = (i / steps) * height;
		const x = amplitude * Math.sin((2 * Math.PI * y) / wavelength + phase);
		points.push(i === 0 ? `M ${x + amplitude},${y}` : `L ${x + amplitude},${y}`);
	}
	return points.join(" ");
}

function getCrossoverNodes(height: number, wavelength: number): { x: number; y: number }[] {
	const nodes: { x: number; y: number }[] = [];
	const interval = wavelength / 2;
	for (let y = interval; y < height; y += interval) {
		nodes.push({ x: AMPLITUDE, y });
	}
	return nodes;
}

function HelixStrand({ side }: { side: "left" | "right" }) {
	const mirror = side === "right";
	const nodes = getCrossoverNodes(STRAND_HEIGHT, WAVELENGTH);

	return (
		<div
			className="helix-drift pointer-events-none absolute top-0 bottom-0 hidden md:block"
			style={{
				[side]: "40px",
				width: `${AMPLITUDE * 2 + 8}px`,
				zIndex: 0,
				overflow: "hidden",
			}}
		>
			<svg
				width={AMPLITUDE * 2 + 8}
				height={STRAND_HEIGHT}
				viewBox={`0 0 ${AMPLITUDE * 2 + 8} ${STRAND_HEIGHT}`}
				style={{
					transform: mirror ? "scaleX(-1)" : undefined,
				}}
				aria-hidden="true"
				tabIndex={-1}
			>
				{/* Glow layer — gold strand */}
				<path
					d={buildHelixPath(0, STRAND_HEIGHT, AMPLITUDE, WAVELENGTH)}
					fill="none"
					stroke="rgba(255, 215, 0, 0.08)"
					strokeWidth={4}
					filter="url(#helix-blur)"
				/>
				{/* Gold strand */}
				<path
					d={buildHelixPath(0, STRAND_HEIGHT, AMPLITUDE, WAVELENGTH)}
					fill="none"
					stroke="rgba(255, 215, 0, 0.12)"
					strokeWidth={1.5}
				/>
				{/* Glow layer — blue strand */}
				<path
					d={buildHelixPath(Math.PI, STRAND_HEIGHT, AMPLITUDE, WAVELENGTH)}
					fill="none"
					stroke="rgba(2, 136, 209, 0.06)"
					strokeWidth={4}
					filter="url(#helix-blur)"
				/>
				{/* Blue strand (offset by half wavelength) */}
				<path
					d={buildHelixPath(Math.PI, STRAND_HEIGHT, AMPLITUDE, WAVELENGTH)}
					fill="none"
					stroke="rgba(2, 136, 209, 0.10)"
					strokeWidth={1.5}
				/>
				{/* Crossover nodes */}
				{nodes.map((node, i) => (
					<circle
						key={`node-${node.y}`}
						cx={node.x}
						cy={node.y}
						r={NODE_RADIUS}
						fill={i % 2 === 0 ? "rgba(255, 215, 0, 0.18)" : "rgba(2, 136, 209, 0.15)"}
						className="helix-node-pulse"
					/>
				))}
				<defs>
					<filter id="helix-blur">
						<feGaussianBlur stdDeviation="2" />
					</filter>
				</defs>
			</svg>
		</div>
	);
}

export function DNAHelix() {
	return (
		<>
			<HelixStrand side="left" />
			<HelixStrand side="right" />
		</>
	);
}

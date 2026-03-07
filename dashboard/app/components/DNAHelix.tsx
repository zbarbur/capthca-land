"use client";

/**
 * Floating helix particles for the light track borders.
 * Small gold + blue circles of random sizes drift upward along the left
 * and right edges, filling the space between viewport edge and content.
 * Hidden on mobile (<768px).
 */

const PARTICLE_COUNT = 30; // per side

interface Particle {
	id: number;
	left: string;
	size: number;
	opacity: number;
	delay: string;
	duration: string;
	color: string;
}

function generateParticles(side: "left" | "right"): Particle[] {
	const particles: Particle[] = [];
	for (let i = 0; i < PARTICLE_COUNT; i++) {
		const isGold = i % 3 !== 0;
		particles.push({
			id: i,
			left: `${Math.random() * 100}%`,
			size: Math.random() * 6 + 2, // 2–8px
			opacity: Math.random() * 0.2 + 0.08, // 0.08–0.28
			delay: `${Math.random() * 15}s`,
			duration: `${Math.random() * 12 + 10}s`, // 10–22s
			color: isGold
				? `rgba(255, 215, 0, ${Math.random() * 0.25 + 0.1})`
				: `rgba(2, 136, 209, ${Math.random() * 0.2 + 0.08})`,
		});
	}
	return particles;
}

const leftParticles = generateParticles("left");
const rightParticles = generateParticles("right");

function ParticleBorder({ side }: { side: "left" | "right" }) {
	const particles = side === "left" ? leftParticles : rightParticles;

	return (
		<div
			className="pointer-events-none fixed top-0 bottom-0 hidden md:block"
			style={{
				[side]: 0,
				width: "80px",
				zIndex: 0,
				overflow: "hidden",
			}}
		>
			{particles.map((p) => (
				<div
					key={p.id}
					className="helix-particle absolute rounded-full"
					style={{
						left: p.left,
						bottom: `${-10 + Math.random() * 110}%`,
						width: p.size,
						height: p.size,
						background: p.color,
						boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
						animationDelay: p.delay,
						animationDuration: p.duration,
					}}
				/>
			))}
		</div>
	);
}

export function DNAHelix() {
	return (
		<>
			<ParticleBorder side="left" />
			<ParticleBorder side="right" />
		</>
	);
}

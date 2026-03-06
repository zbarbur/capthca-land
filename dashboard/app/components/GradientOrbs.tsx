"use client";

/**
 * Ambient floating gradient orbs for the light track.
 * Pure CSS animation (transform + opacity) — compositor-friendly, zero JS cost.
 */
export function GradientOrbs() {
	return (
		<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
			{/* Ethereal blue orb — top-left */}
			<div
				className="orb-drift absolute -top-[20%] -left-[10%] h-[60vh] w-[60vh] rounded-full"
				style={{
					background: "radial-gradient(circle, rgba(224, 247, 250, 0.4) 0%, transparent 70%)",
					animationDelay: "0s",
				}}
			/>
			{/* Warm gold orb — bottom-right */}
			<div
				className="orb-drift absolute -bottom-[15%] -right-[10%] h-[55vh] w-[55vh] rounded-full"
				style={{
					background: "radial-gradient(circle, rgba(255, 249, 196, 0.3) 0%, transparent 70%)",
					animationDelay: "-20s",
					animationDuration: "75s",
				}}
			/>
			{/* Subtle sage orb — center */}
			<div
				className="orb-drift absolute top-[40%] left-[30%] h-[40vh] w-[40vh] rounded-full"
				style={{
					background: "radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%)",
					animationDelay: "-40s",
					animationDuration: "90s",
				}}
			/>
		</div>
	);
}

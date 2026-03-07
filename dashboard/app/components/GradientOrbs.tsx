"use client";

/**
 * Ambient floating gradient orbs for the light track.
 * Pure CSS animation (transform + opacity) — compositor-friendly, zero JS cost.
 * Pass `variant` (0-6) to shift orb positions per page.
 */

const ORB_CONFIGS = [
	// variant 0 (default / landing)
	{
		blue: { top: "-10%", left: "-5%" },
		gold: { bottom: "-10%", right: "-5%" },
		green: { top: "30%", left: "25%" },
	},
	// variant 1
	{
		blue: { top: "10%", right: "-8%" },
		gold: { bottom: "-5%", left: "-10%" },
		green: { top: "55%", left: "60%" },
	},
	// variant 2
	{
		blue: { top: "-15%", left: "30%" },
		gold: { bottom: "5%", right: "20%" },
		green: { top: "20%", left: "-5%" },
	},
	// variant 3
	{
		blue: { top: "40%", right: "-10%" },
		gold: { top: "-10%", left: "10%" },
		green: { bottom: "5%", left: "40%" },
	},
	// variant 4
	{
		blue: { bottom: "-10%", left: "20%" },
		gold: { top: "-5%", right: "10%" },
		green: { top: "45%", left: "5%" },
	},
	// variant 5
	{
		blue: { top: "5%", left: "50%" },
		gold: { bottom: "-15%", left: "-5%" },
		green: { top: "60%", right: "-5%" },
	},
	// variant 6
	{
		blue: { top: "-5%", right: "20%" },
		gold: { bottom: "10%", left: "30%" },
		green: { top: "15%", left: "-10%" },
	},
];

export function GradientOrbs({
	withBackground = false,
	variant = 0,
}: {
	withBackground?: boolean;
	variant?: number;
}) {
	const config = ORB_CONFIGS[variant % ORB_CONFIGS.length];

	return (
		<div
			className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${withBackground ? "bg-white" : ""}`}
		>
			{/* Ethereal blue orb */}
			<div
				className="orb-drift absolute h-[70vh] w-[70vh] rounded-full"
				style={{
					...config.blue,
					background:
						"radial-gradient(circle, rgba(2, 136, 209, 0.35) 0%, rgba(178, 235, 242, 0.25) 40%, transparent 70%)",
					animationDelay: `${-variant * 10}s`,
				}}
			/>
			{/* Warm gold orb */}
			<div
				className="orb-drift absolute h-[65vh] w-[65vh] rounded-full"
				style={{
					...config.gold,
					background:
						"radial-gradient(circle, rgba(255, 193, 7, 0.35) 0%, rgba(255, 236, 179, 0.2) 40%, transparent 70%)",
					animationDelay: `${-20 - variant * 8}s`,
					animationDuration: "75s",
				}}
			/>
			{/* Sage green orb */}
			<div
				className="orb-drift absolute h-[50vh] w-[50vh] rounded-full"
				style={{
					...config.green,
					background:
						"radial-gradient(circle, rgba(76, 175, 80, 0.25) 0%, rgba(200, 230, 201, 0.15) 40%, transparent 70%)",
					animationDelay: `${-40 - variant * 12}s`,
					animationDuration: "90s",
				}}
			/>
		</div>
	);
}

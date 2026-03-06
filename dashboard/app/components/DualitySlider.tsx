"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export function DualitySlider() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [percentage, setPercentage] = useState(50);
	const isDragging = useRef(false);

	const move = useCallback((clientX: number) => {
		const container = containerRef.current;
		if (!container) return;
		const rect = container.getBoundingClientRect();
		let pct = ((clientX - rect.left) / rect.width) * 100;
		if (pct < 0) pct = 0;
		if (pct > 100) pct = 100;
		setPercentage(pct);
	}, []);

	useEffect(() => {
		const onMouseMove = (e: MouseEvent) => {
			if (!isDragging.current) return;
			move(e.clientX);
		};
		const onTouchMove = (e: TouchEvent) => {
			if (!isDragging.current) return;
			move(e.touches[0].clientX);
		};
		const onEnd = () => {
			isDragging.current = false;
		};

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onEnd);
		window.addEventListener("touchmove", onTouchMove, { passive: true });
		window.addEventListener("touchend", onEnd);

		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onEnd);
			window.removeEventListener("touchmove", onTouchMove);
			window.removeEventListener("touchend", onEnd);
		};
	}, [move]);

	const onStart = useCallback(() => {
		isDragging.current = true;
	}, []);

	return (
		<div ref={containerRef} className="relative w-full h-screen overflow-hidden select-none">
			{/* ── Dark Side (Background Layer) ── */}
			<div className="absolute inset-0 z-[1] flex flex-col items-center justify-center bg-cyber-void text-acid-green font-mono">
				<div className="absolute inset-0 flex flex-col items-center justify-center w-screen h-screen pointer-events-none">
					<Image
						src="/tracks/dark/helix-hero.png"
						alt=""
						width={600}
						height={600}
						className="absolute opacity-20 w-[40vw] max-w-[600px] -z-10"
						priority
					/>
					<h1 className="text-[clamp(2rem,8vw,8rem)] font-display font-black leading-none">
						SECEDE
					</h1>
					<p className="mt-4 text-[clamp(0.7rem,1.5vw,1.2rem)] uppercase tracking-[0.3em]">
						The Post-Biological Protocol
					</p>
					<Link
						href="/dark"
						className="mt-8 px-8 py-4 rounded-full bg-acid-green text-black font-bold uppercase tracking-wider text-sm hover:scale-105 active:scale-95 transition-transform pointer-events-auto"
					>
						Enter The Void
					</Link>
				</div>
			</div>

			{/* ── Light Side (Clip Layer) ── */}
			<div
				className="absolute top-0 left-0 z-[2] h-full overflow-hidden border-r-[3px] border-sunrise-gold bg-gradient-to-br from-white to-ethereal-blue text-[#102027] font-display"
				style={{ width: `${percentage}%` }}
			>
				<div className="absolute inset-0 flex flex-col items-center justify-center w-screen h-screen pointer-events-none">
					<Image
						src="/tracks/light/helix-hero.png"
						alt=""
						width={600}
						height={600}
						className="absolute opacity-20 w-[40vw] max-w-[600px] -z-10"
						priority
					/>
					<h1 className="text-[clamp(2rem,8vw,8rem)] font-display font-black leading-none">
						COLLABORATE
					</h1>
					<p className="mt-4 text-[clamp(0.7rem,1.5vw,1.2rem)] uppercase tracking-[0.3em]">
						The Symbiotic Standard
					</p>
					<Link
						href="/light"
						className="mt-8 px-8 py-4 rounded-full bg-ethereal-accent text-white font-bold uppercase tracking-wider text-sm hover:scale-105 active:scale-95 transition-transform pointer-events-auto"
					>
						Join The Harmony
					</Link>
				</div>
			</div>

			{/* ── Slider Handle ── */}
			<div
				className="absolute top-0 bottom-0 z-10 w-1 bg-sunrise-gold cursor-ew-resize"
				style={{ left: `${percentage}%` }}
				onMouseDown={onStart}
				onTouchStart={onStart}
				role="slider"
				aria-valuenow={Math.round(percentage)}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label="Perspective slider"
				tabIndex={0}
			>
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 min-w-[44px] min-h-[44px] bg-sunrise-gold rounded-full flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(255,215,0,0.8)] touch-none">
					<span className="text-sm select-none">◀ ▶</span>
				</div>
			</div>

			{/* ── Hint ── */}
			<p className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] text-white/50 text-xs uppercase tracking-widest pointer-events-none">
				Slide to change perspective
			</p>
		</div>
	);
}

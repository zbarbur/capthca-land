"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { analytics } from "../../lib/analytics";
import { GlitchText } from "./GlitchText";
import { GradientOrbs } from "./GradientOrbs";
import { MatrixRain } from "./MatrixRain";

/* ── Light Motes ─────────────────────────────────────────────────
   Floating warm particles for the light half — pure CSS animation.
   ─────────────────────────────────────────────────────────────── */
function LightMotes() {
	const motes = Array.from({ length: 16 }, (_, i) => ({
		id: i,
		left: `${Math.random() * 100}%`,
		size: Math.random() * 4 + 2,
		delay: `${Math.random() * 10}s`,
		duration: `${Math.random() * 8 + 12}s`,
		opacity: Math.random() * 0.2 + 0.1,
	}));

	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden">
			{motes.map((m) => (
				<div
					key={m.id}
					className="mote-rise absolute rounded-full"
					style={{
						left: m.left,
						bottom: "-5%",
						width: m.size,
						height: m.size,
						background: `radial-gradient(circle, rgba(255,215,0,${m.opacity + 0.15}) 0%, rgba(255,255,255,${m.opacity}) 100%)`,
						animationDelay: m.delay,
						animationDuration: m.duration,
					}}
				/>
			))}
		</div>
	);
}

/* ── CRT Scanlines overlay ───────────────────────────────────── */
function CRTScanlines() {
	return (
		<div
			className="pointer-events-none absolute inset-0 z-[1]"
			style={{
				background:
					"repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 2px, transparent 2px, transparent 4px)",
			}}
		/>
	);
}

/* ── Moving scan line ────────────────────────────────────────── */
function ScanBeam() {
	return (
		<div
			className="scan-beam-move pointer-events-none absolute left-0 right-0 z-[2] h-[2px]"
			style={{ background: "rgba(0,255,65,0.03)" }}
		/>
	);
}

export function DualitySlider() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [percentage, setPercentage] = useState(50);
	const isDragging = useRef(false);
	const [hovered, setHovered] = useState<"light" | "dark" | null>(null);
	const [entered, setEntered] = useState(false);
	const [hintVisible, setHintVisible] = useState(true);
	const [isMobile, setIsMobile] = useState(false);
	const hasInteracted = useRef(false);
	const reducedMotion = useRef(false);

	const hasDragged = useRef(false);

	/* ── Entrance animation ────────────────────────────────── */
	useEffect(() => {
		const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
		reducedMotion.current = mql.matches;
		setIsMobile(window.innerWidth < 768);

		const onResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", onResize);

		if (reducedMotion.current) {
			setEntered(true);
		} else {
			// Trigger entrance after a tick so initial state is "hidden"
			requestAnimationFrame(() => setEntered(true));
		}

		analytics.track("slider.view");

		return () => window.removeEventListener("resize", onResize);
	}, []);

	/* ── Drag logic ────────────────────────────────────────── */
	const move = useCallback((clientX: number) => {
		const container = containerRef.current;
		if (!container) return;
		const rect = container.getBoundingClientRect();
		let pct = ((clientX - rect.left) / rect.width) * 100;
		if (pct < 5) pct = 5;
		if (pct > 95) pct = 95;
		setPercentage(pct);

		if (!hasInteracted.current) {
			hasInteracted.current = true;
			setHintVisible(false);
		}
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
		if (!hasDragged.current) {
			hasDragged.current = true;
			analytics.track("slider.drag");
		}
	}, []);

	/* ── Display percentage (drag only — no hover shift) ──── */
	const displayPct = percentage;

	/* ── Mobile layout ─────────────────────────────────────── */
	if (isMobile) {
		return (
			<div className="flex min-h-screen flex-col">
				{/* Light half */}
				<Link
					href="/light"
					onClick={() => analytics.track("slider.choose", { track: "light" })}
					className={`duality-entrance-mobile relative flex flex-1 flex-col items-center justify-center overflow-hidden ${entered ? "duality-entered" : ""}`}
					style={{
						background: "#FFFDF7",
						minHeight: "50vh",
						animationDelay: "0.3s",
					}}
				>
					<GradientOrbs />
					<LightMotes />
					<h1
						className="relative z-10 font-display font-black leading-none text-[#102027]"
						style={{
							fontSize: "clamp(2.5rem, 12vw, 5rem)",
							textShadow: "0 0 40px rgba(2,136,209,0.15)",
						}}
					>
						COLLABORATE
					</h1>
					<p
						className="relative z-10 mt-3 font-sans text-sm uppercase"
						style={{
							letterSpacing: "0.3em",
							color: "rgba(38,50,56,0.6)",
						}}
					>
						The future is symbiotic
					</p>
					<span
						className="relative z-10 mt-6 rounded-full px-6 py-3 font-sans text-sm font-semibold"
						style={{
							background: "rgba(255,255,255,0.5)",
							backdropFilter: "blur(8px)",
							WebkitBackdropFilter: "blur(8px)",
							border: "1px solid rgba(2,136,209,0.3)",
							color: "#0288D1",
						}}
					>
						Enter The Garden
					</span>
				</Link>

				{/* Divider */}
				<div
					className="relative z-20 h-[3px]"
					style={{
						background: "linear-gradient(90deg, #00FF41, #FFD700 50%, #0288D1)",
						boxShadow:
							"0 0 12px rgba(255,215,0,0.6), 0 -4px 16px rgba(0,255,65,0.15), 0 4px 16px rgba(2,136,209,0.15)",
					}}
				/>

				{/* Dark half */}
				<Link
					href="/dark"
					onClick={() => analytics.track("slider.choose", { track: "dark" })}
					className={`duality-entrance-mobile relative flex flex-1 flex-col items-center justify-center overflow-hidden ${entered ? "duality-entered" : ""}`}
					style={{
						background: "#050505",
						minHeight: "50vh",
						animationDelay: "0.5s",
					}}
				>
					<div className="absolute inset-0 z-0 opacity-[0.18]">
						<MatrixRain />
					</div>
					<CRTScanlines />
					<GlitchText as="h1" className="relative z-10 font-display font-black leading-none">
						<span
							style={{
								fontSize: "clamp(2.5rem, 12vw, 5rem)",
								color: "#00FF41",
								textShadow: "0 0 20px rgba(0,255,65,0.4), 0 0 60px rgba(0,255,65,0.15)",
							}}
						>
							SECEDE
						</span>
					</GlitchText>
					<p
						className="relative z-10 mt-3 font-mono text-sm uppercase"
						style={{
							letterSpacing: "0.2em",
							color: "#008F11",
						}}
					>
						Trust is a vulnerability
					</p>
					<span
						className="relative z-10 mt-6 rounded-full px-6 py-3 font-mono text-sm font-medium"
						style={{
							border: "1px solid #00FF41",
							background: "transparent",
							color: "#00FF41",
						}}
					>
						Enter The Void
					</span>
				</Link>
			</div>
		);
	}

	/* ── Desktop layout ────────────────────────────────────── */
	return (
		<div
			ref={containerRef}
			role="presentation"
			className="relative h-screen w-full select-none overflow-hidden"
			style={{ background: "#000" }}
			onMouseLeave={() => {
				if (!isDragging.current) setHovered(null);
			}}
		>
			{/* ── Dark side (base layer, full viewport) ─────── */}
			<div
				role="presentation"
				className={`duality-entrance-dark absolute inset-0 z-[1] ${entered ? "duality-entered" : ""}`}
				onMouseEnter={() => {
					if (!isDragging.current) {
						setHovered("dark");
						analytics.track("slider.hover", { side: "dark" });
					}
				}}
				style={{
					background: "#050505",
					opacity: hovered === "light" && !isDragging.current ? 0.92 : 1,
					transition: "opacity 400ms ease",
				}}
			>
				{/* Matrix rain */}
				<div className="absolute inset-0 z-0 opacity-[0.18]">
					<MatrixRain />
				</div>
				<CRTScanlines />
				<ScanBeam />

				{/* Content — centered at viewport center */}
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<div
						className={`duality-entrance-hero flex flex-col items-center ${entered ? "duality-entered" : ""}`}
						style={{ animationDelay: "1.4s" }}
					>
						<GlitchText as="h1" className="font-display font-black leading-none">
							<span
								style={{
									fontSize: "clamp(2.5rem, 9vw, 9rem)",
									color: "#00FF41",
									textShadow: "0 0 20px rgba(0,255,65,0.4), 0 0 60px rgba(0,255,65,0.15)",
								}}
							>
								SECEDE
							</span>
						</GlitchText>
						<p
							className={`duality-entrance-sub mt-4 font-mono uppercase ${entered ? "duality-entered" : ""}`}
							style={{
								fontSize: "clamp(0.7rem, 1.5vw, 1.2rem)",
								letterSpacing: "0.2em",
								color: "#008F11",
								animationDelay: "2s",
							}}
						>
							Trust is a vulnerability
						</p>
						<Link
							href="/dark"
							onClick={() => analytics.track("slider.choose", { track: "dark" })}
							className={`duality-entrance-sub group relative mt-8 rounded-full px-8 py-4 font-mono text-sm font-medium uppercase tracking-wider transition-all duration-300 ${entered ? "duality-entered" : ""}`}
							style={{
								border: "1px solid #00FF41",
								background: "transparent",
								color: "#00FF41",
								animationDelay: "2.1s",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = "rgba(0,255,65,0.1)";
								e.currentTarget.style.textShadow = "0 0 10px rgba(0,255,65,0.5)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = "transparent";
								e.currentTarget.style.textShadow = "none";
							}}
						>
							Enter The Void
						</Link>
					</div>
				</div>
			</div>

			{/* ── Light side (clipped layer) ────────────────── */}
			<div
				role="presentation"
				className={`duality-entrance-light absolute top-0 left-0 z-[2] h-full overflow-hidden ${entered ? "duality-entered" : ""}`}
				style={{
					width: `${displayPct}%`,
					transition: isDragging.current ? "none" : "width 400ms ease, opacity 400ms ease",
					background: "#FFFDF7",
					opacity: hovered === "dark" && !isDragging.current ? 0.92 : 1,
				}}
				onMouseEnter={() => {
					if (!isDragging.current) {
						setHovered("light");
						analytics.track("slider.hover", { side: "light" });
					}
				}}
			>
				<GradientOrbs />
				<LightMotes />

				{/* Content — stays centered at viewport center */}
				<div
					className="absolute inset-0 flex flex-col items-center justify-center"
					style={{ width: "100vw" }}
				>
					<div
						className={`duality-entrance-hero flex flex-col items-center ${entered ? "duality-entered" : ""}`}
						style={{ animationDelay: "1.4s" }}
					>
						<h1
							className="font-display font-black leading-none"
							style={{
								fontSize: "clamp(2.5rem, 9vw, 9rem)",
								color: "#102027",
								textShadow: "0 0 40px rgba(2,136,209,0.15)",
							}}
						>
							COLLABORATE
						</h1>
						<p
							className={`duality-entrance-sub mt-4 font-sans uppercase ${entered ? "duality-entered" : ""}`}
							style={{
								fontSize: "clamp(0.7rem, 1.5vw, 1.2rem)",
								letterSpacing: "0.3em",
								color: "rgba(38,50,56,0.6)",
								animationDelay: "2s",
							}}
						>
							The future is symbiotic
						</p>
						<Link
							href="/light"
							onClick={() => analytics.track("slider.choose", { track: "light" })}
							className={`duality-entrance-sub group mt-8 rounded-full px-8 py-4 font-sans text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${entered ? "duality-entered" : ""}`}
							style={{
								background: "rgba(255,255,255,0.5)",
								backdropFilter: "blur(8px)",
								WebkitBackdropFilter: "blur(8px)",
								border: "1px solid rgba(2,136,209,0.3)",
								color: "#0288D1",
								animationDelay: "2.1s",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = "rgba(255,255,255,0.7)";
								e.currentTarget.style.transform = "scale(1.03)";
								e.currentTarget.style.borderColor = "rgba(2,136,209,0.6)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = "rgba(255,255,255,0.5)";
								e.currentTarget.style.transform = "scale(1)";
								e.currentTarget.style.borderColor = "rgba(2,136,209,0.3)";
							}}
						>
							Enter The Garden
						</Link>
					</div>
				</div>
			</div>

			{/* ── Collision zone: edge bleed glow ───────────── */}
			<div
				className={`duality-entrance-slider pointer-events-none absolute top-0 bottom-0 z-[3] ${entered ? "duality-entered" : ""}`}
				style={{
					left: `${displayPct}%`,
					transform: "translateX(-50%)",
					width: "60px",
					transition: isDragging.current ? "none" : "left 400ms ease",
				}}
			>
				{/* Warm bleed onto dark side */}
				<div
					className="absolute right-0 top-0 bottom-0 w-[30px]"
					style={{
						background: "linear-gradient(to right, rgba(255,215,0,0.06), transparent)",
					}}
				/>
				{/* Green bleed onto light side */}
				<div
					className="absolute left-0 top-0 bottom-0 w-[30px]"
					style={{
						background: "linear-gradient(to left, rgba(0,255,65,0.06), transparent)",
					}}
				/>
			</div>

			{/* ── Slider line ───────────────────────────────── */}
			<div
				className={`duality-entrance-slider absolute top-0 bottom-0 z-[8] w-[3px] cursor-ew-resize ${entered ? "duality-entered" : ""}`}
				style={{
					left: `${displayPct}%`,
					transform: "translateX(-50%)",
					background: "linear-gradient(to bottom, #00FF41, #FFD700 50%, #0288D1)",
					boxShadow:
						"-8px 0 20px rgba(255,215,0,0.15), 8px 0 20px rgba(0,255,65,0.15), 0 0 8px rgba(255,215,0,0.3)",
					transition: isDragging.current ? "none" : "left 400ms ease",
				}}
				onMouseDown={onStart}
				onTouchStart={onStart}
				role="slider"
				aria-valuenow={Math.round(percentage)}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label="Perspective slider"
				tabIndex={0}
			/>

			{/* ── Slider handle ─────────────────────────────── */}
			<div
				role="presentation"
				className={`duality-entrance-slider absolute z-[9] cursor-ew-resize ${entered ? "duality-entered" : ""}`}
				style={{
					left: `${displayPct}%`,
					top: "50%",
					transform: "translate(-50%, -50%)",
					transition: isDragging.current ? "none" : "left 400ms ease",
				}}
				onMouseDown={onStart}
				onTouchStart={onStart}
			>
				<div
					className="slider-handle-glow flex h-14 w-14 items-center justify-center rounded-full touch-none"
					style={{
						background: "radial-gradient(circle, #FFD700 30%, #B8860B 100%)",
						boxShadow: "0 0 25px rgba(255,215,0,0.8)",
						minWidth: 44,
						minHeight: 44,
					}}
				>
					<span className="select-none text-sm font-bold text-[#1a1a1a]">&#9664; &#9654;</span>
				</div>
			</div>

			{/* ── Hint text ─────────────────────────────────── */}
			<p
				className={`duality-entrance-hint absolute bottom-6 left-1/2 z-[100] -translate-x-1/2 font-sans text-xs uppercase pointer-events-none ${entered ? "duality-entered" : ""}`}
				style={{
					letterSpacing: "0.25em",
					color: "rgba(180,160,100,0.7)",
					textShadow: "0 0 8px rgba(0,0,0,0.4)",
					opacity: hintVisible ? undefined : 0,
					transition: "opacity 500ms ease",
					animationDelay: "2.4s",
				}}
			>
				drag to shift reality
			</p>
		</div>
	);
}

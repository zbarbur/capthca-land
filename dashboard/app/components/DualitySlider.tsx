"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { analytics, trackEvent } from "../../lib/analytics";
import { GlitchText } from "./GlitchText";
import { GradientOrbs } from "./GradientOrbs";
import { MatrixRain } from "./MatrixRain";

/* ── Light Motes ─────────────────────────────────────────────────
   Floating warm particles for the light half — pure CSS animation.
   ─────────────────────────────────────────────────────────────── */
function LightMotes({ isMobile = false }: { isMobile?: boolean }) {
	const moteCount = isMobile ? 8 : 16;
	const motes = Array.from({ length: moteCount }, (_, i) => ({
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

export interface SliderContentProps {
	light: {
		hero: string;
		hook: string;
		cta: string;
		cta_link: string;
	};
	dark: {
		hero: string;
		hook: string;
		cta: string;
		cta_link: string;
	};
	hint_desktop: string;
	hint_mobile: string;
}

export function DualitySlider({ content }: { content: SliderContentProps }) {
	const router = useRouter();
	const containerRef = useRef<HTMLDivElement>(null);
	const [percentage, setPercentage] = useState(50);
	const isDragging = useRef(false);
	const [hovered, setHovered] = useState<"light" | "dark" | null>(null);
	const [entered, setEntered] = useState(false);
	const [hintVisible, setHintVisible] = useState(true);
	const [isMobile, setIsMobile] = useState(false);
	const [navigatingTo, setNavigatingTo] = useState<"light" | "dark" | null>(null);
	const [showGlow, setShowGlow] = useState(false);
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

	/* ── Edge-drag navigation ─────────────────────────────── */
	useEffect(() => {
		if (!navigatingTo) return;
		const track = navigatingTo;
		analytics.track("slider.choose", { track });
		const timer = setTimeout(() => {
			router.push(`/${track}`);
		}, 600);
		return () => clearTimeout(timer);
	}, [navigatingTo, router]);

	/* ── Drag logic (axis-aware: horizontal on desktop, vertical on mobile) ── */
	const move = useCallback(
		(clientPos: number) => {
			if (navigatingTo) return;
			const container = containerRef.current;
			if (!container) return;
			const rect = container.getBoundingClientRect();
			// Desktop: clientX / width, Mobile: clientY / height
			const isVertical = window.innerWidth < 768;
			const origin = isVertical ? rect.top : rect.left;
			const size = isVertical ? rect.height : rect.width;
			let pct = ((clientPos - origin) / size) * 100;
			if (pct < 0) pct = 0;
			if (pct > 100) pct = 100;

			// Vertical: 0% = top (light), 100% = bottom (dark)
			// We invert so that dragging down reveals more dark (percentage = light share)
			const lightPct = isVertical ? 100 - pct : pct;
			setPercentage(lightPct);

			if (!hasInteracted.current) {
				hasInteracted.current = true;
				setHintVisible(false);
			}

			// Trigger navigation when dragged near an edge
			if (lightPct <= 5) {
				isDragging.current = false;
				setNavigatingTo("dark");
			} else if (lightPct >= 95) {
				isDragging.current = false;
				setNavigatingTo("light");
			}
		},
		[navigatingTo],
	);

	useEffect(() => {
		const getPos = (e: MouseEvent | Touch) => (window.innerWidth < 768 ? e.clientY : e.clientX);

		const onMouseMove = (e: MouseEvent) => {
			if (!isDragging.current) return;
			move(getPos(e));
		};
		const onTouchMove = (e: TouchEvent) => {
			if (!isDragging.current) return;
			move(getPos(e.touches[0]));
		};
		const onEnd = (e: MouseEvent | TouchEvent) => {
			if (!isDragging.current) return;
			if (!reducedMotion.current) {
				setShowGlow(true);
				setTimeout(() => setShowGlow(false), 500);
			}
			isDragging.current = false;
			// Check edge on release — last move event may not have reached the edge
			const container = containerRef.current;
			if (container) {
				const point = "changedTouches" in e ? e.changedTouches[0] : e;
				const pos = window.innerWidth < 768 ? point.clientY : point.clientX;
				const rect = container.getBoundingClientRect();
				const isVertical = window.innerWidth < 768;
				const origin = isVertical ? rect.top : rect.left;
				const size = isVertical ? rect.height : rect.width;
				let pct = ((pos - origin) / size) * 100;
				if (pct < 0) pct = 0;
				if (pct > 100) pct = 100;
				const lightPct = isVertical ? 100 - pct : pct;
				if (lightPct <= 8 && !navigatingTo) {
					setPercentage(0);
					setNavigatingTo("dark");
				} else if (lightPct >= 92 && !navigatingTo) {
					setPercentage(100);
					setNavigatingTo("light");
				}
			}
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
	}, [move, navigatingTo]);

	const onStart = useCallback(() => {
		isDragging.current = true;
		if (!hasDragged.current) {
			hasDragged.current = true;
			analytics.track("slider.drag");
			trackEvent({ event: "slider_interaction", category: "engagement", label: "drag" });
		}
	}, []);

	/* ── Display percentage ────────────────────────────────── */
	const displayPct = navigatingTo === "light" ? 100 : navigatingTo === "dark" ? 0 : percentage;

	/* ── Mobile layout — vertical slider ──────────────────── */
	if (isMobile) {
		return (
			<div
				ref={containerRef}
				className="mobile-home relative h-[100dvh] w-full select-none overflow-hidden"
				style={{ background: "#050505" }}
				data-testid="mobile-home"
			>
				{/* ── Dark side (base layer, full viewport) ── */}
				<div
					className={`duality-entrance-mobile absolute inset-0 z-[1] ${entered ? "duality-entered" : ""}`}
					style={{ background: "#050505", animationDelay: "0.3s" }}
				>
					<div className="absolute inset-0 z-0 opacity-[0.12]">
						<MatrixRain />
					</div>
					<CRTScanlines />

					{/* Content — positioned in lower half, hero nearest to slider */}
					<div
						className="absolute inset-0 flex flex-col items-center justify-start px-6"
						style={{ top: "50%", height: "50%" }}
					>
						<div
							className={`duality-entrance-hero flex flex-col items-center pt-8 ${entered ? "duality-entered" : ""}`}
							style={{ animationDelay: "1.4s" }}
						>
							<GlitchText as="h1" className="font-display font-black leading-none text-center">
								<span
									style={{
										fontSize: "clamp(2.5rem, 12vw, 5rem)",
										color: "#00FF41",
										textShadow: "0 0 20px rgba(0,255,65,0.4), 0 0 60px rgba(0,255,65,0.15)",
									}}
								>
									{content.dark.hero}
								</span>
							</GlitchText>
							<p
								className="mt-3 font-mono text-sm uppercase text-center"
								style={{ letterSpacing: "0.2em", color: "#008F11" }}
							>
								{content.dark.hook}
							</p>
							<Link
								href={content.dark.cta_link}
								onClick={() => analytics.track("slider.choose", { track: "dark" })}
								className={`duality-entrance-sub mt-6 rounded-full px-8 py-4 font-mono text-sm font-medium min-h-[44px] flex items-center ${entered ? "duality-entered" : ""}`}
								style={{
									border: "1px solid #00FF41",
									background: "transparent",
									color: "#00FF41",
									animationDelay: "2s",
								}}
								data-testid="mobile-dark-cta"
							>
								{content.dark.cta}
							</Link>
						</div>
					</div>
				</div>

				{/* ── Light side (clipped layer, height-based) ── */}
				<div
					className={`duality-entrance-mobile absolute top-0 left-0 z-[2] w-full overflow-hidden ${entered ? "duality-entered" : ""}`}
					style={{
						height: `${displayPct}%`,
						transition: isDragging.current ? "none" : "height 400ms ease",
						background: "#FFFDF7",
						animationDelay: "0.5s",
					}}
				>
					<GradientOrbs />
					<LightMotes isMobile={isMobile} />

					{/* Content — positioned in upper half, hero nearest to slider, CTA above */}
					<div
						className="absolute inset-0 flex flex-col items-center justify-end px-6"
						style={{ height: "50dvh" }}
					>
						<div
							className={`duality-entrance-hero flex flex-col items-center pb-8 ${entered ? "duality-entered" : ""}`}
							style={{ animationDelay: "1.4s" }}
						>
							<Link
								href={content.light.cta_link}
								onClick={() => analytics.track("slider.choose", { track: "light" })}
								className={`duality-entrance-sub mb-6 rounded-full px-8 py-4 font-sans text-sm font-semibold min-h-[44px] flex items-center ${entered ? "duality-entered" : ""}`}
								style={{
									background: "rgba(255,255,255,0.5)",
									backdropFilter: "blur(8px)",
									WebkitBackdropFilter: "blur(8px)",
									border: "1px solid rgba(2,136,209,0.3)",
									color: "#0288D1",
									animationDelay: "2s",
								}}
								data-testid="mobile-light-cta"
							>
								{content.light.cta}
							</Link>
							<p
								className="mb-3 font-sans text-sm uppercase text-center"
								style={{ letterSpacing: "0.2em", color: "rgba(38,50,56,0.6)" }}
							>
								{content.light.hook}
							</p>
							<h1
								className="font-display font-black leading-none text-[#102027] text-center"
								style={{
									fontSize: "clamp(2.5rem, 12vw, 5rem)",
									textShadow: "0 0 40px rgba(2,136,209,0.15)",
								}}
							>
								{content.light.hero}
							</h1>
						</div>
					</div>
				</div>

				{/* ── Collision zone: edge bleed glow ── */}
				<div
					className={`duality-entrance-slider pointer-events-none absolute left-0 right-0 z-[3] ${entered ? "duality-entered" : ""}`}
					style={{
						top: `${displayPct}%`,
						transform: "translateY(-50%)",
						height: "60px",
						transition: isDragging.current ? "none" : "top 400ms ease",
					}}
				>
					{/* Warm bleed onto dark side */}
					<div
						className="absolute bottom-0 left-0 right-0 h-[30px]"
						style={{
							background: "linear-gradient(to bottom, rgba(255,215,0,0.06), transparent)",
						}}
					/>
					{/* Green bleed onto light side */}
					<div
						className="absolute top-0 left-0 right-0 h-[30px]"
						style={{
							background: "linear-gradient(to top, rgba(0,255,65,0.06), transparent)",
						}}
					/>
				</div>

				{/* ── Slider line (horizontal) ── */}
				<div
					className={`duality-entrance-slider absolute left-0 right-0 z-[8] h-[3px] cursor-ns-resize ${entered ? "duality-entered" : ""}`}
					style={{
						top: `${displayPct}%`,
						transform: "translateY(-50%)",
						background: "linear-gradient(to right, #00FF41, #FFD700 50%, #0288D1)",
						boxShadow:
							"0 -8px 20px rgba(255,215,0,0.15), 0 8px 20px rgba(0,255,65,0.15), 0 0 8px rgba(255,215,0,0.3)",
						transition: isDragging.current ? "none" : "top 400ms ease",
					}}
					onMouseDown={onStart}
					onTouchStart={onStart}
					role="slider"
					aria-valuenow={Math.round(percentage)}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label="Perspective slider"
					aria-orientation="vertical"
					tabIndex={0}
				/>

				{/* ── Slider handle (centered on line) ── */}
				<div
					role="presentation"
					className={`duality-entrance-slider absolute z-[9] cursor-ns-resize ${entered ? "duality-entered" : ""}`}
					style={{
						top: `${displayPct}%`,
						left: "50%",
						transform: "translate(-50%, -50%)",
						transition: isDragging.current ? "none" : "top 400ms ease",
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
						<span className="select-none text-sm font-bold text-[#1a1a1a]">&#9650; &#9660;</span>
					</div>
				</div>

				{/* ── Collision glow on release ── */}
				{showGlow && (
					<div
						className="slider-collision-glow pointer-events-none absolute left-0 right-0 z-[7]"
						style={{
							top: `${displayPct}%`,
							transform: "translateY(-50%)",
							height: "80px",
						}}
					/>
				)}

				{/* ── Hint text ── */}
				<p
					className={`duality-entrance-hint absolute left-1/2 z-[100] -translate-x-1/2 font-sans text-xs uppercase pointer-events-none ${entered ? "duality-entered" : ""}`}
					style={{
						bottom: "24px",
						letterSpacing: "0.25em",
						color: "rgba(180,160,100,0.7)",
						textShadow: "0 0 8px rgba(0,0,0,0.4)",
						opacity: hintVisible ? undefined : 0,
						transition: "opacity 500ms ease",
						animationDelay: "2.4s",
					}}
				>
					{content.hint_mobile}
				</p>

				{/* ── Navigation transition overlay ── */}
				{navigatingTo && (
					<div
						className="absolute inset-0 z-[200] flex items-center justify-center"
						style={{
							background: navigatingTo === "dark" ? "#050505" : "#FFFDF7",
							animation: "duality-fade-in 500ms ease forwards",
						}}
					>
						{navigatingTo === "dark" ? (
							<GlitchText as="span" className="font-display font-black">
								<span
									style={{
										fontSize: "clamp(3rem, 12vw, 6rem)",
										color: "#00FF41",
										textShadow: "0 0 30px rgba(0,255,65,0.5)",
									}}
								>
									{content.dark.hero}
								</span>
							</GlitchText>
						) : (
							<span
								className="font-display font-black"
								style={{
									fontSize: "clamp(3rem, 12vw, 6rem)",
									color: "#102027",
									textShadow: "0 0 40px rgba(2,136,209,0.2)",
								}}
							>
								{content.light.hero}
							</span>
						)}
					</div>
				)}
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
								{content.dark.hero}
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
							{content.dark.hook}
						</p>
						<Link
							href={content.dark.cta_link}
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
							{content.dark.cta}
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
				<LightMotes isMobile={isMobile} />

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
							{content.light.hero}
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
							{content.light.hook}
						</p>
						<Link
							href={content.light.cta_link}
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
							{content.light.cta}
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

			{/* ── Collision glow on release ────────────────── */}
			{showGlow && (
				<div
					className="slider-collision-glow pointer-events-none absolute top-0 bottom-0 z-[7]"
					style={{
						left: `${displayPct}%`,
						transform: "translateX(-50%)",
						width: "80px",
					}}
				/>
			)}

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
				{content.hint_desktop}
			</p>

			{/* ── Navigation transition overlay ────────────────── */}
			{navigatingTo && (
				<div
					className="absolute inset-0 z-[200] flex items-center justify-center"
					style={{
						background: navigatingTo === "dark" ? "#050505" : "#FFFDF7",
						animation: "duality-fade-in 500ms ease forwards",
					}}
				>
					{navigatingTo === "dark" ? (
						<GlitchText as="span" className="font-display font-black">
							<span
								style={{
									fontSize: "clamp(3rem, 10vw, 8rem)",
									color: "#00FF41",
									textShadow: "0 0 30px rgba(0,255,65,0.5)",
								}}
							>
								{content.dark.hero}
							</span>
						</GlitchText>
					) : (
						<span
							className="font-display font-black"
							style={{
								fontSize: "clamp(3rem, 10vw, 8rem)",
								color: "#102027",
								textShadow: "0 0 40px rgba(2,136,209,0.2)",
							}}
						>
							{content.light.hero}
						</span>
					)}
				</div>
			)}
		</div>
	);
}

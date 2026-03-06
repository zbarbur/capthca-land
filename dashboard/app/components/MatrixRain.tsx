"use client";

import { useCallback, useEffect, useRef } from "react";

// Half-width katakana (U+FF61-FF9F) + Latin + digits
const CHARS =
	"ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface Column {
	x: number;
	y: number;
	speed: number;
	opacity: number;
	chars: string[];
	length: number;
}

export function MatrixRain() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const columnsRef = useRef<Column[]>([]);
	const animRef = useRef<number>(0);
	const lastFrameRef = useRef<number>(0);
	const reducedMotion = useRef(false);

	const initColumns = useCallback((width: number, height: number) => {
		const isMobile = width < 768;
		const fontSize = 14;
		const gap = isMobile ? fontSize * 2.5 : fontSize * 1.4;
		const cols: Column[] = [];

		for (let x = 0; x < width; x += gap) {
			const length = Math.floor(Math.random() * 15) + 8;
			const chars: string[] = [];
			for (let i = 0; i < length; i++) {
				chars.push(CHARS[Math.floor(Math.random() * CHARS.length)]);
			}
			cols.push({
				x,
				y: Math.random() * height * -1,
				speed: Math.random() * 1.5 + 0.5,
				opacity: Math.random() * 0.3 + 0.1,
				chars,
				length,
			});
		}
		columnsRef.current = cols;
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
		reducedMotion.current = mql.matches;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			initColumns(canvas.width, canvas.height);
		};

		resize();
		window.addEventListener("resize", resize);

		if (reducedMotion.current) {
			// Static grid fallback
			ctx.fillStyle = "#050505";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.font = "14px 'Fira Code', monospace";
			for (const col of columnsRef.current) {
				for (let i = 0; i < 3; i++) {
					const char = CHARS[Math.floor(Math.random() * CHARS.length)];
					const y = Math.random() * canvas.height;
					ctx.fillStyle = `rgba(0, 255, 65, ${col.opacity * 0.5})`;
					ctx.fillText(char, col.x, y);
				}
			}
			return () => window.removeEventListener("resize", resize);
		}

		const isMobile = window.innerWidth < 768;
		const targetFps = isMobile ? 30 : 60;
		const frameInterval = 1000 / targetFps;

		const draw = (timestamp: number) => {
			const elapsed = timestamp - lastFrameRef.current;
			if (elapsed < frameInterval) {
				animRef.current = requestAnimationFrame(draw);
				return;
			}
			lastFrameRef.current = timestamp;

			ctx.fillStyle = "rgba(5, 5, 5, 0.12)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.font = "14px 'Fira Code', monospace";

			for (const col of columnsRef.current) {
				for (let i = 0; i < col.length; i++) {
					const y = col.y + i * 16;
					if (y < 0 || y > canvas.height) continue;

					// Head character is brightest
					if (i === col.length - 1) {
						ctx.fillStyle = `rgba(0, 255, 65, ${col.opacity * 2.5})`;
						ctx.shadowColor = "#00FF41";
						ctx.shadowBlur = 8;
					} else {
						const fade = 1 - i / col.length;
						const green = Math.floor(65 + fade * 190);
						ctx.fillStyle = `rgba(0, ${green}, ${Math.floor(fade * 65)}, ${col.opacity * fade})`;
						ctx.shadowBlur = 0;
					}

					ctx.fillText(col.chars[i], col.x, y);

					// Random character mutation
					if (Math.random() < 0.02) {
						col.chars[i] = CHARS[Math.floor(Math.random() * CHARS.length)];
					}
				}

				ctx.shadowBlur = 0;
				col.y += col.speed * 2;

				if (col.y - col.length * 16 > canvas.height) {
					col.y = Math.random() * canvas.height * -0.5;
					col.speed = Math.random() * 1.5 + 0.5;
					col.opacity = Math.random() * 0.3 + 0.1;
				}
			}

			animRef.current = requestAnimationFrame(draw);
		};

		animRef.current = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(animRef.current);
			window.removeEventListener("resize", resize);
		};
	}, [initColumns]);

	return (
		<canvas
			ref={canvasRef}
			className="pointer-events-none fixed inset-0 z-0"
			style={{ opacity: 0.18 }}
			tabIndex={-1}
			aria-hidden="true"
		/>
	);
}

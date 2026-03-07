export const LIGHT = {
	accent: "#0288D1",
	secondary: "#FFD700",
	bg: "#ffffff",
	text: "#263238",
	muted: "#B0BEC5",
	subtle: "#CFD8DC",
	cardBg: "rgba(248, 253, 255, 0.85)",
	border: "#e1f5fe",
	success: "#4CAF50",
	danger: "#f44336",
};

export const DARK = {
	accent: "#39FF14",
	secondary: "#ff003c",
	bg: "#050505",
	text: "#e0e0e0",
	muted: "#666666",
	subtle: "#333333",
	cardBg: "rgba(10, 10, 10, 0.9)",
	border: "rgba(57, 255, 20, 0.2)",
	success: "#39FF14",
	danger: "#ff003c",
};

export function getTheme(track: "light" | "dark") {
	return track === "light" ? LIGHT : DARK;
}

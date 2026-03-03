module.exports = {
	content: ["./index.html", "./tracks/**/*.{html,js,md}", "./app/**/*.{html,js,css}"],
	darkMode: "class", // Managed via .theme-light / .theme-dark
	theme: {
		extend: {
			colors: {
				ethereal: { blue: "#E0F7FA", accent: "#0288D1" },
				sunrise: { gold: "#FFD700" },
				sage: { green: "#4CAF50" },
				acid: { green: "#39FF14" },
				cyber: { red: "#ff003c", void: "#050505", gray: "#1a1a1a" },
			},
			fontFamily: {
				sans: ["Inter", "sans-serif"],
				display: ["Montserrat", "sans-serif"],
				mono: ["Fira Code", "monospace"],
			},
			letterSpacing: { ultra: ".5em" },
		},
	},
	plugins: [],
};

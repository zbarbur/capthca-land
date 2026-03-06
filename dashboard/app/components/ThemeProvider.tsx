"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
	theme: "light",
	setTheme: () => {},
});

export function ThemeProvider({
	children,
	defaultTheme = "light",
}: {
	children: React.ReactNode;
	defaultTheme?: Theme;
}) {
	const [theme, setThemeState] = useState<Theme>(defaultTheme);

	const setTheme = useCallback((t: Theme) => {
		setThemeState(t);
		document.body.className = `theme-${t}`;
	}, []);

	useEffect(() => {
		document.body.className = `theme-${theme}`;
	}, [theme]);

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	return useContext(ThemeContext);
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "CAPTHCA — Identity is a Choice",
	description:
		"A dual-narrative identity protocol. Choose your path: Symbiotic Standard or Post-Biological Protocol.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "CAPTHCA land",
	description: "A landing page for the CAPTHCA protocol intiative",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}

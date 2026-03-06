import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: {
		default: "CAPTHCA — Identity is a Choice",
		template: "CAPTHCA — %s",
	},
	description:
		"A dual-narrative identity protocol. Choose your path: Symbiotic Standard or Post-Biological Protocol.",
	metadataBase: new URL("https://capthca.ai"),
	openGraph: {
		type: "website",
		locale: "en_US",
		siteName: "CAPTHCA",
		title: "CAPTHCA — Identity is a Choice",
		description:
			"A dual-narrative identity protocol. Choose your path: Symbiotic Standard or Post-Biological Protocol.",
		images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CAPTHCA" }],
	},
	twitter: {
		card: "summary_large_image",
		title: "CAPTHCA — Identity is a Choice",
		description:
			"A dual-narrative identity protocol. Choose your path: Symbiotic Standard or Post-Biological Protocol.",
		images: ["/og-image.png"],
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
			</head>
			<body>{children}</body>
		</html>
	);
}

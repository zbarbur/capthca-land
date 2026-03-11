import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "";

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

/**
 * GA4 inline init script — static content derived from server env var,
 * NOT user input. Safe for dangerouslySetInnerHTML.
 */
function ga4InitScript(): string {
	return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}');`;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const nonce = (await headers()).get("x-nonce") ?? "";
	return (
		<html lang="en">
			<head>
				<script
					nonce={nonce}
					src="https://challenges.cloudflare.com/turnstile/v0/api.js"
					async
					defer
				/>
				{GA4_ID && (
					<>
						<script
							nonce={nonce}
							src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
							async
						/>
						<script nonce={nonce} dangerouslySetInnerHTML={{ __html: ga4InitScript() }} />
					</>
				)}
			</head>
			<body>{children}</body>
		</html>
	);
}

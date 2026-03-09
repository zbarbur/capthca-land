"use client";

import { DiagramWrapper } from "./DiagramWrapper";
import { getTheme } from "./theme";

const PHASES = [
	{
		number: 1,
		name: "Registration",
		description: "Issuer creates credential, Agent receives Merkle tree",
	},
	{
		number: 2,
		name: "Selective Disclosure",
		description: "Agent selects attributes, Generates ZK proof",
	},
	{
		number: 3,
		name: "Verification",
		description: "Verifier checks proof, 88 bytes, 3ms",
	},
	{
		number: 4,
		name: "Revocation",
		description: "Non-interactive invalidation, Sparse Merkle Tree update",
	},
];

export function ProtocolOverview({ track }: { track: "light" | "dark" }) {
	const theme = getTheme(track);

	const cardStyle: React.CSSProperties = {
		flex: "1 1 140px",
		minWidth: 130,
		maxWidth: 300,
		background: theme.cardBg,
		border: `1px solid ${theme.border}`,
		borderRadius: track === "light" ? 12 : 2,
		padding: "24px 20px",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		textAlign: "center",
		gap: 8,
	};

	const numberStyle: React.CSSProperties = {
		fontSize: 36,
		fontWeight: 800,
		lineHeight: 1,
		color: track === "light" ? theme.secondary : theme.secondary,
		fontVariantNumeric: "tabular-nums",
	};

	const nameStyle: React.CSSProperties = {
		fontSize: 16,
		fontWeight: 700,
		color: theme.text,
		lineHeight: 1.3,
	};

	const descStyle: React.CSSProperties = {
		fontSize: 13,
		color: theme.muted,
		lineHeight: 1.5,
	};

	const arrowStyle: React.CSSProperties = {
		color: theme.accent,
		fontSize: 28,
		fontWeight: 700,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		userSelect: "none",
	};

	return (
		<DiagramWrapper>
			<div
				style={{
					width: "100%",
					display: "flex",
					flexWrap: "wrap",
					alignItems: "center",
					justifyContent: "center",
					gap: 0,
				}}
			>
				{PHASES.map((phase, i) => (
					<div
						key={phase.number}
						style={{
							display: "contents",
						}}
					>
						<div style={cardStyle}>
							<div style={numberStyle}>{phase.number}</div>
							<div style={nameStyle}>{phase.name}</div>
							<div style={descStyle}>{phase.description}</div>
						</div>
						{i < PHASES.length - 1 && (
							<div style={arrowStyle}>
								{/* horizontal arrow on md+, vertical on small */}
								<span className="hidden md:inline">&rarr;</span>
								<span className="inline md:hidden">&darr;</span>
							</div>
						)}
					</div>
				))}

				<style>{`
				/* Override display:contents children for responsive layout */
				@media (max-width: 767px) {
					/* Stack into 2x2 grid on mobile */
				}
			`}</style>
			</div>
		</DiagramWrapper>
	);
}

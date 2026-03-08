"use client";

import { getTheme } from "./theme";

const HEADERS = ["Property", "Groth16", "PLONK", "zk-STARKs"];

const ROWS = [
	["Proof Size", "88 bytes", "~400 bytes", "~50 KB"],
	["Verification Time", "3ms", "5ms", "50ms"],
	["Trusted Setup", "Per-circuit", "Universal", "None"],
	["Post-Quantum", "No", "No", "Yes"],
	["Used in CAPTHCA", "Primary \u2713", "Fallback", "Future"],
];

const GROTH16_COL = 1;

export function ProofSystemComparison({ track }: { track: "light" | "dark" }) {
	const theme = getTheme(track);
	const isDark = track === "dark";

	const wrapperStyle: React.CSSProperties = {
		overflowX: "auto",
		WebkitOverflowScrolling: "touch",
		borderRadius: isDark ? 0 : 12,
		border: `1px solid ${theme.border}`,
		background: theme.cardBg,
	};

	const tableStyle: React.CSSProperties = {
		width: "100%",
		borderCollapse: "collapse",
		fontFamily: isDark ? "'Courier New', Courier, monospace" : "inherit",
		fontSize: "0.9rem",
		minWidth: 480,
	};

	const thStyle = (colIndex: number): React.CSSProperties => {
		const isGroth16 = colIndex === GROTH16_COL;
		return {
			padding: "0.75rem 1rem",
			textAlign: colIndex === 0 ? "left" : "center",
			fontWeight: 700,
			fontSize: "0.85rem",
			textTransform: isDark ? "uppercase" : undefined,
			letterSpacing: isDark ? "0.08em" : undefined,
			color: isDark ? theme.bg : "#ffffff",
			background: isGroth16
				? isDark
					? theme.accent
					: theme.secondary
				: isDark
					? theme.subtle
					: theme.accent,
			borderBottom: `2px solid ${isDark ? theme.accent : theme.accent}`,
		};
	};

	const tdStyle = (colIndex: number, rowIndex: number, _value: string): React.CSSProperties => {
		const isGroth16 = colIndex === GROTH16_COL;
		const isUsedRow = rowIndex === ROWS.length - 1;
		const isPrimary = isGroth16 && isUsedRow;

		return {
			padding: "0.65rem 1rem",
			textAlign: colIndex === 0 ? "left" : "center",
			color:
				colIndex === 0
					? theme.text
					: isGroth16
						? isDark
							? theme.accent
							: theme.text
						: theme.muted,
			fontWeight: isGroth16 ? 600 : 400,
			background: isPrimary
				? isDark
					? "rgba(57, 255, 20, 0.1)"
					: "rgba(2, 136, 209, 0.08)"
				: isGroth16
					? isDark
						? "rgba(57, 255, 20, 0.04)"
						: "rgba(255, 215, 0, 0.06)"
					: "transparent",
			borderBottom: `1px solid ${isDark ? theme.subtle : theme.border}`,
			borderLeft:
				isGroth16 && isDark
					? `3px solid ${theme.accent}`
					: isGroth16 && !isDark
						? `3px solid ${theme.secondary}`
						: "none",
			borderRight: isGroth16 && isDark ? `1px solid ${theme.border}` : "none",
		};
	};

	const captionStyle: React.CSSProperties = {
		textAlign: "center",
		fontSize: "0.75rem",
		color: theme.muted,
		padding: "0.75rem",
		borderTop: `1px solid ${isDark ? theme.subtle : theme.border}`,
		fontStyle: "italic",
	};

	return (
		<div style={wrapperStyle}>
			<table style={tableStyle}>
				<thead>
					<tr>
						{HEADERS.map((header, i) => (
							<th key={i} style={thStyle(i)}>
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{ROWS.map((row, rowIdx) => (
						<tr key={rowIdx}>
							{row.map((cell, colIdx) => (
								<td key={colIdx} style={tdStyle(colIdx, rowIdx, cell)}>
									{cell}
								</td>
							))}
						</tr>
					))}
				</tbody>
				<tfoot>
					<tr>
						<td colSpan={4} style={captionStyle}>
							Groth16 selected as primary proof system for minimal proof size and fastest
							verification
						</td>
					</tr>
				</tfoot>
			</table>
		</div>
	);
}

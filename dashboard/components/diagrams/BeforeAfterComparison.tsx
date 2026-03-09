"use client";

import { DiagramWrapper } from "./DiagramWrapper";
import { getTheme } from "./theme";

interface Item {
	icon: string;
	label: string;
	status: string;
	note: string;
}

const BEFORE_ITEMS: Item[] = [
	{ icon: "\u{1F511}", label: "Passwords", status: "vulnerable", note: "81% of breaches" },
	{ icon: "\u{1F446}", label: "Biometrics", status: "fragile", note: "Irrevocable if compromised" },
	{ icon: "\u{1F9E9}", label: "CAPTCHAs", status: "obsolete", note: "AI solves 100%" },
	{
		icon: "\u{1FAAA}",
		label: "KYC/Identity Docs",
		status: "privacy-invasive",
		note: "Full disclosure required",
	},
];

const AFTER_ITEMS: Item[] = [
	{ icon: "\u{1F6E1}\uFE0F", label: "ZK Credentials", status: "secure", note: "88 bytes, 3ms" },
	{
		icon: "\u{1F441}\uFE0F\u200D\u{1F5E8}\uFE0F",
		label: "Selective Disclosure",
		status: "private",
		note: "Reveal only what's needed",
	},
	{
		icon: "\u{1F916}",
		label: "Agent-Native",
		status: "future-proof",
		note: "Human + machine + hybrid",
	},
	{
		icon: "\u{1F504}",
		label: "Revocable",
		status: "manageable",
		note: "Non-interactive invalidation",
	},
];

export function BeforeAfterComparison({ track }: { track: "light" | "dark" }) {
	const theme = getTheme(track);
	const isDark = track === "dark";

	const containerStyle: React.CSSProperties = {
		display: "flex",
		gap: isDark ? 0 : "1rem",
		fontFamily: isDark ? "'Courier New', Courier, monospace" : "inherit",
		flexWrap: "wrap",
	};

	const columnStyle: React.CSSProperties = {
		flex: "1 1 260px",
		minWidth: 0,
		background: theme.cardBg,
		borderRadius: isDark ? 0 : 12,
		border: isDark ? `1px solid ${theme.border}` : `1px solid ${theme.border}`,
		padding: "1rem",
	};

	const titleStyle = (side: "before" | "after"): React.CSSProperties => ({
		fontSize: "1.1rem",
		fontWeight: 700,
		marginBottom: "1rem",
		color: side === "before" ? theme.danger : theme.success,
		textTransform: isDark ? "uppercase" : undefined,
		letterSpacing: isDark ? "0.1em" : undefined,
		borderBottom: `2px solid ${side === "before" ? theme.danger : theme.success}`,
		paddingBottom: "0.5rem",
	});

	const dividerStyle: React.CSSProperties = {
		width: isDark ? 1 : 2,
		alignSelf: "stretch",
		background: isDark
			? `linear-gradient(to bottom, transparent, ${theme.muted}, transparent)`
			: `linear-gradient(to bottom, transparent, ${theme.subtle}, transparent)`,
		flexShrink: 0,
		display: "block",
	};

	const renderItem = (item: Item, side: "before" | "after", index: number) => {
		const isBefore = side === "before";
		const statusColor = isBefore ? theme.danger : theme.success;
		const mark = isBefore ? "\u2717" : "\u2713";

		const rowStyle: React.CSSProperties = {
			display: "flex",
			alignItems: "center",
			gap: "0.75rem",
			padding: "0.6rem 0.5rem",
			borderBottom: `1px solid ${isDark ? theme.subtle : theme.border}`,
			opacity: isBefore ? 0.7 : 1,
			textDecoration: isBefore ? "line-through" : "none",
			textDecorationColor: isBefore ? theme.muted : undefined,
		};

		const markStyle: React.CSSProperties = {
			color: statusColor,
			fontWeight: 900,
			fontSize: "1.1rem",
			minWidth: "1.2rem",
			textAlign: "center",
			textShadow: isDark ? `0 0 6px ${statusColor}` : undefined,
		};

		const labelStyle: React.CSSProperties = {
			color: isBefore ? theme.muted : theme.text,
			fontWeight: isBefore ? 400 : 600,
			flex: 1,
		};

		const noteStyle: React.CSSProperties = {
			fontSize: "0.75rem",
			color: isBefore ? theme.muted : theme.accent,
			whiteSpace: "normal",
			textAlign: "right",
			minWidth: 60,
		};

		const iconStyle: React.CSSProperties = {
			fontSize: "1.2rem",
			filter: isBefore ? "grayscale(0.6)" : "none",
		};

		return (
			<div key={index} style={rowStyle}>
				<span style={markStyle}>{mark}</span>
				<span style={iconStyle}>{item.icon}</span>
				<span style={labelStyle}>{item.label}</span>
				<span style={noteStyle}>{item.note}</span>
			</div>
		);
	};

	return (
		<DiagramWrapper>
			<div style={containerStyle}>
				<div style={columnStyle}>
					<div style={titleStyle("before")}>Legacy Identity</div>
					{BEFORE_ITEMS.map((item, i) => renderItem(item, "before", i))}
				</div>
				<div style={dividerStyle} />
				<div style={columnStyle}>
					<div style={titleStyle("after")}>CAPTHCA</div>
					{AFTER_ITEMS.map((item, i) => renderItem(item, "after", i))}
				</div>
			</div>
		</DiagramWrapper>
	);
}

"use client";

import { DiagramWrapper } from "./DiagramWrapper";
import { getTheme } from "./theme";

interface TreeNode {
	label: string;
	revealed?: boolean;
	onPath?: boolean;
	children?: TreeNode[];
}

const TREE: TreeNode = {
	label: "Root Hash",
	onPath: true,
	children: [
		{
			label: "H(L)",
			onPath: true,
			children: [
				{
					label: "Identity",
					children: [
						{ label: "name", revealed: false },
						{ label: "org", revealed: false },
					],
				},
				{
					label: "Capabilities",
					onPath: true,
					children: [
						{ label: "role", revealed: true, onPath: true },
						{ label: "clearance", revealed: false },
					],
				},
			],
		},
		{
			label: "H(R)",
			children: [{ label: "Metadata" }, { label: "[empty]" }],
		},
	],
};

function NodeCard({
	node,
	theme,
	isDark,
}: {
	node: TreeNode;
	theme: ReturnType<typeof getTheme>;
	isDark: boolean;
}) {
	const isRevealed = node.revealed === true;
	const isHidden = node.revealed === false;
	const isOnPath = node.onPath === true;

	const bg = isRevealed
		? isDark
			? "rgba(57, 255, 20, 0.15)"
			: "rgba(2, 136, 209, 0.1)"
		: isHidden
			? isDark
				? "rgba(40, 40, 40, 0.8)"
				: "rgba(207, 216, 220, 0.5)"
			: theme.cardBg;

	const borderColor = isRevealed
		? theme.accent
		: isOnPath
			? theme.accent
			: isHidden
				? theme.subtle
				: theme.border;

	const textColor = isHidden ? theme.muted : isRevealed ? theme.accent : theme.text;

	const style: React.CSSProperties = {
		display: "inline-block",
		padding: "0.4rem 0.75rem",
		borderRadius: isDark ? 2 : 8,
		border: `${isOnPath || isRevealed ? 2 : 1}px solid ${borderColor}`,
		background: bg,
		color: textColor,
		fontSize: "0.8rem",
		fontFamily: isDark ? "'Courier New', Courier, monospace" : "inherit",
		fontWeight: isRevealed || isOnPath ? 700 : 400,
		whiteSpace: "nowrap",
		boxShadow: isRevealed
			? isDark
				? `0 0 12px ${theme.accent}, 0 0 4px ${theme.accent}`
				: `0 2px 8px rgba(2, 136, 209, 0.3)`
			: isOnPath
				? isDark
					? `0 0 8px rgba(57, 255, 20, 0.3)`
					: `0 1px 4px rgba(2, 136, 209, 0.15)`
				: isDark
					? "none"
					: "0 1px 3px rgba(0,0,0,0.08)",
		textDecoration: isHidden ? "none" : undefined,
		opacity: isHidden ? 0.6 : 1,
	};

	const tagStyle: React.CSSProperties = {
		fontSize: "0.75rem",
		marginLeft: "0.4rem",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		color: isRevealed ? theme.success : theme.muted,
	};

	return (
		<span style={style}>
			{node.label}
			{isRevealed && <span style={tagStyle}>REVEALED</span>}
			{isHidden && <span style={tagStyle}>hidden</span>}
		</span>
	);
}

function TreeBranch({
	node,
	theme,
	isDark,
}: {
	node: TreeNode;
	theme: ReturnType<typeof getTheme>;
	isDark: boolean;
}) {
	const hasChildren = node.children && node.children.length > 0;
	const isOnPath = node.onPath === true;

	const branchStyle: React.CSSProperties = {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		position: "relative",
	};

	const connectorDownStyle: React.CSSProperties = {
		width: isOnPath ? 2 : 1,
		height: 24,
		background: isOnPath ? theme.accent : isDark ? theme.subtle : theme.border,
		margin: "0 auto",
		boxShadow: isOnPath && isDark ? `0 0 4px ${theme.accent}` : undefined,
	};

	const childrenWrapperStyle: React.CSSProperties = {
		display: "flex",
		justifyContent: "center",
		gap: "0.5rem",
		position: "relative",
		paddingTop: 0,
	};

	const horizontalLineStyle: React.CSSProperties = {
		position: "absolute",
		top: 0,
		left: "25%",
		right: "25%",
		height: isOnPath ? 2 : 1,
		background: isDark ? theme.subtle : theme.border,
	};

	return (
		<div style={branchStyle}>
			<NodeCard node={node} theme={theme} isDark={isDark} />
			{hasChildren && (
				<>
					<div style={connectorDownStyle} />
					<div style={{ position: "relative" }}>
						{node.children!.length > 1 && <div style={horizontalLineStyle} />}
						<div style={childrenWrapperStyle}>
							{node.children!.map((child, i) => {
								const childConnectorStyle: React.CSSProperties = {
									width: child.onPath ? 2 : 1,
									height: 16,
									background: child.onPath ? theme.accent : isDark ? theme.subtle : theme.border,
									margin: "0 auto",
									boxShadow: child.onPath && isDark ? `0 0 4px ${theme.accent}` : undefined,
								};

								return (
									<div
										key={i}
										style={{
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
										}}
									>
										<div style={childConnectorStyle} />
										<TreeBranch node={child} theme={theme} isDark={isDark} />
									</div>
								);
							})}
						</div>
					</div>
				</>
			)}
		</div>
	);
}

export function SparseMerkleTree({ track }: { track: "light" | "dark" }) {
	const theme = getTheme(track);
	const isDark = track === "dark";

	const containerStyle: React.CSSProperties = {
		padding: "1.5rem",
		background: theme.cardBg,
		borderRadius: isDark ? 0 : 12,
		border: `1px solid ${theme.border}`,
		fontFamily: isDark ? "'Courier New', Courier, monospace" : "inherit",
	};

	const titleStyle: React.CSSProperties = {
		textAlign: "center",
		fontSize: "0.85rem",
		color: theme.muted,
		marginBottom: "1.5rem",
		textTransform: isDark ? "uppercase" : undefined,
		letterSpacing: isDark ? "0.15em" : undefined,
	};

	const legendStyle: React.CSSProperties = {
		display: "flex",
		justifyContent: "center",
		gap: "1.5rem",
		marginTop: "1.5rem",
		fontSize: "0.75rem",
		color: theme.muted,
		flexWrap: "wrap",
	};

	const dotStyle = (color: string, glow?: boolean): React.CSSProperties => ({
		display: "inline-block",
		width: 10,
		height: 10,
		borderRadius: "50%",
		background: color,
		marginRight: "0.4rem",
		verticalAlign: "middle",
		boxShadow: glow && isDark ? `0 0 6px ${color}` : undefined,
	});

	return (
		<DiagramWrapper>
			<div style={containerStyle}>
				<div style={titleStyle}>Sparse Merkle Tree — Selective Disclosure</div>
				<div>
					<div style={{ minWidth: 500 }}>
						<TreeBranch node={TREE} theme={theme} isDark={isDark} />
					</div>
				</div>
				<div style={legendStyle}>
					<span>
						<span style={dotStyle(theme.accent, true)} />
						Revealed / Proof Path
					</span>
					<span>
						<span style={dotStyle(theme.muted)} />
						Hidden
					</span>
					<span>
						<span style={dotStyle(isDark ? theme.subtle : theme.border)} />
						Intermediate
					</span>
				</div>
			</div>
		</DiagramWrapper>
	);
}

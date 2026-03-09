import { headers } from "next/headers";
import Link from "next/link";
import { type AdminUser, parseAdminUsers, parseIapEmail } from "@/lib/admin-auth";

function getAdminUserFromHeaders(email: string | null): AdminUser | null {
	const parsed = parseIapEmail(email);
	if (!parsed) return null;
	const adminUsers = parseAdminUsers(process.env.CAPTHCA_LAND_ADMIN_USERS);
	const role = adminUsers[parsed];
	if (!role) return null;
	return { email: parsed, role };
}

const NAV_ITEMS = [
	{ href: "/dashboard", label: "Dashboard", icon: "📊" },
	{ href: "/subscribers", label: "Subscribers", icon: "👥" },
	{ href: "/logs", label: "Logs", icon: "📋" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	const hdrs = await headers();
	const isAdmin = hdrs.get("x-admin-context") === "true";

	if (!isAdmin) {
		return (
			<div className="min-h-screen bg-zinc-950 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
					<p className="text-zinc-400">This page is only accessible via the admin subdomain.</p>
				</div>
			</div>
		);
	}

	const adminEmail = hdrs.get("x-admin-email");
	const adminUser = getAdminUserFromHeaders(adminEmail);

	if (!adminUser) {
		return (
			<div className="min-h-screen bg-zinc-950 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
					<p className="text-zinc-400">You are not authorized to access the admin panel.</p>
					{adminEmail && (
						<p className="text-zinc-500 text-sm mt-2">Signed in as: {parseIapEmail(adminEmail)}</p>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
			{/* Sidebar */}
			<aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 max-md:hidden">
				<div className="p-4 border-b border-zinc-800">
					<h1 className="text-lg font-bold tracking-wider text-zinc-100">CAPTHCA Admin</h1>
					<p className="text-xs text-zinc-500 mt-1 truncate">{adminUser.email}</p>
					<span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
						{adminUser.role}
					</span>
				</div>
				<nav className="flex-1 p-2">
					{NAV_ITEMS.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
						>
							<span>{item.icon}</span>
							{item.label}
						</Link>
					))}
				</nav>
			</aside>

			{/* Mobile nav */}
			<div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50 flex">
				{NAV_ITEMS.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className="flex-1 flex flex-col items-center gap-1 py-3 text-xs text-zinc-400 hover:text-zinc-100"
					>
						<span>{item.icon}</span>
						{item.label}
					</Link>
				))}
			</div>

			{/* Main content */}
			<main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto">
				<div className="max-w-6xl mx-auto" data-admin-role={adminUser.role}>
					{children}
				</div>
			</main>
		</div>
	);
}

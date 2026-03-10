import { headers } from "next/headers";
import { parseAdminUsers, parseIapEmail } from "@/lib/admin-auth";
import type { DocSnapshot } from "@/lib/firestore";
import { db, maskIp } from "@/lib/firestore";
import { SubscriberActions } from "./SubscriberActions";

const PAGE_SIZE = 25;

interface SubscriberRow {
	id: string;
	email: string;
	track: string;
	subscribedAt: string;
	ip: string;
	userAgent: string;
}

function formatDate(iso: string): string {
	try {
		return new Date(iso).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return iso;
	}
}

function truncate(str: string, max: number): string {
	if (str.length <= max) return str;
	return `${str.slice(0, max)}…`;
}

export default async function SubscribersPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string; track?: string; page?: string }>;
}) {
	const params = await searchParams;
	const query = params.q || "";
	const trackFilter = params.track || "";
	const page = Math.max(1, Number.parseInt(params.page || "1", 10));

	// Determine admin role for showing delete actions
	const hdrs = await headers();
	const adminEmail = hdrs.get("x-admin-email");
	const parsed = parseIapEmail(adminEmail);
	const adminUsers = parsed ? parseAdminUsers(process.env.CAPTHCA_LAND_ADMIN_USERS) : {};
	const role = parsed ? adminUsers[parsed] : undefined;
	const isWriter = role === "write";

	// Query subscribers — get all and filter (Firestore doesn't support LIKE queries)
	let ref = db.collection("subscribers").orderBy("subscribedAt", "desc");

	if (trackFilter && (trackFilter === "light" || trackFilter === "dark")) {
		ref = db
			.collection("subscribers")
			.where("track", "==", trackFilter)
			.orderBy("subscribedAt", "desc");
	}

	const snapshot = await ref.get();
	let allDocs: SubscriberRow[] = snapshot.docs.map((doc: DocSnapshot) => {
		const data = doc.data();
		return {
			id: doc.id,
			email: (data.email as string) || "",
			track: (data.track as string) || "",
			subscribedAt: (data.subscribedAt as string) || "",
			ip: maskIp((data.ip as string) || ""),
			userAgent: (data.userAgent as string) || "",
		};
	});

	// Client-side email search (Firestore has no substring search)
	if (query) {
		const lowerQ = query.toLowerCase();
		allDocs = allDocs.filter((d) => d.email.toLowerCase().includes(lowerQ));
	}

	const totalCount = allDocs.length;
	const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);
	const start = (currentPage - 1) * PAGE_SIZE;
	const pageDocs = allDocs.slice(start, start + PAGE_SIZE);

	return (
		<div>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
				<h2 className="text-2xl font-bold">Subscribers</h2>
				<p className="text-zinc-500 text-sm">{totalCount} total</p>
			</div>

			{/* Search and filter */}
			<form method="GET" className="flex flex-col md:flex-row gap-3 mb-6">
				<input
					type="text"
					name="q"
					defaultValue={query}
					placeholder="Search by email…"
					className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
				/>
				<select
					name="track"
					defaultValue={trackFilter}
					className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
				>
					<option value="">All Tracks</option>
					<option value="light">Light</option>
					<option value="dark">Dark</option>
				</select>
				<button
					type="submit"
					className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 rounded-md text-sm transition-colors"
				>
					Filter
				</button>
			</form>

			{/* Bulk actions (write only) */}
			{isWriter && <SubscriberActions />}

			{/* Table */}
			<div className="overflow-x-auto border border-zinc-800 rounded-lg">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-zinc-800 bg-zinc-900">
							<th className="text-left px-4 py-3 text-zinc-400 font-medium">Email</th>
							<th className="text-left px-4 py-3 text-zinc-400 font-medium">Track</th>
							<th className="text-left px-4 py-3 text-zinc-400 font-medium">Signed Up</th>
							<th className="text-left px-4 py-3 text-zinc-400 font-medium">IP</th>
							<th className="text-left px-4 py-3 text-zinc-400 font-medium">User Agent</th>
							{isWriter && (
								<th className="text-left px-4 py-3 text-zinc-400 font-medium">Actions</th>
							)}
						</tr>
					</thead>
					<tbody>
						{pageDocs.length === 0 ? (
							<tr>
								<td colSpan={isWriter ? 6 : 5} className="text-center py-8 text-zinc-500">
									No subscribers found
								</td>
							</tr>
						) : (
							pageDocs.map((sub) => (
								<tr
									key={sub.id}
									className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors"
								>
									<td className="px-4 py-3 text-zinc-200 font-mono text-xs">{sub.email}</td>
									<td className="px-4 py-3">
										<span
											className={`inline-block px-2 py-0.5 rounded text-xs ${
												sub.track === "light"
													? "bg-sky-900/40 text-sky-300"
													: "bg-emerald-900/40 text-emerald-300"
											}`}
										>
											{sub.track}
										</span>
									</td>
									<td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
										{formatDate(sub.subscribedAt)}
									</td>
									<td className="px-4 py-3 text-zinc-500 font-mono text-xs">{sub.ip}</td>
									<td className="px-4 py-3 text-zinc-500 text-xs max-w-[200px]">
										{truncate(sub.userAgent, 50)}
									</td>
									{isWriter && (
										<td className="px-4 py-3">
											<SubscriberActions subscriberId={sub.id} subscriberEmail={sub.email} />
										</td>
									)}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2 mt-6">
					{currentPage > 1 && (
						<a
							href={`/subscribers?q=${encodeURIComponent(query)}&track=${encodeURIComponent(trackFilter)}&page=${currentPage - 1}`}
							className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-sm transition-colors"
						>
							Previous
						</a>
					)}
					<span className="text-sm text-zinc-500">
						Page {currentPage} of {totalPages}
					</span>
					{currentPage < totalPages && (
						<a
							href={`/subscribers?q=${encodeURIComponent(query)}&track=${encodeURIComponent(trackFilter)}&page=${currentPage + 1}`}
							className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-sm transition-colors"
						>
							Next
						</a>
					)}
				</div>
			)}
		</div>
	);
}

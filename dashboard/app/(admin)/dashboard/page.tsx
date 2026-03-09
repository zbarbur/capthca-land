import type { DocSnapshot } from "@/lib/firestore";
import { db } from "@/lib/firestore";
import { TrackDistributionChart } from "./TrackDistributionChart";

interface SubscriberData {
	email: string;
	track: string;
	subscribedAt: string;
}

function getDateDaysAgo(days: number): string {
	const d = new Date();
	d.setDate(d.getDate() - days);
	return d.toISOString();
}

export default async function AdminDashboardPage() {
	const snapshot = await db.collection("subscribers").get();
	const subscribers: SubscriberData[] = snapshot.docs.map((doc: DocSnapshot) => {
		const data = doc.data();
		return {
			email: data.email as string,
			track: data.track as string,
			subscribedAt: data.subscribedAt as string,
		};
	});

	const total = subscribers.length;
	const lightCount = subscribers.filter((s) => s.track === "light").length;
	const darkCount = subscribers.filter((s) => s.track === "dark").length;

	const sevenDaysAgo = getDateDaysAgo(7);
	const thirtyDaysAgo = getDateDaysAgo(30);

	const last7Days = subscribers.filter((s) => s.subscribedAt >= sevenDaysAgo).length;
	const last30Days = subscribers.filter((s) => s.subscribedAt >= thirtyDaysAgo).length;

	const stats = [
		{ label: "Total Subscribers", value: total, color: "text-zinc-100" },
		{ label: "Light Track", value: lightCount, color: "text-sky-400" },
		{ label: "Dark Track", value: darkCount, color: "text-emerald-400" },
		{ label: "Last 7 Days", value: last7Days, color: "text-amber-400" },
		{ label: "Last 30 Days", value: last30Days, color: "text-purple-400" },
	];

	const chartData = [
		{ name: "Light", value: lightCount },
		{ name: "Dark", value: darkCount },
	];

	return (
		<div>
			<h2 className="text-2xl font-bold mb-6">Dashboard</h2>

			{/* Stat cards */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
				{stats.map((stat) => (
					<div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
						<p className="text-xs text-zinc-500 uppercase tracking-wide">{stat.label}</p>
						<p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
					</div>
				))}
			</div>

			{/* Track distribution chart */}
			<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
				<h3 className="text-lg font-semibold mb-4">Track Distribution</h3>
				{total > 0 ? (
					<TrackDistributionChart data={chartData} />
				) : (
					<p className="text-zinc-500 text-center py-8">No subscribers yet</p>
				)}
			</div>
		</div>
	);
}

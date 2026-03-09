"use client";

import { useCallback, useState } from "react";

interface SubscriberActionsProps {
	subscriberId?: string;
	subscriberEmail?: string;
}

export function SubscriberActions({ subscriberId, subscriberEmail }: SubscriberActionsProps) {
	const [loading, setLoading] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const handleDelete = useCallback(async () => {
		if (!subscriberId) return;
		setLoading(true);
		try {
			const res = await fetch("/api/admin/subscribers", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: subscriberId }),
			});
			if (res.ok) {
				window.location.reload();
			} else {
				const data = await res.json();
				alert(data.error || "Failed to delete subscriber");
			}
		} catch {
			alert("Network error");
		} finally {
			setLoading(false);
			setConfirmDelete(false);
		}
	}, [subscriberId]);

	const handleBulkRemoveTest = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/admin/subscribers", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ pattern: "test" }),
			});
			if (res.ok) {
				const data = await res.json();
				alert(`Removed ${data.deleted} test record(s)`);
				window.location.reload();
			} else {
				const data = await res.json();
				alert(data.error || "Failed to remove test records");
			}
		} catch {
			alert("Network error");
		} finally {
			setLoading(false);
		}
	}, []);

	// Bulk action button (no subscriberId means this is the bulk actions row)
	if (!subscriberId) {
		return (
			<div className="mb-4">
				<button
					type="button"
					onClick={handleBulkRemoveTest}
					disabled={loading}
					className="bg-red-900/40 hover:bg-red-900/60 text-red-300 px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
				>
					{loading ? "Removing…" : "Remove Test Records"}
				</button>
			</div>
		);
	}

	// Individual delete button
	if (confirmDelete) {
		return (
			<div className="flex gap-1">
				<button
					type="button"
					onClick={handleDelete}
					disabled={loading}
					className="bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
				>
					{loading ? "…" : "Confirm"}
				</button>
				<button
					type="button"
					onClick={() => setConfirmDelete(false)}
					className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-2 py-1 rounded text-xs transition-colors"
				>
					Cancel
				</button>
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={() => setConfirmDelete(true)}
			className="text-red-400 hover:text-red-300 text-xs transition-colors"
			title={`Delete ${subscriberEmail}`}
		>
			Delete
		</button>
	);
}

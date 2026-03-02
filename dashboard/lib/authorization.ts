/**
 * Centralized Authorization — RBAC Pattern Example
 *
 * Single source of truth for role-based access control.
 * All API routes and UI components should import from here
 * instead of doing inline role checks.
 *
 * Customize roles and capabilities to match your domain.
 */

export type AppRole = "admin" | "editor" | "viewer";

// ── Capability checks (pure functions) ──────────────────────────────

/** Can this role read all resources? */
export function canReadAll(role: string): boolean {
	return role === "admin" || role === "editor" || role === "viewer";
}

/** Can this role create/update resources? */
export function canWrite(role: string): boolean {
	return role === "admin" || role === "editor";
}

/** Can this role delete resources or manage users? */
export function canAdmin(role: string): boolean {
	return role === "admin";
}

// ── Request helpers ──────────────────────────────────────────────────

export interface RequestAuth {
	role: string;
	userId: string;
	tenantId: string | null;
	authMethod: "session" | "api_token" | "none";
}

/** Extract auth info from middleware-injected headers */
export function getRequestAuth(request: Request): RequestAuth {
	return {
		role: request.headers.get("x-user-role") ?? "",
		userId: request.headers.get("x-user-id") ?? "",
		tenantId: request.headers.get("x-tenant-id"),
		authMethod: request.headers.get("x-user-role") ? "session" : "none",
	};
}

/** Assert a capability. Returns 403 Response if denied, null if allowed. */
export function denyIfNot(request: Request, check: (role: string) => boolean): Response | null {
	const auth = getRequestAuth(request);
	if (!check(auth.role)) {
		return new Response(JSON.stringify({ error: "Forbidden" }), {
			status: 403,
			headers: { "Content-Type": "application/json" },
		});
	}
	return null;
}

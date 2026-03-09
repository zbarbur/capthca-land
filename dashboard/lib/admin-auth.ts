export type AdminRole = "read" | "write";

export interface AdminUser {
	email: string;
	role: AdminRole;
}

/**
 * Parse the CAPTHCA_LAND_ADMIN_USERS env var JSON string into a map.
 * Returns an empty map on invalid/empty input.
 */
export function parseAdminUsers(jsonStr: string | undefined): Record<string, AdminRole> {
	if (!jsonStr) return {};
	try {
		const parsed = JSON.parse(jsonStr);
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
			return {};
		}
		const result: Record<string, AdminRole> = {};
		for (const [email, role] of Object.entries(parsed)) {
			if (role === "read" || role === "write") {
				result[email] = role;
			}
		}
		return result;
	} catch {
		return {};
	}
}

/**
 * Extract the admin email from the IAP header.
 * IAP sends: "accounts.google.com:user@example.com"
 */
export function parseIapEmail(headerValue: string | null): string | null {
	if (!headerValue) return null;
	const prefix = "accounts.google.com:";
	if (headerValue.startsWith(prefix)) {
		return headerValue.slice(prefix.length);
	}
	// If no prefix, treat the whole value as the email
	return headerValue;
}

/**
 * Extract the admin email from the Cloudflare Access header.
 * CF Access sends a plain email: "user@example.com"
 */
export function parseCfAccessEmail(headerValue: string | null): string | null {
	if (!headerValue || headerValue.trim() === "") return null;
	return headerValue.trim();
}

/**
 * Resolve the admin user from a request.
 * Checks IAP header first, then Cloudflare Access header.
 */
export function getAdminUser(request: Request): AdminUser | null {
	const iapHeader = request.headers.get("x-goog-authenticated-user-email");
	const cfHeader = request.headers.get("Cf-Access-Authenticated-User-Email");
	const email = parseIapEmail(iapHeader) ?? parseCfAccessEmail(cfHeader);
	if (!email) return null;

	const adminUsers = parseAdminUsers(process.env.CAPTHCA_LAND_ADMIN_USERS);
	const role = adminUsers[email];
	if (!role) return null;

	return { email, role };
}

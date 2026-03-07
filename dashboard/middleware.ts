import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const STAGING_USER = process.env.CAPTHCA_LAND_STAGING_AUTH_USER || "capthca";
const STAGING_AUTH_PASS = process.env.CAPTHCA_LAND_STAGING_AUTH_PASS || "";

function isBasicAuthValid(header: string | null): boolean {
	if (!header?.startsWith("Basic ")) return false;
	const bytes = Uint8Array.from(globalThis.atob(header.slice(6)), (c) => c.charCodeAt(0));
	const decoded = new TextDecoder().decode(bytes);
	const colon = decoded.indexOf(":");
	if (colon === -1) return false;
	const user = decoded.slice(0, colon);
	const pass = decoded.slice(colon + 1);
	return user === STAGING_USER && pass === STAGING_AUTH_PASS;
}

function logApiRequest(request: NextRequest): void {
	const { method, pathname } = { method: request.method, pathname: request.nextUrl.pathname };
	if (!pathname.startsWith("/api/")) return;

	const ip =
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.ip || "unknown";
	const userAgent = request.headers.get("user-agent") || "unknown";

	console.log(
		JSON.stringify({
			severity: "INFO",
			type: "request",
			method,
			path: pathname,
			ip,
			userAgent,
			timestamp: new Date().toISOString(),
		}),
	);
}

export function middleware(request: NextRequest) {
	// Only gate staging — skip if no password is configured
	if (!STAGING_AUTH_PASS) {
		logApiRequest(request);
		return NextResponse.next();
	}

	if (isBasicAuthValid(request.headers.get("authorization"))) {
		logApiRequest(request);
		return NextResponse.next();
	}

	return new NextResponse("Authentication required", {
		status: 401,
		headers: { "WWW-Authenticate": 'Basic realm="Staging"' },
	});
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const STAGING_USER = process.env.CAPTHCA_LAND_STAGING_AUTH_USER || "capthca";
const STAGING_AUTH_PASS = process.env.CAPTHCA_LAND_STAGING_AUTH_PASS || "";

function isAdminPath(pathname: string): boolean {
	return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

function isLocalDev(host: string | null): boolean {
	if (!host) return false;
	return host.split(":")[0] === "localhost";
}

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

function buildCspHeader(nonce: string): string {
	return [
		"default-src 'self'",
		`script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://challenges.cloudflare.com https://*.googletagmanager.com https://*.google-analytics.com`,
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"font-src 'self' https://fonts.gstatic.com",
		"img-src 'self' data: blob:",
		"connect-src 'self' https://challenges.cloudflare.com https://*.google-analytics.com https://*.googletagmanager.com",
		"frame-src https://challenges.cloudflare.com",
		"frame-ancestors 'none'",
	].join("; ");
}

function applySecurityHeaders(response: NextResponse, nonce: string): void {
	response.headers.set("Content-Security-Policy", buildCspHeader(nonce));
	response.headers.set("x-nonce", nonce);
	response.headers.set("X-Frame-Options", "DENY");
	response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

export function middleware(request: NextRequest) {
	const nonce = crypto.randomUUID();
	const host = request.headers.get("host");

	// Admin routes — Cloudflare Access, localhost dev, or 404
	if (isAdminPath(request.nextUrl.pathname)) {
		const cfEmail = request.headers.get("Cf-Access-Authenticated-User-Email");

		if (cfEmail) {
			// Cloudflare Access authenticated request
			logApiRequest(request);
			const requestHeaders = new Headers(request.headers);
			requestHeaders.set("x-nonce", nonce);
			requestHeaders.set("x-admin-context", "true");
			requestHeaders.set("x-admin-email", cfEmail);

			const response = NextResponse.next({
				request: { headers: requestHeaders },
			});
			applySecurityHeaders(response, nonce);
			return response;
		}

		if (isLocalDev(host)) {
			// Local dev fallback — simulated admin identity
			logApiRequest(request);
			const requestHeaders = new Headers(request.headers);
			requestHeaders.set("x-nonce", nonce);
			requestHeaders.set("x-admin-context", "true");
			requestHeaders.set("x-admin-email", "accounts.google.com:dev@capthca.ai");

			const response = NextResponse.next({
				request: { headers: requestHeaders },
			});
			applySecurityHeaders(response, nonce);
			return response;
		}

		return new NextResponse("Not Found", { status: 404 });
	}

	// Only gate staging — skip if no password is configured
	if (!STAGING_AUTH_PASS) {
		logApiRequest(request);
		const requestHeaders = new Headers(request.headers);
		requestHeaders.set("x-nonce", nonce);
		const response = NextResponse.next({
			request: { headers: requestHeaders },
		});
		applySecurityHeaders(response, nonce);
		return response;
	}

	if (isBasicAuthValid(request.headers.get("authorization"))) {
		logApiRequest(request);
		const requestHeaders = new Headers(request.headers);
		requestHeaders.set("x-nonce", nonce);
		const response = NextResponse.next({
			request: { headers: requestHeaders },
		});
		applySecurityHeaders(response, nonce);
		return response;
	}

	return new NextResponse("Authentication required", {
		status: 401,
		headers: { "WWW-Authenticate": 'Basic realm="Staging"' },
	});
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|tracks/|assets/).*)"],
};

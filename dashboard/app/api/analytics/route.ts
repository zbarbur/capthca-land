import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return new NextResponse(null, { status: 400 });
	}

	if (
		typeof body !== "object" ||
		body === null ||
		typeof (body as Record<string, unknown>).event !== "string"
	) {
		return new NextResponse(null, { status: 400 });
	}

	const { event, properties, timestamp } = body as Record<string, unknown>;

	const entry = {
		severity: "INFO",
		type: "analytics",
		event,
		properties: properties ?? {},
		timestamp: timestamp ?? new Date().toISOString(),
	};

	console.log(JSON.stringify(entry));

	return new NextResponse(null, { status: 204 });
}

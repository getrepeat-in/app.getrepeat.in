import { NextResponse } from "next/server";
import { withErrorHandler, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (request) => {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
        throw new BadRequestError("URL is required");
    }

    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    
    return new NextResponse(buffer, {
        headers: {
            "Content-Type": response.headers.get("content-type") || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable"
        }
    });
});

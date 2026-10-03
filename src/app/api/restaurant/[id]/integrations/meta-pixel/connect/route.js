import dbConnect from "@/lib/db";
import { backendIntegrationService } from "@/services/backend/integration";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const POST = withErrorHandler(async (req, { params }) => {
    const { id } = await params;
    await dbConnect();
    
    const body = await req.json();
    const { pixelId } = body;

    if (!pixelId) throw new BadRequestError("Pixel ID is required");

    await backendIntegrationService.connectMetaPixel(id, pixelId);
    return successResponse(null, "Meta Pixel connected successfully");
});

import dbConnect from "@/lib/db";
import { backendIntegrationService } from "@/services/backend/integration";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const DELETE = withErrorHandler(async (req, { params }) => {
    const { id } = await params;
    await dbConnect();

    await backendIntegrationService.disconnectMetaPixel(id);
    return successResponse(null, "Meta Pixel disconnected successfully");
});

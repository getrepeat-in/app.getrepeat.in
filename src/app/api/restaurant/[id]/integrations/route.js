import dbConnect from "@/lib/db";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";
import { backendIntegrationService } from "@/services/backend/integration";

export const GET = withErrorHandler(async (req, { params }) => {
    const { id } = await params;
    await dbConnect();
    
    const data = await backendIntegrationService.getIntegrations(id);

    return successResponse(data, "Integrations fetched successfully");
});

export const PATCH = withErrorHandler(async (req, { params }) => {
    const { id } = await params;
    await dbConnect();
    
    const body = await req.json();
    const { platform, isActive } = body;

    if (!["razorpay", "instagram"].includes(platform)) {
        return successResponse(null, "Invalid platform", 400);
    }

    await backendIntegrationService.updateIntegration(id, platform, isActive);

    return successResponse(null, `${platform} integration updated successfully`);
});

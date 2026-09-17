import { getAuthUser } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse, UnauthorizedError } from "@/lib/api/response-handler";
import { AuthService } from "@/services/backend/auth.service";
import { deleteCache } from "@/services/backend/redis/cache.service";

export const PUT = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    
    const authUser = getAuthUser(req);
    if (!authUser) {
        throw new UnauthorizedError("Not authenticated");
    }
    
    const body = await req.json();
    const updatedUser = await AuthService.updateProfile(slug, authUser.token, body);
    await deleteCache(`user:profile:${authUser.userId}`);
    return successResponse(updatedUser, "Profile updated successfully", 200);
});

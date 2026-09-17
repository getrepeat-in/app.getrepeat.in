import { getAuthUser } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse, UnauthorizedError } from "@/lib/api/response-handler";
import { AuthService } from "@/services/backend/auth.service";
import { getCache, setCache } from "@/services/backend/redis/cache.service";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    
    const authUser = getAuthUser(req);
    if (!authUser) {
        throw new UnauthorizedError("Not authenticated");
    }

    const cacheKey = `user:profile:${authUser.userId}`;
    const cachedUser = await getCache(cacheKey);
    if (cachedUser) {
        return successResponse(cachedUser, "User fetched successfully (cached)", 200);
    }

    const user = await AuthService.me(slug, authUser.token);
    await setCache(cacheKey, user, 900);
    return successResponse(user, "User fetched successfully", 200);
});

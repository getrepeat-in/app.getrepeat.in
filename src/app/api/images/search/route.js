import axios from "axios";
import { getImageSearchCacheKey } from "@/lib/api/helpers/cacheKeys";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (request) => {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    if (!query) {
        throw new BadRequestError("Search query is required");
    }

    const cacheKey = getImageSearchCacheKey(query, page, limit);
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
        return successResponse(cachedData, "Images fetched successfully (cached)");
    }

    const foodsnapApiUrl = process.env.NEXT_PUBLIC_FOODSNAP_API_URL;

    const response = await axios.get(foodsnapApiUrl, {
        params: {
            q: query,
            page,
            limit
        },
        headers: {
            "Accept": "application/json"
        }
    });

    await setCache(cacheKey, response.data, 86400);
    return successResponse(response.data, "Images fetched successfully");
});

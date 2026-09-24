import axios from "axios";
import { getImageSearchCacheKey } from "@/lib/api/helpers/cacheKeys";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (request) => {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "12";

    if (!query) {
        throw new BadRequestError("Search query is required");
    }

    const cacheKey = getImageSearchCacheKey(query, page, limit);
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
        return successResponse(
            cachedData.data || cachedData, 
            "Images fetched successfully (cached)", 
            200, 
            { hasMore: cachedData.hasMore ?? false }
        );
    }

    const foodsnapApiUrl = process.env.NEXT_PUBLIC_FOODSNAP_API_URL;

    const formattedQuery = query.toLowerCase().trim();
    const response = await axios.get(foodsnapApiUrl, {
        params: {
            page,
            limit,
            search: formattedQuery,
        }
    });

    let responseData = response.data;
    if (responseData && responseData.isEncrypted && responseData.payload) {
        const webcrypto = globalThis.crypto || require('crypto').webcrypto;
        
        const getCryptoKey = async () => {
            const secret = process.env.NEXT_PUBLIC_PAYLOAD_CIPHER_KEY;
            
            if (!secret) {
                throw new Error("Missing NEXT_PUBLIC_PAYLOAD_CIPHER_KEY in environment variables");
            }
            const enc = new TextEncoder();
            const keyMaterial = await webcrypto.subtle.importKey(
                "raw",
                enc.encode(secret),
                { name: "PBKDF2" },
                false,
                ["deriveKey"]
            );

            return await webcrypto.subtle.deriveKey(
                {
                    name: "PBKDF2",
                    salt: enc.encode("foodsnap_salt_99"),
                    iterations: 1000,
                    hash: "SHA-256",
                },
                keyMaterial,
                { name: "AES-GCM", length: 256 },
                false,
                ["decrypt"]
            );
        };

        function fromBase64(base64) {
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes;
        }

        try {
            const key = await getCryptoKey();
            const bytes = fromBase64(responseData.payload);
            
            if (bytes.length >= 13) {
                const iv = bytes.slice(0, 12);
                const data = bytes.slice(12);
                const decrypted = await webcrypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
                responseData = JSON.parse(new TextDecoder().decode(decrypted));
            }
        } catch (err) {
            console.error("[Payload Decryption Error]:", err);
        }
    }

    const images = Array.isArray(responseData?.data) ? responseData.data : (Array.isArray(responseData) ? responseData : []);
    const pagination = responseData?.pagination;
    const hasMore = responseData?.hasMore ?? (
        pagination
            ? Number(pagination.page) < Number(pagination.totalPages)
            : images.length >= Number(limit)
    );
    
    const formattedResponse = { data: images, hasMore, pagination };
    await setCache(cacheKey, formattedResponse, 86400);
    
    return successResponse(images, "Images fetched successfully", 200, { hasMore, pagination });
});

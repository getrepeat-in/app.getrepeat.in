import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { Role } from "@/models/Role";
import { Staff } from "@/models/Staff";
import ImageAsset from "@/models/Image";
import Restaurant from "@/models/Restaurant";
import { getOrSetCache } from "@/services/backend/redis/cache.service";
import { normalizeSlug, isDuplicateSlugError } from "@/lib/api/helpers/slug";
import {  getRestaurantCacheKey,  getRestaurantDetailsCacheKey,  getRestaurantSlugCacheKey,  invalidateRestaurantCache } from "@/lib/api/helpers/cacheKeys";
import { UnauthorizedError, BadRequestError, ForbiddenError,RestaurantNotFoundError, OutletLimitReachedError, SlugAlreadyInUseError } from "@/lib/api/response-handler";
import { ALLOWED_UPDATE_FIELDS, DEFAULT_ALLOWED_OUTLETS, RESTAURANT_CACHE_TTL, OWNER_ROLE_DEFINITION, STAFF_STATUS, DEFAULT_OPENING_HOURS } from "./helpers/constants";

export class RestaurantService {
    static async ensureSlugAvailable(slug, restaurantId = null) {
        const normalized = normalizeSlug(slug);
        if (!normalized) {
            throw new BadRequestError("A valid restaurant slug is required.");
        }

        await dbConnect();

        const query = {
            slug: normalized,
        };

        if (restaurantId) {
            query._id = { $ne: restaurantId };
        }

        const exists = await Restaurant.exists(query);

        if (exists) {
            throw new SlugAlreadyInUseError(
                "This restaurant slug is already taken by another outlet."
            );
        }

        return normalized;
    }

    static async checkOutletLimit(user) {
        if (!user || !user.id) {
            throw new UnauthorizedError("Please log in first to continue!");
        }

        await dbConnect();
        const allowedOutlets = Number(user.publicMetadata?.allowedOutlets ?? DEFAULT_ALLOWED_OUTLETS);
        const currentCount = await Restaurant.countDocuments({ createdBy: user.id });

        return {
            allowed: currentCount < allowedOutlets,
            currentCount,
            allowedOutlets,
        };
    }

    static async createRestaurant(user, data) {
        if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new BadRequestError("Invalid restaurant data provided. Expected an object.");
        }

        await dbConnect();

        const { name, phone, email, slug, address, logo, openingHours } = data;

        const normalizedSlug = await this.ensureSlugAvailable(slug);

        const { allowed, allowedOutlets } = await this.checkOutletLimit(user);
        if (!allowed) {
            throw new OutletLimitReachedError(allowedOutlets);
        }

        const session = await mongoose.startSession();
        let createdRestaurantId = null;

        try {
            await session.withTransaction(async () => {
                const newRestaurant = new Restaurant({
                    name,
                    phone,
                    email,
                    slug: normalizedSlug,
                    ...(address ? { address } : {}),
                    ...(logo ? { logo } : {}),
                    createdBy: user.id,
                    openingHours: openingHours ?? DEFAULT_OPENING_HOURS,
                });

                await newRestaurant.save({ session });
                createdRestaurantId = newRestaurant._id;

                const ownerRole = await Role.findOneAndUpdate(
                    { name: OWNER_ROLE_DEFINITION.name },
                    { $setOnInsert: OWNER_ROLE_DEFINITION },
                    { 
                        upsert: true, 
                        new: true, 
                        setDefaultsOnInsert: true,
                        session 
                    }
                ).select("_id").lean();

                const newStaff = new Staff({
                    email: user.email,
                    name: user.name || user.email?.split("@")[0] || "Restaurant Owner",
                    role: ownerRole._id,
                    restaurant: newRestaurant._id,
                    status: STAFF_STATUS.ACTIVE,
                    clerkUserId: user.id,
                });

                await newStaff.save({ session });
            });

            await invalidateRestaurantCache({
                userId: user.id,
                restaurantId: createdRestaurantId,
                slugs: normalizedSlug
            });

            return await Restaurant.findById(createdRestaurantId).populate("logo").lean();
        } catch (error) {
            if (isDuplicateSlugError(error)) {
                throw new SlugAlreadyInUseError();
            }

            throw error;
        } finally {
            await session.endSession();
        }
    }

    static async getRestaurantsByUser(userId) {
        if (!userId) {
            throw new UnauthorizedError("Please log in first to continue!");
        }

        await dbConnect();

        const { data: restaurants, isCached } = await getOrSetCache(
            getRestaurantCacheKey(userId),
            () => Restaurant.find({ createdBy: userId }).populate("logo").lean(),
            RESTAURANT_CACHE_TTL
        );

        return {
            restaurants: restaurants || [],
            isCached,
        };
    }

    static async getRestaurantById(restaurantId) {
        if (!restaurantId) {
            throw new BadRequestError("Restaurant ID is required");
        }

        await dbConnect();

        const { data: restaurant, isCached } = await getOrSetCache(
            getRestaurantDetailsCacheKey(restaurantId),
            () => Restaurant.findById(restaurantId).populate("logo").lean(),
            RESTAURANT_CACHE_TTL
        );

        if (!restaurant) {
            throw new RestaurantNotFoundError();
        }

        return {
            restaurant,
            isCached,
        };
    }

    static async getRestaurantBySlug(slug) {
        const normalizedSlug = normalizeSlug(slug);
        if (!normalizedSlug) {
            throw new BadRequestError("Restaurant slug is required");
        }

        await dbConnect();

        const { data: restaurant, isCached } = await getOrSetCache(
            getRestaurantSlugCacheKey(normalizedSlug),
            () => Restaurant.findOne({ slug: normalizedSlug }).populate("logo").lean(),
            RESTAURANT_CACHE_TTL
        );

        if (!restaurant) {
            throw new RestaurantNotFoundError("Restaurant not found for the given slug.");
        }

        return {
            restaurant,
            isCached,
        };
    }

    static buildUpdateData(data) {
        if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new BadRequestError("Invalid update data provided. Expected an object.");
        }

        const updateData = {};

        for (const [key, value] of Object.entries(data)) {
            if (ALLOWED_UPDATE_FIELDS.has(key) && value !== undefined) {
                updateData[key] = value;
            }
        }

        if (updateData.slug !== undefined) {
            updateData.slug = normalizeSlug(updateData.slug);

            if (!updateData.slug) {
                throw new BadRequestError("Restaurant slug cannot be empty.");
            }
        }

        return updateData;
    }

    static async updateRestaurant(restaurantId, userId, data) {
        if (!restaurantId) {
            throw new BadRequestError("Restaurant ID is required");
        }

        if (!userId) {
            throw new UnauthorizedError("Please log in first to continue!");
        }

        const updateData = this.buildUpdateData(data);

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestError("No valid fields provided for update.");
        }

        await dbConnect();

        const existingRestaurant = await Restaurant.findById(restaurantId);
        if (!existingRestaurant) {
            throw new RestaurantNotFoundError();
        }

        const isCreator = String(existingRestaurant.createdBy) === String(userId);
        if (!isCreator) {
            const isStaff = await Staff.exists({
                clerkUserId: userId,
                restaurant: restaurantId,
                status: STAFF_STATUS.ACTIVE,
            });

            if (!isStaff) {
                throw new ForbiddenError("You do not have permission to modify this restaurant.");
            }
        }

        const oldSlug = existingRestaurant.slug;
        const newSlug = updateData.slug;
        const slugChanged = newSlug !== undefined && newSlug !== oldSlug;

        if (slugChanged) {
            await this.ensureSlugAvailable(newSlug, restaurantId);
        }

        try {
            Object.assign(existingRestaurant, updateData);
            await existingRestaurant.save();
        } catch (error) {
            if (isDuplicateSlugError(error)) {
                throw new SlugAlreadyInUseError("This restaurant slug is already taken by another outlet.");
            }
            throw error;
        }

        await invalidateRestaurantCache({
            userId, 
            restaurantId, 
            slugs: slugChanged ? [oldSlug, newSlug] : [oldSlug]
        });

        return Restaurant.findById(restaurantId).populate("logo").lean();
    }

    static async deleteRestaurant(restaurantId, userId) {
        await dbConnect();

        const restaurant = await Restaurant.findOne({ _id: restaurantId, createdBy: userId }).select("_id slug").lean();
        if (!restaurant) {
            throw new RestaurantNotFoundError("Restaurant not found or you don't have permission to delete it.");
        }

        await Restaurant.deleteOne({ _id: restaurantId });
        await invalidateRestaurantCache({
            userId, 
            restaurantId, 
            slugs: restaurant.slug
        });
        return { success: true };
    }
}
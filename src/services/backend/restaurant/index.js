import dbConnect from "@/lib/db";
import { Role } from "@/models/Role";
import { Staff } from "@/models/Staff";
import ImageAsset from "@/models/Image";
import Restaurant from "@/models/Restaurant";
import { getCache, setCache, deleteCache } from "@/services/backend/redis/cache.service";
import { getRestaurantCacheKey, getRestaurantDetailsCacheKey, invalidateRestaurantCache } from "@/lib/api/helpers/cacheKeys";

const ALLOWED_UPDATE_FIELDS = ["name", "slug", "logo", "address", "phone", "domain", "email", "gstNumber", "currency", "status", "openingHours", "instagram"];

export class RestaurantService {
    static async checkOutletLimit(user) {
        if (!user || !user.id) {
            const error = new Error("Please log in first to continue!");
            error.statusCode = 401;
            throw error;
        }

        await dbConnect();
        const allowedOutlets = Number(user.publicMetadata?.allowedOutlets ?? 1);
        const currentCount = await Restaurant.countDocuments({ createdBy: user.id });

        return {
            allowed: currentCount < allowedOutlets,
            currentCount,
            allowedOutlets,
        };
    }

    static async createRestaurant(user, { name, phone, email, slug, address, logo, openingHours }) {
        await dbConnect();

        if (!user || !user.id) {
            const error = new Error("Please log in first to continue!");
            error.statusCode = 401;
            throw error;
        }

        const { allowed, allowedOutlets } = await this.checkOutletLimit(user);
        if (!allowed) {
            const error = new Error(
                `Outlet limit reached! You are allowed to create max ${allowedOutlets} outlet(s). Please upgrade your plan to create more.`
            );
            error.statusCode = 403;
            throw error;
        }
        
        const existingRestaurant = await Restaurant.findOne({ slug });
        if (existingRestaurant) {
            const error = new Error("Restaurant slug already in use.");
            error.statusCode = 400;
            throw error;
        }

        const defaultOpeningHours = openingHours || {
            currentlyOpen: false,
            days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => ({
                day,
                isOpen: false,
                openTime: null,
                closeTime: null
            }))
        };

        const newRestaurant = new Restaurant({
            name,
            phone,
            email,
            slug,
            ...(address ? { address } : {}),
            ...(logo ? { logo } : {}),
            createdBy: user.id,
            openingHours: defaultOpeningHours
        });

        await newRestaurant.save();

        let ownerRole = await Role.findOne({ name: "OWNER" });
        if (!ownerRole) {
            ownerRole = new Role({
                name: "OWNER",
                description: "Restaurant Owner",
                isSystemRole: true
            });
            await ownerRole.save();
        }

        const newStaff = new Staff({
            email: user.email,
            name: user.name || user.email?.split('@')[0] || "Restaurant Owner",
            role: ownerRole._id,
            restaurant: newRestaurant._id,
            status: "ACTIVE",
            clerkUserId: user.id
        });
        await newStaff.save();
        await invalidateRestaurantCache(user.id);

        return newRestaurant;
    }

    static async getRestaurantsByUser(userId) {
        if (!userId) {
            const error = new Error("Please log in first to continue!");
            error.statusCode = 401;
            throw error;
        }

        await dbConnect();

        const cacheKey = getRestaurantCacheKey(userId);
        const cachedRestaurants = await getCache(cacheKey);
        if (cachedRestaurants) {
            return {
                restaurants: cachedRestaurants,
                isCached: true,
            };
        }

        const restaurants = await Restaurant.find({
            createdBy: userId,
        }).populate("logo").lean();

        await setCache(cacheKey, restaurants, 3600);

        return {
            restaurants,
            isCached: false,
        };
    }

    static async getRestaurantById(restaurantId) {
        if (!restaurantId) {
            const error = new Error("Restaurant ID is required");
            error.statusCode = 400;
            throw error;
        }

        await dbConnect();

        const cacheKey = getRestaurantDetailsCacheKey(restaurantId);
        const cachedDetails = await getCache(cacheKey);
        if (cachedDetails) {
            return {
                restaurant: cachedDetails,
                isCached: true,
            };
        }

        const restaurant = await Restaurant.findById(restaurantId).populate("logo").lean();
        if (!restaurant) {
            const error = new Error("Restaurant not found.");
            error.statusCode = 404;
            throw error;
        }

        await setCache(cacheKey, restaurant, 3600);

        return {
            restaurant,
            isCached: false,
        };
    }

    static async getRestaurantBySlug(slug) {
        if (!slug) {
            const error = new Error("Restaurant slug is required");
            error.statusCode = 400;
            throw error;
        }

        await dbConnect();

        const cacheKey = `restaurant:slug:${slug}`;
        const cached = await getCache(cacheKey);
        if (cached) {
            return {
                restaurant: cached,
                isCached: true,
            };
        }

        const restaurant = await Restaurant.findOne({ slug }).populate("logo").lean();
        if (!restaurant) {
            const error = new Error("Restaurant not found.");
            error.statusCode = 404;
            throw error;
        }

        await setCache(cacheKey, restaurant, 3600);

        return {
            restaurant,
            isCached: false,
        };
    }

    static async updateRestaurant(restaurantId, userId, data) {
        await dbConnect();

        if (!restaurantId) {
            const error = new Error("Restaurant ID is required");
            error.statusCode = 400;
            throw error;
        }

        const updateData = {};
        ALLOWED_UPDATE_FIELDS.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        });

        if (updateData.slug) {
            const existingRestaurant = await Restaurant.findOne({ slug: updateData.slug });
            if (existingRestaurant && existingRestaurant._id.toString() !== restaurantId.toString()) {
                const error = new Error("Restaurant slug already in use by another restaurant.");
                error.statusCode = 400;
                throw error;
            }
        }

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            restaurantId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate("logo");

        if (!updatedRestaurant) {
            const error = new Error("Restaurant not found.");
            error.statusCode = 404;
            throw error;
        }

        if (userId) {
            await invalidateRestaurantCache(userId, restaurantId);
        }
        if (updatedRestaurant.slug) {
            await deleteCache(`restaurant:slug:${updatedRestaurant.slug}`);
        }

        return updatedRestaurant;
    }

    static async deleteRestaurant(restaurantId, userId) {
        await dbConnect();

        const restaurant = await Restaurant.findOne({ _id: restaurantId, createdBy: userId });
        if (!restaurant) {
            const error = new Error("Restaurant not found or unauthorized.");
            error.statusCode = 404;
            throw error;
        }

        await Restaurant.deleteOne({ _id: restaurantId });

        if (userId) {
            await invalidateRestaurantCache(userId, restaurantId);
        }
        if (restaurant.slug) {
            await deleteCache(`restaurant:slug:${restaurant.slug}`);
        }

        return { success: true };
    }
}
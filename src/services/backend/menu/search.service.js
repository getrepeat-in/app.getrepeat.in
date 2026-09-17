import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import ImageAsset from "@/models/Image";
import Category from "@/models/Category";
import { getRestaurantFromSlug } from "@/lib/api/hooks/getRestaurant";
import { ImageService } from "@/services/backend/images";

export class MenuSearchService {
    static async search(slug, { query = "", isVeg = false, page = 1, limit = 10, categoryId = "" }) {
        await dbConnect();

        const { restaurant, error } = await getRestaurantFromSlug(slug);
        if (error || !restaurant) {
            throw new Error(error || "Restaurant not found");
        }

        let items = [];
        let totalResults = 0;

        const isVegFilter = isVeg === true || isVeg === "true";

        if (query) {
            const searchStage = {
                $search: {
                    index: "default",
                    count: {
                        type: "total"
                    },
                    compound: {
                        filter: [
                            {
                                equals: {
                                    value: restaurant._id,
                                    path: "restaurant"
                                }
                            },
                            {
                                equals: {
                                    value: true,
                                    path: "isAvailable"
                                }
                            }
                        ],
                        must: [
                            {
                                text: {
                                    query: query,
                                    path: ["name", "description"],
                                    fuzzy: {
                                        maxEdits: 2,
                                        prefixLength: 1
                                    }
                                }
                            }
                        ]
                    }
                }
            };

            const pipeline = [
                searchStage
            ];

            if (categoryId) {
                searchStage.$search.compound.filter.push({
                    equals: {
                        value: new mongoose.Types.ObjectId(categoryId),
                        path: "category"
                    }
                });
            }

            if (isVegFilter) {
                pipeline.push({
                    $match: {
                        dietaryType: { $in: ["veg"] }
                    }
                });
            }

            pipeline.push({
                $facet: {
                    results: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "categories",
                                localField: "category",
                                foreignField: "_id",
                                as: "category"
                            }
                        },
                        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: "categories",
                                localField: "subCategory",
                                foreignField: "_id",
                                as: "subCategory"
                            }
                        },
                        { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: "imageassets",
                                localField: "image",
                                foreignField: "_id",
                                as: "image"
                            }
                        },
                        { $unwind: { path: "$image", preserveNullAndEmptyArrays: true } }
                    ],
                    meta: [
                        {
                            $replaceWith: "$$SEARCH_META"
                        },
                        {
                            $limit: 1
                        }
                    ]
                }
            })


            let aggregationResults;
            try {
                aggregationResults = await MenuItem.aggregate(pipeline);
                const facetResult = aggregationResults[0];

                items = facetResult?.results || [];
                totalResults = facetResult?.meta?.[0]?.count?.total || 0;
            } catch (searchError) {
                console.warn("Atlas Search failed or not configured, falling back to regex search:", searchError.message);

                const fallbackFilter = {
                    restaurant: restaurant._id,
                    isAvailable: true,
                    $or: [
                        { name: { $regex: query, $options: "i" } },
                        { description: { $regex: query, $options: "i" } }
                    ]
                };

                if (isVegFilter) {
                    fallbackFilter.dietaryType = { $in: ["veg", "vegan"] };
                }

                if (categoryId) {
                    fallbackFilter.category = categoryId;
                }

                totalResults = await MenuItem.countDocuments(fallbackFilter);
                items = await MenuItem.find(fallbackFilter)
                    .populate("category", "name")
                    .populate("subCategory", "name")
                    .populate("image")
                    .sort({ displayOrder: 1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean();
            }
        } else {
            const filter = {
                restaurant: restaurant._id,
                isAvailable: true
            };

            if (isVegFilter) {
                filter.dietaryType = { $in: ["veg", "vegan"] };
            }

            if (categoryId) {
                filter.category = categoryId;
            }

            totalResults = await MenuItem.countDocuments(filter);
            items = await MenuItem.find(filter)
                .populate("category", "name")
                .populate("subCategory", "name")
                .populate("image")
                .sort({ displayOrder: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
        }

        const addonGroupIds = [...new Set(items.flatMap(item => item.addonGroups || []).map(id => id.toString()))];
        const rawAddonGroups = await mongoose.models.AddonGroup.find({ _id: { $in: addonGroupIds } })
            .populate({
                path: 'items.item',
                populate: { path: 'image' },
                select: 'name base_price image variants dietaryType isAvailable'
            })
            .lean();

        const addonGroups = rawAddonGroups.map(group => ({
            ...group,
            items: group.items ? group.items.filter(i => i && i.item).map(mapped => ({
                ...mapped,
                item: {
                    ...mapped.item,
                    image: ImageService.formatImage(mapped.item.image)
                }
            })) : []
        }));

        const now = new Date();
        const activePromotions = await mongoose.models.Promotion.find({
            restaurant: restaurant._id,
            status: "ACTIVE",
            $and: [
                { $or: [{ starts_at: null }, { starts_at: { $lte: now } }] },
                { $or: [{ ends_at: null }, { ends_at: { $gte: now } }] }
            ]
        }).lean();

        const formattedItems = items.map(item => {
            const itemPromotions = activePromotions.filter(promo => 
                promo.items && promo.items.some(promoItemId => promoItemId.toString() === item._id.toString())
            );
            return {
                ...item,
                image: ImageService.formatImage(item.image),
                promotions: itemPromotions
            };
        });

        return {
            items: formattedItems,
            totalResults,
            addonGroups
        };
    }
}

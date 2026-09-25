import mongoose from "mongoose";
import Order from "@/models/Order";
import MenuItem from "@/models/Item";
import "@/models/Image";
import "@/models/Category";
import { ImageService } from "@/services/backend/images";
import dbConnect from "@/lib/db";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

export const ReportsService = {
  getAnalytics: async ({
    restaurantId,
    startDate = null,
    endDate = null,
    preset = "today",
  }) => {
    await dbConnect();

    const now = new Date();
    let rangeStart;
    let rangeEnd;
    let isHourly = false;
    
    if (startDate && endDate) {
      rangeStart = new Date(startDate);
      rangeEnd = new Date(endDate);
      const diffHours = (rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60);
      isHourly = diffHours <= 48;
    } else {
      switch (preset) {
        case "yesterday":
          const yesterday = subDays(now, 1);
          rangeStart = startOfDay(yesterday);
          rangeEnd = endOfDay(yesterday);
          isHourly = true;
          break;
        case "week":
        case "7days":
          rangeStart = startOfDay(subDays(now, 6));
          rangeEnd = endOfDay(now);
          isHourly = false;
          break;
        case "month":
        case "30days":
          rangeStart = startOfDay(subDays(now, 29));
          rangeEnd = endOfDay(now);
          isHourly = false;
          break;
        case "thisMonth":
          rangeStart = startOfMonth(now);
          rangeEnd = endOfMonth(now);
          isHourly = false;
          break;
        case "today":
        default:
          rangeStart = startOfDay(now);
          rangeEnd = endOfDay(now);
          isHourly = true;
          break;
      }
    }

    const restObjectId = mongoose.Types.ObjectId.isValid(restaurantId)
      ? new mongoose.Types.ObjectId(restaurantId)
      : restaurantId;

    const matchQuery = {
      restaurant: restObjectId,
      createdAt: { $gte: rangeStart, $lte: rangeEnd },
    };

    // Calculate today's boundaries for always-present live counters
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [facetResults, todayResults] = await Promise.all([
      // Primary period aggregation
      Order.aggregate([
        { $match: matchQuery },
        {
          $facet: {
            // 1. Summary metrics
            summary: [
              {
                $group: {
                  _id: null,
                  totalOrders: { $sum: 1 },
                  totalRevenue: {
                    $sum: {
                      $cond: [
                        { $in: ["$orderStatus", ["CANCELLED", "REJECTED"]] },
                        0,
                        "$totalAmount",
                      ],
                    },
                  },
                  totalSubtotal: {
                    $sum: {
                      $cond: [
                        { $in: ["$orderStatus", ["CANCELLED", "REJECTED"]] },
                        0,
                        { $ifNull: ["$subtotal", "$totalAmount"] },
                      ],
                    },
                  },
                  totalTax: {
                    $sum: {
                      $cond: [
                        { $in: ["$orderStatus", ["CANCELLED", "REJECTED"]] },
                        0,
                        { $ifNull: ["$tax", 0] },
                      ],
                    },
                  },
                  totalDiscount: {
                    $sum: {
                      $cond: [
                        { $in: ["$orderStatus", ["CANCELLED", "REJECTED"]] },
                        0,
                        { $ifNull: ["$discount", 0] },
                      ],
                    },
                  },
                  completedOrders: {
                    $sum: {
                      $cond: [
                        {
                          $in: [
                            "$orderStatus",
                            ["COMPLETED", "DELIVERED", "SERVED", "PICKED_UP"],
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  cancelledOrders: {
                    $sum: {
                      $cond: [
                        { $in: ["$orderStatus", ["CANCELLED", "REJECTED"]] },
                        1,
                        0,
                      ],
                    },
                  },
                  activeOrders: {
                    $sum: {
                      $cond: [
                        {
                          $in: [
                            "$orderStatus",
                            ["PLACED", "ACCEPTED", "PREPARING", "READY", "IN_TRANSIT"],
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  paidRevenue: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $in: ["$paymentStatus", ["PAID", "COMPLETED"]] },
                            { $not: [{ $in: ["$orderStatus", ["CANCELLED", "REJECTED"]] }] },
                          ],
                        },
                        "$totalAmount",
                        0,
                      ],
                    },
                  },
                  pendingRevenue: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $in: ["$paymentStatus", ["PENDING", "AUTHORIZED"]] },
                            { $not: [{ $in: ["$orderStatus", ["CANCELLED", "REJECTED"]] }] },
                          ],
                        },
                        "$totalAmount",
                        0,
                      ],
                    },
                  },
                },
              },
            ],

            // 2. Payment Method distribution
            paymentMethods: [
              {
                $group: {
                  _id: { $ifNull: ["$paymentMethod", "CASH"] },
                  count: { $sum: 1 },
                  revenue: {
                    $sum: {
                      $cond: [
                        { $in: ["$orderStatus", ["CANCELLED", "REJECTED"]] },
                        0,
                        "$totalAmount",
                      ],
                    },
                  },
                },
              },
              { $sort: { revenue: -1 } },
            ],

            // 3. Payment Status distribution
            paymentStatuses: [
              {
                $group: {
                  _id: { $ifNull: ["$paymentStatus", "PENDING"] },
                  count: { $sum: 1 },
                  revenue: {
                    $sum: {
                      $cond: [
                        { $in: ["$orderStatus", ["CANCELLED", "REJECTED"]] },
                        0,
                        "$totalAmount",
                      ],
                    },
                  },
                },
              },
              { $sort: { revenue: -1 } },
            ],

            // 4. Order Types distribution
            orderTypes: [
              {
                $group: {
                  _id: { $ifNull: ["$orderType", "DINE_IN"] },
                  count: { $sum: 1 },
                  revenue: {
                    $sum: {
                      $cond: [
                        { $in: ["$orderStatus", ["CANCELLED", "REJECTED"]] },
                        0,
                        "$totalAmount",
                      ],
                    },
                  },
                },
              },
              { $sort: { revenue: -1 } },
            ],

            // 5. Order Status distribution
            orderStatuses: [
              {
                $group: {
                  _id: "$orderStatus",
                  count: { $sum: 1 },
                },
              },
            ],

            // 6. Timeline Trend (Hourly or Daily)
            timeline: [
              {
                $project: {
                  periodKey: {
                    $dateToString: {
                      format: isHourly ? "%H:00" : "%Y-%m-%d",
                      date: "$createdAt",
                      timezone: "+05:30",
                    },
                  },
                  totalAmount: {
                    $cond: [
                      { $in: ["$orderStatus", ["CANCELLED", "REJECTED"]] },
                      0,
                      "$totalAmount",
                    ],
                  },
                  isCancelled: {
                    $cond: [
                      { $in: ["$orderStatus", ["CANCELLED", "REJECTED"]] },
                      1,
                      0,
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: "$periodKey",
                  orders: { $sum: 1 },
                  revenue: { $sum: "$totalAmount" },
                  cancelled: { $sum: "$isCancelled" },
                },
              },
              { $sort: { _id: 1 } },
            ],

            // 7. Top Selling Menu Items
            topItems: [
              {
                $match: {
                  orderStatus: { $nin: ["CANCELLED", "REJECTED"] },
                },
              },
              { $unwind: "$items" },
              {
                $group: {
                  _id: { $ifNull: ["$items.name", "Unknown Item"] },
                  menuItemId: { $first: "$items.menuItem" },
                  quantity: { $sum: "$items.quantity" },
                  revenue: {
                    $sum: {
                      $ifNull: [
                        "$items.totalPrice",
                        { $multiply: ["$items.quantity", "$items.unitPrice"] },
                      ],
                    },
                  },
                  unitPrice: { $last: "$items.unitPrice" },
                  avgUnitPrice: { $avg: "$items.unitPrice" },
                  dietaryType: { $first: "$items.dietaryType" },
                },
              },
              { $sort: { quantity: -1, revenue: -1 } },
              { $limit: 15 },
            ],

            // 8. Recent Orders for quick log & pagination
            recentOrders: [
              { $sort: { createdAt: -1 } },
              { $limit: 100 },
              {
                $lookup: {
                  from: "users",
                  localField: "customer",
                  foreignField: "_id",
                  as: "customerDoc",
                },
              },
              {
                $lookup: {
                  from: "tables",
                  localField: "table",
                  foreignField: "_id",
                  as: "tableDoc",
                },
              },
              {
                $project: {
                  _id: 1,
                  orderNumber: 1,
                  orderType: 1,
                  orderStatus: 1,
                  paymentStatus: 1,
                  paymentMethod: 1,
                  totalAmount: 1,
                  createdAt: 1,
                  itemCount: { $size: { $ifNull: ["$items", []] } },
                  customer: {
                    name: { $arrayElemAt: ["$customerDoc.name", 0] },
                    phone: { $arrayElemAt: ["$customerDoc.phone", 0] },
                  },
                  table: {
                    tableNumber: { $arrayElemAt: ["$tableDoc.tableNumber", 0] },
                    zone: { $arrayElemAt: ["$tableDoc.zone", 0] },
                  },
                  deliveryAddress: 1,
                },
              },
            ],
          },
        },
      ]),

      // Live Today-specific summary
      Order.aggregate([
        {
          $match: {
            restaurant: restObjectId,
            createdAt: { $gte: todayStart, $lte: todayEnd },
          },
        },
        {
          $group: {
            _id: null,
            todayOrders: { $sum: 1 },
            todayRevenue: {
              $sum: {
                $cond: [
                  { $in: ["$orderStatus", ["CANCELLED", "REJECTED"]] },
                  0,
                  "$totalAmount",
                ],
              },
            },
            todayCompleted: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$orderStatus",
                      ["COMPLETED", "DELIVERED", "SERVED", "PICKED_UP"],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            todayActive: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$orderStatus",
                      ["PLACED", "ACCEPTED", "PREPARING", "READY", "IN_TRANSIT"],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const facet = facetResults[0] || {};
    const rawSummary = facet.summary?.[0] || {};
    const todaySummary = todayResults[0] || {};

    const totalOrders = rawSummary.totalOrders || 0;
    const totalRevenue = rawSummary.totalRevenue || 0;
    const completedOrders = rawSummary.completedOrders || 0;
    const aov =
      completedOrders > 0
        ? totalRevenue / completedOrders
        : totalOrders > 0
        ? totalRevenue / totalOrders
        : 0;

    const todayOrders = todaySummary.todayOrders || 0;
    const todayRevenue = todaySummary.todayRevenue || 0;
    const todayAov = todayOrders > 0 ? todayRevenue / todayOrders : 0;

    // Normalizing payment methods
    const paymentMethods = (facet.paymentMethods || []).map((pm) => ({
      method: pm._id || "CASH",
      count: pm.count || 0,
      revenue: pm.revenue || 0,
      percentage: totalRevenue > 0 ? (pm.revenue / totalRevenue) * 100 : 0,
    }));

    // Normalizing order types
    const orderTypes = (facet.orderTypes || []).map((ot) => ({
      type: ot._id || "DINE_IN",
      count: ot.count || 0,
      revenue: ot.revenue || 0,
      percentage: totalOrders > 0 ? (ot.count / totalOrders) * 100 : 0,
    }));

    // Enrich top items with image, category, and accurate price details
    const rawTopItems = facet.topItems || [];
    let enrichedTopItems = [];

    if (rawTopItems.length > 0) {
      try {
        const topItemIds = rawTopItems
          .map((i) => i.menuItemId)
          .filter((id) => id && mongoose.Types.ObjectId.isValid(id));
        const topNames = rawTopItems.map((i) => i._id).filter(Boolean);

        const orConditions = [];
        if (topItemIds.length > 0) {
          orConditions.push({ _id: { $in: topItemIds } });
        }
        if (topNames.length > 0) {
          orConditions.push({ name: { $in: topNames } });
        }

        const foundMenuItems = orConditions.length > 0
          ? await MenuItem.find({
              restaurant: restObjectId,
              $or: orConditions,
            })
              .populate("image")
              .populate("category", "name")
              .lean()
          : [];

        const itemMapById = new Map();
        const itemMapByName = new Map();
        for (const mi of foundMenuItems) {
          if (mi._id) itemMapById.set(mi._id.toString(), mi);
          if (mi.name) itemMapByName.set(mi.name.toLowerCase().trim(), mi);
        }

        enrichedTopItems = rawTopItems.map((item) => {
          const idKey = item.menuItemId ? item.menuItemId.toString() : "";
          const nameKey = (item._id || "").toLowerCase().trim();
          const dbItem = itemMapById.get(idKey) || itemMapByName.get(nameKey);

          let formattedImage = null;
          if (dbItem?.image) {
            formattedImage = ImageService.formatImage(dbItem.image);
          } else if (dbItem?.media?.[0]?.url) {
            formattedImage = ImageService.formatImage(dbItem.media[0].url);
          }

          const unitPrice =
            item.unitPrice ||
            item.avgUnitPrice ||
            dbItem?.base_price ||
            (item.quantity > 0 ? item.revenue / item.quantity : 0);

          return {
            _id: item._id,
            name: dbItem?.name || item._id,
            menuItemId: item.menuItemId || dbItem?._id || null,
            quantity: item.quantity,
            revenue: Math.round((item.revenue || 0) * 100) / 100,
            unitPrice: Math.round((unitPrice || 0) * 100) / 100,
            base_price: dbItem?.base_price || unitPrice,
            dietaryType: dbItem?.dietaryType || item.dietaryType || "veg",
            categoryName: dbItem?.category?.name || null,
            image: formattedImage,
            description: dbItem?.description || "",
          };
        });
      } catch (err) {
        console.error("Error enriching top items in reports:", err);
        enrichedTopItems = rawTopItems.map((item) => ({
          _id: item._id,
          name: item._id,
          quantity: item.quantity,
          revenue: Math.round((item.revenue || 0) * 100) / 100,
          unitPrice:
            item.quantity > 0
              ? Math.round((item.revenue / item.quantity) * 100) / 100
              : item.unitPrice || 0,
          dietaryType: item.dietaryType || "veg",
          image: null,
        }));
      }
    }

    return {
      range: {
        startDate: rangeStart.toISOString(),
        endDate: rangeEnd.toISOString(),
        preset,
        isHourly,
      },
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        completedOrders,
        cancelledOrders: rawSummary.cancelledOrders || 0,
        activeOrders: rawSummary.activeOrders || 0,
        averageOrderValue: Math.round(aov * 100) / 100,
        totalSubtotal: Math.round((rawSummary.totalSubtotal || 0) * 100) / 100,
        totalTax: Math.round((rawSummary.totalTax || 0) * 100) / 100,
        totalDiscount: Math.round((rawSummary.totalDiscount || 0) * 100) / 100,
        paidRevenue: Math.round((rawSummary.paidRevenue || 0) * 100) / 100,
        pendingRevenue: Math.round((rawSummary.pendingRevenue || 0) * 100) / 100,
      },
      today: {
        todayOrders,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        todayCompleted: todaySummary.todayCompleted || 0,
        todayActive: todaySummary.todayActive || 0,
        todayAov: Math.round(todayAov * 100) / 100,
      },
      paymentMethods,
      paymentStatuses: facet.paymentStatuses || [],
      orderTypes,
      orderStatuses: facet.orderStatuses || [],
      timeline: facet.timeline || [],
      topItems: enrichedTopItems.length > 0 ? enrichedTopItems : facet.topItems || [],
      recentOrders: facet.recentOrders || [],
    };
  },
};

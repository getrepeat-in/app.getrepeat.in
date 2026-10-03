import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import Table from "@/models/Table";
import { withErrorHandler, successResponse, BadRequestError, RestaurantNotFoundError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    if (!slug) throw new BadRequestError("Restaurant slug is required");

    await dbConnect();
    const restaurant = await Restaurant.findOne({ slug }).select("_id").lean();
    if (!restaurant) throw new RestaurantNotFoundError();

    const tables = await Table.find({ restaurant: restaurant._id, isActive: true })
        .sort({ tableNumber: 1 })
        .select("-qrToken -createdAt -updatedAt -restaurant")
        .lean();

    const summary = {
        total: tables.length,
        available: 0,
        occupied: 0,
        reserved: 0,
        unavailable: 0,
    };

    tables.forEach(table => {
        if (summary[table.status] !== undefined) {
            summary[table.status]++;
        }
    });

    return successResponse({ summary, tables }, "Tables fetched successfully", 200);
});

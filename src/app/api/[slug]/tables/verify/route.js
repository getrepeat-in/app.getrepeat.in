import dbConnect from "@/lib/db";
import Table from "@/models/Table";
import Restaurant from "@/models/Restaurant";
import { withErrorHandler, successResponse, BadRequestError, RestaurantNotFoundError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    if (!slug) throw new BadRequestError("Restaurant slug is required");

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
        throw new BadRequestError("Table token is required");
    }

    await dbConnect();
    const restaurant = await Restaurant.findOne({ slug }).select("_id").lean();
    if (!restaurant) throw new RestaurantNotFoundError();

    const query = {
        restaurant: restaurant._id,
        isActive: true,
        $or: [{ qrToken: token }]
    };

    if (!isNaN(Number(token))) {
        query.$or.push({ tableNumber: Number(token) });
    }

    const table = await Table.findOne(query).select("-createdAt -updatedAt -restaurant").lean();

    if (!table) {
        throw new BadRequestError("Invalid table token or table is inactive");
    }

    const response = successResponse({ table }, "Table verified successfully", 200);
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return response;
});

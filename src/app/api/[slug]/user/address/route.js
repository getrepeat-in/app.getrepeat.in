import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { getAuthUser } from "@/lib/api/helpers/auth";
import { UserService } from "@/services/backend/user";
import { withErrorHandler, successResponse, UnauthorizedError, NotFoundError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    const authUser = getAuthUser(req);
    await dbConnect();
    if (!authUser) throw new UnauthorizedError("Not authenticated");

    const restaurant = await Restaurant.findOne({ slug }).select("_id").lean();
    if (!restaurant) throw new NotFoundError("Restaurant not found");

    const user = await UserService.getUserById(authUser.userId, restaurant._id);
    return successResponse(user.addresses || [], "Addresses fetched successfully");
});

export const POST = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    const authUser = getAuthUser(req);
    if (!authUser) throw new UnauthorizedError("Not authenticated");

    await dbConnect();
    const restaurant = await Restaurant.findOne({ slug }).select("_id").lean();
    if (!restaurant) throw new NotFoundError("Restaurant not found");

    const body = await req.json();
    const newAddress = await UserService.addAddress(authUser.userId, restaurant._id, body);
    return successResponse(newAddress, "Address added successfully", 201);
});

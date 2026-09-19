import Restaurant from "@/models/Restaurant";
import { getAuthUser } from "@/lib/api/helpers/auth";
import { UserService } from "@/services/backend/user";
import { withErrorHandler, successResponse, UnauthorizedError, NotFoundError } from "@/lib/api/response-handler";

export const PUT = withErrorHandler(async (req, { params }) => {
    const { slug, addressId } = await params;
    const authUser = getAuthUser(req);
    if (!authUser) throw new UnauthorizedError("Not authenticated");

    const restaurant = await Restaurant.findOne({ slug }).select("_id").lean();
    if (!restaurant) throw new NotFoundError("Restaurant not found");

    const body = await req.json();
    
    const updatedAddress = await UserService.updateAddress(authUser.userId, restaurant._id, addressId, body);
    return successResponse(updatedAddress, "Address updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
    const { slug, addressId } = await params;
    const authUser = getAuthUser(req);
    if (!authUser) throw new UnauthorizedError("Not authenticated");

    const restaurant = await Restaurant.findOne({ slug }).select("_id").lean();
    if (!restaurant) throw new NotFoundError("Restaurant not found");
    
    await UserService.removeAddress(authUser.userId, restaurant._id, addressId);
    return successResponse(null, "Address removed successfully");
});

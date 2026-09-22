import dbConnect from '@/lib/db';
import { getUser } from './getUser';
import Restaurant from '@/models/Restaurant';
import { normalizeSlug } from '@/lib/api/helpers/slug';
import { RestaurantNotFoundError, BadRequestError } from '@/lib/api/response-handler';

export async function getRestaurant({ restaurantId = null, required = true } = {}) {
  const user = await getUser({ required });
  if (!user && !required) {
    return { user: null, restaurant: null };
  }

  await dbConnect();
  const query = restaurantId ? { _id: restaurantId } : { createdBy: user.id };
  const restaurant = await Restaurant.findOne(query).lean();

  if (!restaurant && required) {
    throw new RestaurantNotFoundError("Restaurant not found or you do not have access to it.");
  }

  return {
    user,
    restaurant,
  };
}

export async function getRestaurantFromSlug(slug, { required = true } = {}) {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) {
    throw new BadRequestError("A valid restaurant slug is required.");
  }

  await dbConnect();

  const restaurant = await Restaurant.findOne({ slug: normalizedSlug }).lean();
  if (!restaurant && required) {
    throw new RestaurantNotFoundError("No restaurant found with this slug.");
  }

  return restaurant;
}

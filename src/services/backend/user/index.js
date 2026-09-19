import "@/models/Image";
import dbConnect from "@/lib/db";
import * as argon2 from "argon2";
import { User } from "@/models/User";
import Restaurant from "@/models/Restaurant";
import { getOrSetCache } from "@/services/backend/redis/cache.service";
import { getUsersCacheKey, invalidateUserCache } from "@/lib/api/helpers/cacheKeys";
import { BadRequestError, ConflictError, NotFoundError } from "@/lib/api/response-handler";

const POPULATE_USER_IMAGE = {
  path: "image",
  select: "variants original blurHash status key",
};

export class UserService {
  static async getUsers(restaurantId, options = {}) {
    if (!restaurantId) {
      throw new BadRequestError("Restaurant ID is required");
    }

    const { status = "all", search = "", page, limit } = options;

    await dbConnect();
    const cacheKey = getUsersCacheKey(restaurantId, { status, search, page, limit });

    const { data: result, isCached } = await getOrSetCache(
      cacheKey,
      async () => {
        const filter = { restaurant: restaurantId };

        if (status && status !== "all") {
          filter.status = status;
        }

        if (search && search.trim()) {
          const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(escaped, "i");
          filter.$or = [{ name: regex }, { phone: regex }];
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const isPaginated = !isNaN(pageNum) && pageNum > 0 && !isNaN(limitNum) && limitNum > 0;

        if (isPaginated) {
          const skip = (pageNum - 1) * limitNum;
          const [users, totalCount] = await Promise.all([
            User.find(filter)
              .populate(POPULATE_USER_IMAGE)
              .select("-passwordHash")
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limitNum)
              .lean(),
            User.countDocuments(filter),
          ]);

          return {
            users: users || [],
            totalCount,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalCount / limitNum),
          };
        }

        const users = await User.find(filter)
          .populate(POPULATE_USER_IMAGE)
          .select("-passwordHash")
          .sort({ createdAt: -1 })
          .lean();

        return {
          users: users || [],
          totalCount: users?.length || 0,
        };
      },
      3600
    );

    return {
      ...result,
      isCached,
    };
  }

  static async getUserById(userId, restaurantId) {
    if (!userId) {
      throw new BadRequestError("Customer ID is required");
    }
    if (!restaurantId) {
      throw new BadRequestError("Restaurant ID is required");
    }

    await dbConnect();

    const user = await User.findOne({ _id: userId, restaurant: restaurantId })
      .populate(POPULATE_USER_IMAGE)
      .select("-passwordHash")
      .lean();

    if (!user) {
      throw new NotFoundError("Customer not found");
    }

    return user;
  }

  static async createUser(restaurantId, data) {
    if (!restaurantId) {
      throw new BadRequestError("Restaurant ID is required");
    }

    const { name, phone, password, status, image } = data || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new BadRequestError("Customer name is required");
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      throw new BadRequestError("Phone number is required");
    }

    const cleanPhone = phone.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      throw new BadRequestError("Phone number must be exactly 10 digits");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      throw new BadRequestError("Password is required and must be at least 6 characters long");
    }

    await dbConnect();
    const existingUser = await User.findOne({ phone: cleanPhone, restaurant: restaurantId });
    if (existingUser) {
      throw new ConflictError("A customer with this phone number already exists for this restaurant");
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 14,
      timeCost: 2,
      parallelism: 1,
    });

    const isInvalidImage = !image || ["", "null", "undefined"].includes(String(image));
    let finalImage = isInvalidImage ? null : image;

    if (!finalImage) {
      const restaurant = await Restaurant.findById(restaurantId).select("logo").lean();
      if (restaurant?.logo) {
        finalImage = restaurant.logo;
      }
    }

    const newUser = await User.create({
      name: name.trim(),
      phone: cleanPhone,
      passwordHash,
      image: finalImage,
      restaurant: restaurantId,
      status: status || "ACTIVE",
    });

    await invalidateUserCache(restaurantId);
    return this.getUserById(newUser._id, restaurantId);
  }

  static async updateUser(userId, restaurantId, data) {
    if (!userId) {
      throw new BadRequestError("Customer ID is required");
    }
    if (!restaurantId) {
      throw new BadRequestError("Restaurant ID is required");
    }

    if (!data || typeof data !== "object") {
      throw new BadRequestError("Invalid update data provided");
    }

    await dbConnect();

    const user = await User.findOne({ _id: userId, restaurant: restaurantId });
    if (!user) {
      throw new NotFoundError("Customer not found");
    }

    const { name, phone, password, status, image } = data;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        throw new BadRequestError("Customer name cannot be empty");
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      const cleanPhone = String(phone).trim();
      if (!/^\d{10}$/.test(cleanPhone)) {
        throw new BadRequestError("Phone number must be exactly 10 digits");
      }

      if (cleanPhone !== user.phone) {
        const existingUser = await User.findOne({
          phone: cleanPhone,
          restaurant: restaurantId,
          _id: { $ne: userId },
        });
        if (existingUser) {
          throw new ConflictError("A customer with this phone number already exists for this restaurant");
        }
        user.phone = cleanPhone;
      }
    }

    if (status !== undefined) {
      if (!["ACTIVE", "INACTIVE", "BLOCKED"].includes(status)) {
        throw new BadRequestError("Invalid customer status specified");
      }
      user.status = status;
    }

    if (image !== undefined) {
      const isInvalidImage = !image || ["", "null", "undefined"].includes(String(image));
      user.image = isInvalidImage ? null : image;
    }

    if (password && typeof password === "string") {
      if (password.length < 6) {
        throw new BadRequestError("Password must be at least 6 characters long");
      }
      user.passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 14,
        timeCost: 2,
        parallelism: 1,
      });
    }

    await user.save();
    await invalidateUserCache(restaurantId);
    return this.getUserById(userId, restaurantId);
  }

  static async deleteUser(userId, restaurantId) {
    if (!userId) {
      throw new BadRequestError("Customer ID is required");
    }
    if (!restaurantId) {
      throw new BadRequestError("Restaurant ID is required");
    }

    await dbConnect();

    const user = await User.findOneAndDelete({ _id: userId, restaurant: restaurantId });
    if (!user) {
      throw new NotFoundError("Customer not found");
    }

    await invalidateUserCache(restaurantId);

    return { success: true, userId };
  }
  static async addAddress(userId, restaurantId, addressData) {
    await dbConnect();
    const user = await User.findOne({ _id: userId, restaurant: restaurantId });
    if (!user) throw new NotFoundError("Customer not found");

    if (user.addresses && user.addresses.length >= 3) {
      throw new BadRequestError("Maximum of 3 saved addresses allowed");
    }

    if (addressData.isDefault && user.addresses) {
      user.addresses.forEach(addr => addr.isDefault = false);
    } else if (!user.addresses || user.addresses.length === 0) {
      addressData.isDefault = true;
    }

    user.addresses.push(addressData);
    await user.save();
    return user.addresses[user.addresses.length - 1];
  }

  static async updateAddress(userId, restaurantId, addressId, addressData) {
    await dbConnect();
    const user = await User.findOne({ _id: userId, restaurant: restaurantId });
    if (!user) throw new NotFoundError("Customer not found");

    const address = user.addresses.id(addressId);
    if (!address) throw new NotFoundError("Address not found");

    if (addressData.isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== addressId) addr.isDefault = false;
      });
    }

    Object.assign(address, addressData);
    await user.save();
    return address;
  }

  static async removeAddress(userId, restaurantId, addressId) {
    await dbConnect();
    const user = await User.findOne({ _id: userId, restaurant: restaurantId });
    if (!user) throw new NotFoundError("Customer not found");

    const address = user.addresses.id(addressId);
    if (!address) throw new NotFoundError("Address not found");

    user.addresses.pull(addressId);
    await user.save();
    return { success: true };
  }

  static async getAll(restaurantId) {
    const res = await this.getUsers(restaurantId);
    return res.users;
  }

  static create(restaurantId, data) {
    return this.createUser(restaurantId, data);
  }

  static update(restaurantId, userId, data) {
    return this.updateUser(userId, restaurantId, data);
  }

  static delete(restaurantId, userId) {
    return this.deleteUser(userId, restaurantId);
  }
}

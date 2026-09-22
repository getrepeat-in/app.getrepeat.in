import "@/models/Image";
import dbConnect from "@/lib/db";
import * as argon2 from "argon2";
import { Role } from "@/models/Role";
import { Staff } from "@/models/Staff";
import Restaurant from "@/models/Restaurant";
import { getOrSetCache } from "@/services/backend/redis/cache.service";
import { getStaffCacheKey, invalidateStaffCache } from "@/lib/api/helpers/cacheKeys";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "@/lib/api/response-handler";

const POPULATE_STAFF_ROLE = {
  path: "role",
  select: "name description isSystemRole permissions",
  populate: {
    path: "permissions",
    select: "code description",
  },
};

const POPULATE_STAFF_IMAGE = {
  path: "image",
  select: "original thumbnail card detail",
};

export class StaffService {
  static async getStaffList(restaurantId, options = {}) {
    if (!restaurantId) {
      throw new BadRequestError("Restaurant ID is required");
    }

    const { status = "all", search = "", page, limit } = options;

    await dbConnect();
    const cacheKey = getStaffCacheKey(restaurantId, { status, search, page, limit });

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
          filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const isPaginated = !isNaN(pageNum) && pageNum > 0 && !isNaN(limitNum) && limitNum > 0;

        if (isPaginated) {
          const skip = (pageNum - 1) * limitNum;
          const [staffList, totalCount] = await Promise.all([
            Staff.find(filter)
              .populate(POPULATE_STAFF_IMAGE)
              .populate(POPULATE_STAFF_ROLE)
              .select("-passwordHash")
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limitNum)
              .lean(),
            Staff.countDocuments(filter),
          ]);

          return {
            staffList: staffList || [],
            totalCount,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalCount / limitNum),
          };
        }

        const staffList = await Staff.find(filter)
          .populate(POPULATE_STAFF_IMAGE)
          .populate(POPULATE_STAFF_ROLE)
          .select("-passwordHash")
          .sort({ createdAt: -1 })
          .lean();

        return {
          staffList: staffList || [],
          totalCount: staffList?.length || 0,
        };
      },
      3600
    );

    return {
      ...result,
      isCached,
    };
  }

  static async getStaffById(staffId, restaurantId) {
    if (!staffId) {
      throw new BadRequestError("Staff ID is required");
    }
    if (!restaurantId) {
      throw new BadRequestError("Restaurant ID is required");
    }

    await dbConnect();

    const staff = await Staff.findOne({ _id: staffId, restaurant: restaurantId })
      .populate(POPULATE_STAFF_IMAGE)
      .populate(POPULATE_STAFF_ROLE)
      .select("-passwordHash")
      .lean();

    if (!staff) {
      throw new NotFoundError("Staff member not found");
    }

    return staff;
  }

  static async createStaff(restaurantId, data) {
    if (!restaurantId) {
      throw new BadRequestError("Restaurant ID is required");
    }

    const { name, email, role, password, status, image } = data || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new BadRequestError("Staff name is required");
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      throw new BadRequestError("Staff email is required");
    }

    if (!role) {
      throw new BadRequestError("Staff role is required");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      throw new BadRequestError("Password is required and must be at least 6 characters long");
    }

    await dbConnect();

    const normalizedEmail = email.toLowerCase().trim();
    const existingStaff = await Staff.exists({
      email: normalizedEmail,
      restaurant: restaurantId,
    });
    if (existingStaff) {
      throw new ConflictError("A staff member with this email already exists for this restaurant.");
    }

    const roleDoc = await Role.findById(role).lean();
    if (!roleDoc) {
      throw new BadRequestError("Invalid role specified");
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 14,
      timeCost: 2,
      parallelism: 1,
    });

    let finalImage = image || null;
    if (!finalImage) {
      const restaurant = await Restaurant.findById(restaurantId).select("logo").lean();
      if (restaurant?.logo) {
        finalImage = restaurant.logo;
      }
    }

    const newStaff = await Staff.create({
      name: name.trim(),
      email: normalizedEmail,
      role,
      passwordHash,
      image: finalImage,
      restaurant: restaurantId,
      status: status || "ACTIVE",
    });

    await invalidateStaffCache(restaurantId);
    return this.getStaffById(newStaff._id, restaurantId);
  }

  static async updateStaff(staffId, restaurantId, data) {
    if (!staffId) {
      throw new BadRequestError("Staff ID is required");
    }
    if (!restaurantId) {
      throw new BadRequestError("Restaurant ID is required");
    }

    if (!data || typeof data !== "object") {
      throw new BadRequestError("Invalid update data provided");
    }

    await dbConnect();

    const staff = await Staff.findOne({ _id: staffId, restaurant: restaurantId });
    if (!staff) {
      throw new NotFoundError("Staff member not found");
    }

    const { name, role, status, image, email, password } = data;
    if (role && role.toString() !== staff.role.toString()) {
      const roleExists = await Role.exists({ _id: role });
      if (!roleExists) {
        throw new BadRequestError("Invalid role assigned");
      }
      staff.role = role;
    }
    
    if (email && typeof email === "string") {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== staff.email) {
        const existingStaff = await Staff.exists({
          email: normalizedEmail,
          restaurant: restaurantId,
          _id: { $ne: staffId },
        });
        if (existingStaff) {
          throw new ConflictError("A staff member with this email already exists for this restaurant.");
        }
        staff.email = normalizedEmail;
      }
    }

    if (password && typeof password === "string") {
      if (password.length < 6) {
        throw new BadRequestError("Password must be at least 6 characters long");
      }
      staff.passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 14,
        timeCost: 2,
        parallelism: 1,
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        throw new BadRequestError("Staff name cannot be empty");
      }
      staff.name = name.trim();
    }

    if (status !== undefined) {
      staff.status = status;
    }

    if (image !== undefined) {
      staff.image = image || null;
    }

    await staff.save();
    await invalidateStaffCache(restaurantId);
    return this.getStaffById(staff._id, restaurantId);
  }

  static async deleteStaff(staffId, restaurantId) {
    if (!staffId) {
      throw new BadRequestError("Staff ID is required");
    }
    if (!restaurantId) {
      throw new BadRequestError("Restaurant ID is required");
    }

    await dbConnect();

    const staff = await Staff.findOne({ _id: staffId, restaurant: restaurantId }).populate("role");
    if (!staff) {
      throw new NotFoundError("Staff member not found");
    }

    if (staff.role?.name === "OWNER" && staff.role?.isSystemRole) {
      const restaurant = await Restaurant.findById(restaurantId).select("createdBy").lean();
      if (staff.clerkUserId && String(staff.clerkUserId) === String(restaurant?.createdBy)) {
        throw new BadRequestError("Cannot delete the restaurant owner / creator account");
      }
    }

    await Staff.deleteOne({ _id: staffId, restaurant: restaurantId });
    await invalidateStaffCache(restaurantId);

    return { success: true, staffId };
  }

  static async verifyCredentials(restaurantId, email, password) {
    if (!restaurantId || !email || !password) {
      throw new BadRequestError("Restaurant ID, email, and password are required");
    }

    await dbConnect();

    const normalizedEmail = email.toLowerCase().trim();
    const staff = await Staff.findOne({
      email: normalizedEmail,
      restaurant: restaurantId,
    })
      .select("+passwordHash")
      .populate(POPULATE_STAFF_ROLE)
      .populate(POPULATE_STAFF_IMAGE);

    if (!staff || !staff.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (staff.status !== "ACTIVE") {
      throw new UnauthorizedError("Staff account is disabled or suspended");
    }

    const isMatch = await argon2.verify(staff.passwordHash, password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }
    
    staff.lastLoginAt = new Date();
    await staff.save();

    const staffObj = staff.toObject();
    delete staffObj.passwordHash;
    return staffObj;
  }
}

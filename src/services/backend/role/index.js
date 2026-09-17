import dbConnect from "@/lib/db";
import { Role } from "@/models/Role";
import { getRolesCacheKey } from "@/lib/api/helpers/cacheKeys";
import { getOrSetCache } from "@/services/backend/redis/cache.service";

export class RoleService {
  static async getRoles() {
    await dbConnect();
    const cacheKey = getRolesCacheKey();

    const { data: roles, isCached } = await getOrSetCache(
      cacheKey,
      () =>
        Role.find({})
          .populate("permissions", "code description")
          .sort({ isSystemRole: -1, createdAt: 1 })
          .lean(),
      3600
    );

    return {
      roles: roles || [],
      isCached,
    };
  }
}
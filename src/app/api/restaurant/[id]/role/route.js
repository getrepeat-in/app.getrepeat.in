import { RoleService } from "@/services/backend/role";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async () => {
  const { roles, isCached } = await RoleService.getRoles();

  return successResponse(
    roles,
    `Roles fetched successfully${isCached ? " (cached)" : ""}`
  );
});

import { auth, currentUser } from "@clerk/nextjs/server";
import { UnauthorizedError } from "@/lib/api/response-handler";

export async function getUser({ required = true } = {}) {
  const { userId } = await auth();

  if (!userId) {
    if (required) {
      throw new UnauthorizedError("Please log in first to continue!");
    }
    return null;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    if (required) {
      throw new UnauthorizedError("User session is invalid or user no longer exists.");
    }
    return null;
  }

  return {
    id: userId,
    email: clerkUser.emailAddresses?.[0]?.emailAddress ?? "",
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "",
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
    imageUrl: clerkUser.imageUrl || "",
    publicMetadata: clerkUser.publicMetadata || {},
  };
}
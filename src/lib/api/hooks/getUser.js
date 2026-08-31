import { auth, currentUser } from '@clerk/nextjs/server';

export async function getUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  return {
    id: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' '),
  };
}
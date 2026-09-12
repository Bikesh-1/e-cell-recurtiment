import { auth } from "@clerk/nextjs/server";

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    return {
      authorized: false,
      userId: null,
    };
  }

  const adminUserId =
    process.env.ADMIN_CLERK_USER_ID;

  if (
    !adminUserId ||
    userId !== adminUserId
  ) {
    return {
      authorized: false,
      userId,
    };
  }

  return {
    authorized: true,
    userId,
  };
}
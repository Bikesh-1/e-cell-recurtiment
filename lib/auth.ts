import { auth, currentUser } from "@clerk/nextjs/server";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();

  if (!user) {
    return null;
  }

  return {
    clerkUserId: userId,
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    email: user.emailAddresses[0]?.emailAddress ?? "",
    imageUrl: user.imageUrl,
  };
}
import { prisma } from "../db";

export async function upsertUser(data: {
  email: string;
  name: string;
  postcode: string;
  tier?: string;
  clerkId?: string;
}) {
  const user = await prisma.user.upsert({
    where: { email: data.email.toLowerCase() },
    update: {
      name: data.name,
      postcode: data.postcode,
      ...(data.tier ? { tier: data.tier } : {}),
      ...(data.clerkId ? { clerkId: data.clerkId } : {}),
    },
    create: {
      email: data.email.toLowerCase(),
      name: data.name,
      postcode: data.postcode,
      tier: data.tier ?? "free",
      clerkId: data.clerkId,
    },
  });

  await prisma.alertPreference.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  return user;
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function upgradeUserTier(userId: string, tier: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { tier },
  });
}

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SubscriptionTier } from "../types";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  postcode: string;
  tier: SubscriptionTier;
}

const COOKIE_NAME = "plotpulse_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret-change-in-production-min-32-chars!"
);

export async function createSessionToken(
  user: SessionUser
): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.user as SessionUser;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };

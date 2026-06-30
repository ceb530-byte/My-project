"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { UserProvider } from "@/context/UserContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (clerkKey) {
    return (
      <ClerkProvider publishableKey={clerkKey}>
        <UserProvider>{children}</UserProvider>
      </ClerkProvider>
    );
  }

  return <UserProvider>{children}</UserProvider>;
}

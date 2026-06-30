import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isClerkEnabled } from "@/lib/env";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/feed(.*)",
  "/alerts(.*)",
  "/premium(.*)",
  "/community(.*)",
  "/tools(.*)",
]);

async function devMiddleware(_request: NextRequest) {
  return NextResponse.next();
}

export default isClerkEnabled()
  ? clerkMiddleware(async (auth, request) => {
      if (isProtectedRoute(request)) {
        await auth.protect();
      }
    })
  : devMiddleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

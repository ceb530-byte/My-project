import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { moderateWithAi, verifyPostcodeMatch } from "@/lib/moderation";
import { getSessionUser } from "@/lib/auth/session";

const postSchema = z.object({
  title: z.string().min(5).max(200),
  body: z.string().min(10).max(5000),
  category: z.enum(["question", "planning", "trades", "local_info"]),
});

const posts: Array<{
  id: string;
  author: string;
  title: string;
  body: string;
  category: string;
  createdAt: string;
  verifiedLocal: boolean;
  replies: number;
}> = [
  {
    id: "seed-1",
    author: "Sarah T.",
    title: "Anyone know the timeline for the Lidl on Northcote Road?",
    body: "Saw the hoardings go up — wondering if it'll affect parking on our street.",
    category: "local_info",
    createdAt: new Date().toISOString(),
    verifiedLocal: true,
    replies: 7,
  },
];

export async function GET() {
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid post", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const moderation = await moderateWithAi(parsed.data.title, parsed.data.body);
  if (!moderation.approved) {
    return NextResponse.json(
      {
        error: moderation.reason,
        flags: moderation.flags,
        canPost: false,
      },
      { status: 422 }
    );
  }

  if (!verifyPostcodeMatch(user.postcode, user.postcode)) {
    return NextResponse.json(
      { error: "Postcode verification failed" },
      { status: 403 }
    );
  }

  const post = {
    id: `post-${Date.now()}`,
    author: user.name,
    title: parsed.data.title,
    body: parsed.data.body,
    category: parsed.data.category,
    createdAt: new Date().toISOString(),
    verifiedLocal: true,
    replies: 0,
  };

  posts.unshift(post);
  return NextResponse.json({ post }, { status: 201 });
}

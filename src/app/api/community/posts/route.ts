import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { moderateWithAi, verifyPostcodeMatch } from "@/lib/moderation";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const postSchema = z.object({
  title: z.string().min(5).max(200),
  body: z.string().min(10).max(5000),
  category: z.enum(["question", "planning", "trades", "local_info"]),
});

export async function GET() {
  const posts = await prisma.communityPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      author: p.author.name,
      title: p.title,
      body: p.body,
      category: p.category,
      createdAt: p.createdAt.toISOString(),
      verifiedLocal: p.verifiedLocal,
      replies: p.replies,
    })),
  });
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

  const post = await prisma.communityPost.create({
    data: {
      authorId: user.id,
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category,
      verifiedLocal: true,
    },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json(
    {
      post: {
        id: post.id,
        author: post.author.name,
        title: post.title,
        body: post.body,
        category: post.category,
        createdAt: post.createdAt.toISOString(),
        verifiedLocal: post.verifiedLocal,
        replies: post.replies,
      },
    },
    { status: 201 }
  );
}

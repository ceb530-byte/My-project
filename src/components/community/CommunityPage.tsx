"use client";

import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatRelativeDate } from "@/lib/format";
import { useUser } from "@/context/UserContext";

interface CommunityPost {
  id: string;
  author: string;
  title: string;
  body: string;
  category: string;
  replies: number;
  createdAt: string;
  verifiedLocal: boolean;
}

const categoryLabels: Record<string, string> = {
  question: "Question",
  planning: "Planning",
  trades: "Trades",
  local_info: "Local info",
};

export function CommunityPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<
    "question" | "planning" | "trades" | "local_info"
  >("question");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/community/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []));
  }, []);

  const handleSubmit = async () => {
    if (!user) {
      setError("Sign in to post");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, category }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Post rejected");
      setSubmitting(false);
      return;
    }

    setPosts((prev) => [data.post, ...prev]);
    setTitle("");
    setBody("");
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Community</h1>
        <p className="text-slate-500">
          Ask neighbours, discuss planning, recommend trades — vetted for quality
        </p>
      </div>

      <Card className="border-teal-200 bg-teal-50/30">
        <h2 className="font-semibold text-teal-900">Community standards</h2>
        <ul className="mt-2 space-y-1 text-sm text-teal-800">
          <li>• Verified local residents only (postcode-checked on signup)</li>
          <li>• Rule-based + optional OpenAI moderation filters bots and abuse</li>
          <li>• Non-constructive comments removed with notification</li>
        </ul>
      </Card>

      {user ? (
        <Card>
          <h3 className="font-semibold text-slate-900">New post</h3>
          <p className="mt-1 text-xs text-slate-500">
            Posting as {user.name} · verified in {user.postcode}
          </p>
          <div className="mt-4 space-y-3">
            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value as
                    | "question"
                    | "planning"
                    | "trades"
                    | "local_info"
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="question">Question</option>
              <option value="planning">Planning discussion</option>
              <option value="trades">Trades recommendation</option>
              <option value="local_info">Local information</option>
            </select>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share something constructive with your neighbours…"
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button onClick={handleSubmit} disabled={submitting || !title || !body}>
              {submitting ? "Checking…" : "Post"}
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-slate-600">
            <a href="/onboarding" className="font-medium text-teal-700 underline">
              Sign up
            </a>{" "}
            to join community discussions.
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-900">{post.author}</span>
              {post.verifiedLocal && (
                <Badge variant="success">Verified local</Badge>
              )}
              <Badge>{categoryLabels[post.category] ?? post.category}</Badge>
            </div>
            <h3 className="mt-2 font-semibold text-slate-900">{post.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{post.body}</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
              <span>{post.replies} replies</span>
              <span>{formatRelativeDate(post.createdAt)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

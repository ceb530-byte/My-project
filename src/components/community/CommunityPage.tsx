import { Card, Badge } from "@/components/ui/Card";
import { formatRelativeDate } from "@/lib/format";
import { communityPosts } from "@/lib/mock-data";

const categoryLabels = {
  question: "Question",
  planning: "Planning",
  trades: "Trades",
  local_info: "Local info",
};

export function CommunityPage() {
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
          <li>• Verified local residents only (postcode-checked)</li>
          <li>• AI moderation filters bots and vexatious posts</li>
          <li>• Non-constructive comments removed with notification</li>
          <li>• Planning discussions linked to official application data</li>
        </ul>
      </Card>

      <div className="space-y-4">
        {communityPosts.map((post) => (
          <Card key={post.id}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800">
                {post.avatarInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900">
                    {post.author}
                  </span>
                  {post.verifiedLocal && (
                    <Badge variant="success">Verified local</Badge>
                  )}
                  <Badge>{categoryLabels[post.category]}</Badge>
                </div>
                <h3 className="mt-1 font-semibold text-slate-900">
                  {post.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{post.body}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                  <span>{post.replies} replies</span>
                  <span>{formatRelativeDate(post.createdAt)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

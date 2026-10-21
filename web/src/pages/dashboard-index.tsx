import { href, Link } from "react-router";
import {
  IconArticle,
  IconCategoryPlus,
  IconExternalLink,
  IconFiles,
  IconPencilPlus,
  IconPencilStar,
  IconUserCheck,
  IconUserCircle,
  IconUserOff,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";
import { postCategory, postDate } from "@/components/blog-post-card";
import { BecomeWriterCard } from "@/components/dashboard/become-writer-card";
import type { Visibility } from "@/components/dashboard/main-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-store";
import { useAllMyBlogs, useBlogPosts, type BlogPostType } from "@/features/blogs/queries";
import { useCategories } from "@/features/categories/queries";
import { useUsers } from "@/features/users/api";
import { usePendingWriterRequestCount } from "@/features/writer-requests/api";
import { isVisible } from "@/lib/data/nav-data";
import { can, userRole, type PermissionKey } from "@/lib/permissions";
import { displayName } from "@/lib/utils";

type QuickAction = { label: string; description: string; to: string; icon: Icon } & Visibility;

// One list for every role; each user sees the actions their role allows.
const quickActions: QuickAction[] = [
  { label: "Write an article", description: "Start a new draft", to: href("/dashboard/articles/new"), icon: IconPencilPlus, permission: "WRITE" },
  { label: "Manage articles", description: "Edit, publish or archive", to: href("/dashboard/articles"), icon: IconArticle, permission: "WRITE" },
  { label: "Add a category", description: "Organise the blog", to: `${href("/dashboard/categories")}?new`, icon: IconCategoryPlus, permission: "ADMIN" },
  { label: "Review articles", description: "Take down or restore", to: href("/dashboard/manage/articles"), icon: IconFiles, permission: "MODERATE" },
  { label: "Review writer requests", description: "Approve new writers", to: href("/dashboard/writer-requests"), icon: IconUserCheck, permission: "ADMIN" },
  { label: "Become a writer", description: "Request or track access", to: href("/dashboard/writer-access"), icon: IconPencilStar, hideWith: ["WRITE", "MODERATE"] },
  { label: "Edit your profile", description: "Name, bio and avatar", to: href("/dashboard/profile"), icon: IconUserCircle },
  { label: "View the blog", description: "See what readers see", to: "/", icon: IconExternalLink },
];

const subtitles: [PermissionKey | null, string][] = [
  ["ADMIN", "Here's what's happening on Inkwell."],
  ["WRITE", "Here's how your writing is doing."],
  [null, "Catch up on the latest from Inkwell."],
];

export default function DashboardIndex() {
  const { user } = useAuth();
  const allowed = (key: PermissionKey) => can(user?.user, key);
  const subtitle = subtitles.find(([key]) => !key || allowed(key))![1];

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-2 md:p-4">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {displayName(user?.user)}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      {/* Only readers on the default role can request; others' roles are set by an admin. */}
      {!allowed("WRITE") && userRole(user?.user)?.name === "User" && <BecomeWriterCard />}

      {allowed("ADMIN") && <AdminOverview />}
      {allowed("WRITE") && <WriterStats />}

      <QuickActions actions={quickActions.filter((a) => isVisible(a, allowed))} />

      {allowed("WRITE") ? <WriterActivity /> : <LatestArticles />}
    </div>
  );
}

function StatTile({ label, value, loading, to, icon: TileIcon }: { label: string; value: number; loading?: boolean; to?: string; icon?: Icon }) {
  const body = (
    <>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        {TileIcon && <TileIcon className="size-4" />}
        {label}
      </p>
      {loading ? <Skeleton className="mt-2 h-9 w-16" /> : <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>}
    </>
  );
  return to ? (
    <Link to={to} className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
      {body}
    </Link>
  ) : (
    <div className="rounded-lg border p-4">{body}</div>
  );
}

function AdminOverview() {
  const pending = usePendingWriterRequestCount(true);
  const users = useUsers({ page: 1, limit: 1 });
  const disabled = useUsers({ page: 1, limit: 1, status: "disabled" });
  return (
    <section className="space-y-3">
      <h2 className="font-semibold">Administration</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Pending writer requests" value={pending.data ?? 0} loading={pending.isLoading} to={href("/dashboard/writer-requests")} icon={IconUserCheck} />
        <StatTile label="Users" value={users.data?.total ?? 0} loading={users.isLoading} to={href("/dashboard/users")} icon={IconUsers} />
        <StatTile label="Disabled accounts" value={disabled.data?.total ?? 0} loading={disabled.isLoading} to={href("/dashboard/users")} icon={IconUserOff} />
      </div>
    </section>
  );
}

/** The signed-in writer's own articles; shared by the stats row and the activity panels (cached). */
function useMyPosts() {
  const { user } = useAuth();
  const { data = [], isLoading } = useAllMyBlogs(user?.user._id ?? "");
  return { posts: data as BlogPostType[], isLoading };
}

function WriterStats() {
  const { posts, isLoading } = useMyPosts();
  const { data: categories = [] } = useCategories();
  const count = (status: string) => posts.filter((p) => p.status === status).length;
  const stats = [
    { label: "Your articles", value: posts.length },
    { label: "Published", value: count("published") },
    { label: "Drafts & in review", value: count("draft") + count("in-review") },
    { label: "Categories", value: categories.length },
  ];
  return (
    <section className="space-y-3">
      <h2 className="font-semibold">Your writing</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} label={stat.label} value={stat.value} loading={isLoading} />
        ))}
      </div>
    </section>
  );
}

function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <section className="space-y-3">
      <h2 className="font-semibold">Quick actions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map(({ label, description, to, icon: ActionIcon }) => (
          <Link key={label} to={to} className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ActionIcon className="size-5" />
            </span>
            <span>
              <span className="block font-medium">{label}</span>
              <span className="block text-sm text-muted-foreground">{description}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function WriterActivity() {
  const { posts, isLoading } = useMyPosts();

  const totals = new Map<string, number>();
  for (const p of posts) {
    const name = postCategory(p) || "Uncategorised";
    totals.set(name, (totals.get(name) ?? 0) + 1);
  }
  const perCategory = [...totals].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
  const maxPerCategory = Math.max(1, ...perCategory.map((c) => c.total));
  const recent = [...posts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-lg border">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold">Recently updated</h2>
          <Button variant="link" size="sm" asChild>
            <Link to={href("/dashboard/articles")}>View all</Link>
          </Button>
        </div>
        {!isLoading && !recent.length && <p className="px-4 py-10 text-center text-sm text-muted-foreground">No articles yet.</p>}
        <ul className="divide-y">
          {recent.map((post) => (
            <li key={post._id}>
              <Link
                to={href("/dashboard/articles/:id/edit", { id: post._id })}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/30"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{post.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {[postCategory(post), postDate(post)].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <Badge variant="outline" className="capitalize">
                  {post.status.replace("-", " ")}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h2 className="font-semibold">Articles by category</h2>
        {!perCategory.length && <p className="text-sm text-muted-foreground">Nothing to show yet.</p>}
        {perCategory.map((c) => (
          <div key={c.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{c.name}</span>
              <span className="tabular-nums text-muted-foreground">{c.total}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(c.total / maxPerCategory) * 100}%` }} />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

/** Readers and moderators: what's new on the blog. */
function LatestArticles() {
  const { data: articles = [], isLoading } = useBlogPosts();
  const latest = articles.slice(0, 5); // the API returns published articles, newest first
  return (
    <section className="rounded-lg border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold">Latest articles</h2>
        <Button variant="link" size="sm" asChild>
          <Link to="/">Browse all</Link>
        </Button>
      </div>
      {isLoading && <Skeleton className="m-4 h-24" />}
      {!isLoading && !latest.length && <p className="px-4 py-10 text-center text-sm text-muted-foreground">Nothing published yet.</p>}
      <ul className="divide-y">
        {latest.map((post) => (
          <li key={post._id}>
            <Link to={href("/blogs/:id", { id: post._id })} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/30">
              <span className="min-w-0">
                <span className="block truncate font-medium">{post.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {[postCategory(post), postDate(post)].filter(Boolean).join(" · ")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

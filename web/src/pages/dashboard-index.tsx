import { href, Link } from "react-router";
import {
  IconArticle,
  IconCategoryPlus,
  IconExternalLink,
  IconPencilPlus,
  type Icon,
} from "@tabler/icons-react";
import { postCategory, postDate } from "@/components/blog-post-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useAllMyBlogs, type BlogPostType } from "@/features/blogs/queries";
import { useCategories } from "@/features/categories/queries";
import { displayName } from "@/lib/utils";

const quickActions: { label: string; description: string; to: string; icon: Icon }[] = [
  {
    label: "Write an article",
    description: "Start a new draft",
    to: href("/dashboard/articles/new"),
    icon: IconPencilPlus,
  },
  {
    label: "Add a category",
    description: "Organise your writing",
    to: `${href("/dashboard/categories")}?new`,
    icon: IconCategoryPlus,
  },
  {
    label: "Manage articles",
    description: "Edit, publish or archive",
    to: href("/dashboard/articles"),
    icon: IconArticle,
  },
  { label: "View blog", description: "See what readers see", to: "/", icon: IconExternalLink },
];

export default function DashboardIndex() {
  const { user } = useAuth();
  const { data: articles = [], isLoading } = useAllMyBlogs(user?.user._id ?? "");
  const { data: categories = [] } = useCategories();

  const posts = articles as BlogPostType[];
  const count = (status: string) => posts.filter((p) => p.status === status).length;
  const stats = [
    { label: "Total articles", value: posts.length },
    { label: "Published", value: count("published") },
    { label: "Drafts & in review", value: count("draft") + count("in-review") },
    { label: "Categories", value: categories.length },
  ];

  const totals = new Map<string, number>();
  for (const p of posts) {
    const name = postCategory(p) || "Uncategorised";
    totals.set(name, (totals.get(name) ?? 0) + 1);
  }
  const perCategory = [...totals]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
  const maxPerCategory = Math.max(1, ...perCategory.map((c) => c.total));

  const recent = [...posts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-2 md:p-4">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {displayName(user?.user)}</h1>
        <p className="text-muted-foreground">Here's how your writing is doing.</p>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-9 w-16" />
            ) : (
              <p className="mt-1 text-3xl font-bold tabular-nums">{stat.value}</p>
            )}
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ label, description, to, icon: ActionIcon }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
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

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-lg border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">Recently updated</h2>
            <Button variant="link" size="sm" asChild>
              <Link to={href("/dashboard/articles")}>View all</Link>
            </Button>
          </div>
          {!isLoading && !recent.length && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No articles yet.
            </p>
          )}
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
          {!perCategory.length && (
            <p className="text-sm text-muted-foreground">Nothing to show yet.</p>
          )}
          {perCategory.map((c) => (
            <div key={c.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{c.name}</span>
                <span className="tabular-nums text-muted-foreground">{c.total}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(c.total / maxPerCategory) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

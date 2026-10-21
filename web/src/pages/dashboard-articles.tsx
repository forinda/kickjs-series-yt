import { href, Link } from "react-router";
import { IconExternalLink, IconPencil, IconPlus } from "@tabler/icons-react";
import { PostThumbnail, postCategory, postDate } from "@/components/blog-post-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-store";
import { useAllMyBlogs, type BlogPostType } from "@/features/blogs/queries";

const statusVariant = {
  published: "default",
  draft: "secondary",
  "in-review": "outline",
  archived: "outline",
} as const;

export default function DashboardArticles() {
  const { user } = useAuth();
  const { data: posts, isLoading } = useAllMyBlogs(user?.user._id ?? "");

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-2 md:p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Articles</h1>
          <p className="text-muted-foreground">Write, edit and publish your articles.</p>
        </div>
        <Button asChild>
          <Link to={href("/dashboard/articles/new")}>
            <IconPlus /> New article
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Post</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading &&
              Array.from({ length: 3 }, (_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3">
                    <Skeleton className="h-10" />
                  </td>
                </tr>
              ))}
            {!isLoading && !posts?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No articles yet. Create your first one.
                </td>
              </tr>
            )}
            {posts?.map((post) => (
              <tr key={post._id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <PostThumbnail
                      post={post as BlogPostType}
                      className="aspect-video w-16 shrink-0 rounded-md"
                    />
                    <span className="font-medium">{post.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{postCategory(post as BlogPostType) || "—"}</td>
                <td className="px-4 py-3">
                  {post.takedown ? (
                    <Badge variant="destructive" title="A moderator took this article down">
                      Taken down
                    </Badge>
                  ) : (
                    <Badge variant={statusVariant[post.status]} className="capitalize">
                      {post.status.replace("-", " ")}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {postDate(post as BlogPostType)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild aria-label="Edit article">
                      <Link to={href("/dashboard/articles/:id/edit", { id: post._id })}>
                        <IconPencil />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild aria-label="View article">
                      <Link to={href("/blogs/:id", { id: post._id })} target="_blank">
                        <IconExternalLink />
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

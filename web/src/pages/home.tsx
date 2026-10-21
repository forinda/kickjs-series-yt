import { useState } from "react";
import { Link } from "react-router";
import BlogPostCard, {
  PostMeta,
  PostThumbnail,
  postCategory,
  postDate,
  postExcerpt,
  postLink,
} from "@/components/blog-post-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPosts } from "@/features/blogs/queries";

export default function Home() {
  const { data: blogs, isLoading } = useBlogPosts();
  const [category, setCategory] = useState<string | null>(null);

  const posts = [...(blogs ?? [])].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
  );
  const categories = [...new Set(posts.map(postCategory).filter(Boolean))];
  const filtered = category ? posts.filter((p) => postCategory(p) === category) : posts;
  const [featured, ...rest] = filtered;
  const latest = rest.slice(0, 4);
  const more = rest.slice(4);

  return (
    <div className="space-y-16 px-4 py-12 md:px-8 md:py-16">
      <section className="space-y-6">
        <p className="text-sm font-medium text-muted-foreground">Inkwell Blog</p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Stories, guides and ideas for builders
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Thoughtful writing on software, architecture and building products people love.
        </p>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {[null, ...categories].map((c) => (
              <button key={c ?? "all"} type="button" onClick={() => setCategory(c)}>
                <Badge variant={category === c ? "default" : "outline"} className="h-7 px-3">
                  {c ?? "All"}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </section>

      {isLoading ? (
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <Skeleton className="aspect-video" />
          <div className="space-y-6">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      ) : !featured ? (
        <p className="text-muted-foreground">No posts yet. Check back soon.</p>
      ) : (
        <section className="grid gap-10 border-t pt-10 lg:grid-cols-[3fr_2fr]">
          <Link to={postLink(featured)} className="group space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Featured</h2>
            <PostThumbnail post={featured} className="aspect-video" />
            {postCategory(featured) && <Badge variant="secondary">{postCategory(featured)}</Badge>}
            <h3 className="text-3xl font-bold leading-tight group-hover:underline">
              {featured.title}
            </h3>
            <p className="text-lg text-muted-foreground">{postExcerpt(featured, 240)}</p>
            <PostMeta post={featured} />
          </Link>

          {latest.length > 0 && (
            <div className="lg:border-l lg:pl-10">
              <h2 className="text-sm font-medium text-muted-foreground">Latest</h2>
              <ul className="divide-y">
                {latest.map((post) => (
                  <li key={post._id}>
                    <Link to={postLink(post)} className="group flex gap-4 py-5">
                      <div className="flex-1 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {[postCategory(post), postDate(post)].filter(Boolean).join(" · ")}
                        </p>
                        <h3 className="font-semibold leading-snug group-hover:underline">
                          {post.title}
                        </h3>
                      </div>
                      <PostThumbnail post={post} className="size-16 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {more.length > 0 && (
        <section className="space-y-8 border-t pt-10">
          <h2 className="text-2xl font-bold">More stories</h2>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((post) => (
              <BlogPostCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

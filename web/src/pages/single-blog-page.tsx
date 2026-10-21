import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { IconArrowLeft } from "@tabler/icons-react";
import BlogPostCard, { PostMeta, PostThumbnail, postCategory } from "@/components/blog-post-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { safeArticleHtml } from "@/lib/article-html";
import { useBlogPost, useBlogPosts } from "@/features/blogs/queries";
import { EngagementBar } from "@/components/article/engagement-bar";
import { CommentsSection } from "@/components/article/comments-section";

export default function SingleBlogPage() {
  const { id } = useParams();
  const { data: blog, error, isLoading } = useBlogPost(id!);
  const { data: blogs } = useBlogPosts();

  // The server writes the share tags on first load; in-app navigation only needs the tab title.
  useEffect(() => {
    if (!blog) return;
    document.title = `${blog.title} · Inkwell`;
    return () => {
      document.title = "Inkwell";
    };
  }, [blog]);

  const category = blog ? postCategory(blog) : "";
  const related = (blogs ?? [])
    .filter((p) => p._id !== id)
    .sort((a, b) => Number(postCategory(b) === category) - Number(postCategory(a) === category))
    .slice(0, 3);

  return (
    <div className="space-y-16 px-4 py-12 md:px-8 md:py-16">
      <article className="mx-auto max-w-3xl space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft className="size-4" /> All posts
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="aspect-video" />
          </div>
        ) : error || !blog ? (
          <p className="text-muted-foreground">This post could not be found.</p>
        ) : (
          <>
            <header className="space-y-4">
              {category && <Badge variant="secondary">{category}</Badge>}
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{blog.title}</h1>
              <PostMeta post={blog} />
              <EngagementBar articleId={blog._id} likeCount={blog.likeCount ?? 0} commentCount={blog.commentCount ?? 0} />
            </header>
            <PostThumbnail post={blog} className="aspect-video" />
            <div
              className="prose prose-lg prose-neutral max-w-none dark:prose-invert prose-a:text-primary prose-img:rounded-lg"
              // Sanitised on the server when saved, and again here (safeArticleHtml).
              dangerouslySetInnerHTML={{ __html: safeArticleHtml(blog.body) }}
            />
          </>
        )}
      </article>

      {blog && <CommentsSection articleId={blog._id} />}

      {related.length > 0 && (
        <section className="space-y-8 border-t pt-10">
          <h2 className="text-2xl font-bold">Keep reading</h2>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((post) => (
              <BlogPostCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

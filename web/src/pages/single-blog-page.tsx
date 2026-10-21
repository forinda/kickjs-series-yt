import { Link, useParams } from "react-router";
import { IconArrowLeft } from "@tabler/icons-react";
import BlogPostCard, { PostMeta, PostThumbnail, postCategory } from "@/components/blog-post-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPost, useBlogPosts } from "@/features/blogs/queries";

export default function SingleBlogPage() {
  const { id } = useParams();
  const { data: blog, error, isLoading } = useBlogPost(id!);
  const { data: blogs } = useBlogPosts();

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
            </header>
            <PostThumbnail post={blog} className="aspect-video" />
            <div className="space-y-6 text-lg leading-relaxed">
              {blog.body.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>
          </>
        )}
      </article>

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

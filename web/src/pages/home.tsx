import BlogPostCard from "@/components/blog-post-card";
import { useBlogPosts } from "@/features/blogs/queries";

export default function Home() {
  const { data: blogs } = useBlogPosts();
  return (
    <div className="p-4 md:p-8 space-y-8 mx-auto max-w-7xl">
      <section>
        <h2 className="text-3xl font-bold">Learn what's new</h2>
        <p className="mt-2 text-muted-foreground">
          Add a concise value statement that captures your reader's interest and and previews your
          content value.
        </p>
      </section>
      <section className="space-y-4">
        {blogs?.map((blog, index) => (
          <BlogPostCard key={index} post={blog} />
        ))}
      </section>
    </div>
  );
}

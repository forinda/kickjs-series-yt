import Protect from "@/components/auth/protect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBlogPosts } from "@/features/blogs/queries";
import { Link, useBlocker } from "react-router";

export default function Home() {
    const {data:blogs} = useBlogPosts();
  return (
    <Protect>
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
            <div key={index} className="flex gap-2">
              {/* Left thumbnail */}
              <div className="overflow-hidden rounded-b-md">
                <img src={blog.thumbnail!} alt="Image fallback" className="h-24 aspect-square rounded-b-md border" />
              </div>
              {/* Right content */}
              <div>
                {/* Top */}
                <div>
                    <small>
                        {new Date(blog.createdAt ?? "").toLocaleDateString() ?? "Unknown"}. Articles
                    </small>
                </div>
                {/* Content */}
                <div>
                    <Link to={`/article/${blog._id}`} className="text-lg font-semibold hover:underline">
                        {blog.title}
                    </Link>
                    <p className="text-muted-foreground">
                        This is a brief summary of the article content.
                    </p>
                </div>
                {/* Author */}
                <div>
                  <Avatar>
                    <AvatarImage
                      src=""
                      alt="@shadcn"
                      className="grayscale"
                    />
                    <AvatarFallback>{blog.createdBy?.name?.slice(0, 2) ?? ""}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </Protect>
  );
}

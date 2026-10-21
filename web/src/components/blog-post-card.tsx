import type { BlogPostType } from "@/features/blogs/queries";
import { href, Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type BlogPostCardProps = {
  post: BlogPostType;
};

const formatAuthor = (author: any) => {
  if (typeof author === "string") return null;
  if (typeof author === "object" && author?.name) return author.name.slice(0, 2);
  return "";
};

export default function BlogPostCard({ post }: BlogPostCardProps) {
  // const
  return (
    <div className="flex gap-2">
      {/* Left thumbnail */}
      <div className="overflow-hidden rounded-b-md">
        <img
          src={post.thumbnail!}
          alt="Image fallback"
          className="h-24 aspect-square rounded-b-md border"
        />
      </div>
      {/* Right content */}
      <div>
        {/* Top */}
        <div>
          <small>
            {new Date(post.createdAt ?? "").toLocaleDateString() ?? "Unknown"}. Articles
          </small>
        </div>
        {/* Content */}
        <div>
          <Link
            to={href("/blogs/:id", { id: post._id })}
            className="text-lg font-semibold hover:underline"
          >
            {post.title}
          </Link>
          <p className="text-muted-foreground">This is a brief summary of the article content.</p>
        </div>
        {/* Author */}
        <div>
          <Avatar>
            <AvatarImage src="" alt="@shadcn" className="grayscale" />
            <AvatarFallback>{formatAuthor(post.createdBy)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}

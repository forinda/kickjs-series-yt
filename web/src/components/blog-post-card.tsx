import type { BlogPostType } from "@/features/blogs/queries";
import { href, Link } from "react-router";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { displayName, initials } from "@/lib/utils";

type BlogPostCardProps = {
  post: BlogPostType;
};

// Populated refs come back as objects; unpopulated ones as id strings.
const refField = (ref: unknown, field: "name") =>
  typeof ref === "object" && ref !== null ? ((ref as Record<string, string>)[field] ?? "") : "";

export const postAuthor = (post: BlogPostType) =>
  (typeof post.createdBy === "object" && displayName(post.createdBy)) || "Unknown";
export const postCategory = (post: BlogPostType) => refField(post.category, "name");

export const postExcerpt = (post: BlogPostType, length = 160) => {
  const text = (post.body ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
};

export const postReadTime = (post: BlogPostType) =>
  `${Math.max(1, Math.round((post.body ?? "").split(/\s+/).length / 200))} min read`;

export const postDate = (post: BlogPostType) =>
  post.createdAt
    ? new Date(post.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

export const postLink = (post: BlogPostType) => href("/blogs/:id", { id: post._id });

export function PostThumbnail({ post, className }: BlogPostCardProps & { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border bg-muted ${className ?? ""}`}>
      {post.thumbnail && (
        <img
          src={post.thumbnail}
          alt=""
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
    </div>
  );
}

export function PostMeta({ post }: BlogPostCardProps) {
  const author = postAuthor(post);
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Avatar className="size-6">
        <AvatarFallback className="text-[10px]">{initials({ name: author })}</AvatarFallback>
      </Avatar>
      <span className="font-medium text-foreground">{author}</span>
      <span aria-hidden>·</span>
      <time dateTime={post.createdAt}>{postDate(post)}</time>
      <span aria-hidden>·</span>
      <span>{postReadTime(post)}</span>
    </div>
  );
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const category = postCategory(post);
  return (
    <Link to={postLink(post)} className="group flex flex-col gap-4">
      <PostThumbnail post={post} className="aspect-video" />
      <div className="space-y-2">
        {category && <Badge variant="secondary">{category}</Badge>}
        <h3 className="text-xl font-semibold leading-snug group-hover:underline">{post.title}</h3>
        <p className="line-clamp-2 text-muted-foreground">{postExcerpt(post)}</p>
      </div>
      <PostMeta post={post} />
    </Link>
  );
}

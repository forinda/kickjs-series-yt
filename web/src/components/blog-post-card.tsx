import type { BlogPostType } from "@/features/blogs/queries";
import { href, Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { IconHeart, IconMessageCircle } from "@tabler/icons-react";
import { displayName, initials } from "@/lib/utils";
import { articleText } from "@/lib/article-html";

type BlogPostCardProps = {
  post: BlogPostType;
};

// Populated refs come back as objects; unpopulated ones as id strings.
const refField = (ref: unknown, field: "name") =>
  typeof ref === "object" && ref !== null ? ((ref as Record<string, string>)[field] ?? "") : "";

export const postAuthor = (post: BlogPostType) =>
  (typeof post.createdBy === "object" && displayName(post.createdBy)) || "Unknown";
export const postAuthorAvatar = (post: BlogPostType) =>
  typeof post.createdBy === "object" ? ((post.createdBy as { avatar?: string | null }).avatar ?? undefined) : undefined;
export const postCategory = (post: BlogPostType) => refField(post.category, "name");

export const postExcerpt = (post: BlogPostType, length = 160) => {
  const text = articleText(post.body);
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
};

export const postReadTime = (post: BlogPostType) =>
  `${Math.max(1, Math.round(articleText(post.body).split(" ").length / 200))} min read`;

// Readers care when it went live; drafts (dashboard only) fall back to when they were started.
const postDateIso = (post: BlogPostType) => post.publishedAt ?? post.createdAt;

export const postDate = (post: BlogPostType) =>
  postDateIso(post)
    ? new Date(postDateIso(post)!).toLocaleDateString(undefined, {
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
        <AvatarImage src={postAuthorAvatar(post)} alt="" className="object-cover" />
        <AvatarFallback className="text-[10px]">{initials({ name: author })}</AvatarFallback>
      </Avatar>
      <span className="font-medium text-foreground">{author}</span>
      <span aria-hidden>·</span>
      <time dateTime={postDateIso(post)}>{postDate(post)}</time>
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
      <PostCounts post={post} />
    </Link>
  );
}

/** Likes and comments, as a quiet line under a card. */
export function PostCounts({ post }: BlogPostCardProps) {
  const likes = post.likeCount ?? 0;
  const comments = post.commentCount ?? 0;
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1" aria-label={`${likes} likes`}>
        <IconHeart className="size-3.5" /> <span className="tabular-nums">{likes}</span>
      </span>
      <span className="flex items-center gap-1" aria-label={`${comments} comments`}>
        <IconMessageCircle className="size-3.5" /> <span className="tabular-nums">{comments}</span>
      </span>
    </div>
  );
}

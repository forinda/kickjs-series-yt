import { useState } from "react";
import { href, Link, useLocation } from "react-router";
import { toast } from "sonner";
import { IconLoader2, IconLock, IconTrash } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/auth-context";
import { useAddComment, useComments, useDeleteComment, type CommentRow } from "@/features/engagement/api";
import { extractError } from "@/lib/api";
import { can } from "@/lib/permissions";
import { displayName, initials } from "@/lib/utils";

const MAX = 2000; // mirrors the server DTO

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function CommentsSection({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useComments(articleId, page);
  const add = useAddComment(articleId);
  const [body, setBody] = useState("");
  const length = body.trim().length;
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / 20));
  const canComment = !!user && can(user.user, "COMMENT");

  const submit = () =>
    add.mutate(body.trim(), {
      onSuccess: () => {
        setBody("");
        setPage(pages); // oldest-first: a new comment lands on the last page
        toast.success("Comment posted.");
      },
      onError: (error) => toast.error(extractError(error, "Could not post your comment.")),
    });

  return (
    <section id="comments" className="mx-auto max-w-3xl scroll-mt-24 space-y-6 border-t pt-10">
      <h2 className="text-2xl font-bold">
        Comments <span className="text-muted-foreground tabular-nums">({total})</span>
      </h2>

      {data && !data.commentsEnabled ? (
        <p className="flex items-center gap-2 rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <IconLock className="size-4" /> Comments are closed on this article.
        </p>
      ) : !user ? (
        <p className="rounded-md border bg-muted/40 px-4 py-3 text-sm">
          <Link to={`${href("/auth")}?_next=${encodeURIComponent(pathname + "#comments")}`} className="font-medium text-primary hover:underline">
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      ) : canComment ? (
        <div className="space-y-2">
          <label htmlFor="new-comment" className="sr-only">
            Write a comment
          </label>
          <Textarea
            id="new-comment"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your thoughts…"
            className="min-h-24"
            maxLength={MAX + 200}
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs tabular-nums ${length > MAX ? "text-destructive" : "text-muted-foreground"}`}>
              {length}/{MAX}
            </span>
            <Button onClick={submit} disabled={!length || length > MAX || add.isPending}>
              {add.isPending && <IconLoader2 className="animate-spin" />}
              Post comment
            </Button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-24" />
      ) : total === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet{data?.commentsEnabled ? ". Be the first." : "."}</p>
      ) : (
        <ul className="space-y-6">
          {data?.items.map((c) => (
            <CommentItem key={String(c._id)} articleId={articleId} comment={c} />
          ))}
        </ul>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Older
            </Button>
            <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Newer
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function CommentItem({ articleId, comment }: { articleId: string; comment: CommentRow }) {
  const { user } = useAuth();
  const remove = useDeleteComment(articleId);
  const mine = !!comment.author && String(comment.author._id) === user?.user._id;
  const moderator = can(user?.user, "MODERATE");
  const [confirming, setConfirming] = useState(false);

  const onDelete = () =>
    remove.mutate(String(comment._id), {
      onSuccess: () => {
        setConfirming(false);
        toast.success("Comment deleted.");
      },
      onError: (error) => toast.error(extractError(error, "Could not delete the comment.")),
    });

  return (
    <li className="flex gap-3">
      <Avatar className="size-9">
        <AvatarImage src={comment.author?.avatar ?? undefined} alt="" className="object-cover" />
        <AvatarFallback>{initials(comment.author)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-medium">{comment.author ? displayName(comment.author) : "Deleted user"}</span>
          <time dateTime={comment.createdAt} className="text-xs text-muted-foreground">
            {formatWhen(comment.createdAt)}
          </time>
          {(mine || moderator) && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-7 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirming(true)}
              aria-label="Delete comment"
            >
              <IconTrash className="size-3.5" />
            </Button>
          )}
        </div>
        {/* Plain text: rendered as text (never HTML), line breaks kept. */}
        <p className="text-sm leading-relaxed break-words whitespace-pre-line">{comment.body}</p>
      </div>
      {confirming && (
        <Dialog open onOpenChange={(open) => !open && !remove.isPending && setConfirming(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{mine ? "Delete your comment?" : "Delete this comment?"}</DialogTitle>
              <DialogDescription>
                {mine ? "It will be removed for everyone." : "You're removing someone else's comment as a moderator."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={remove.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button variant="destructive" onClick={onDelete} disabled={remove.isPending}>
                {remove.isPending && <IconLoader2 className="animate-spin" />}
                Delete comment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </li>
  );
}

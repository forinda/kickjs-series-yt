import { href, Link, useLocation } from "react-router";
import { toast } from "sonner";
import { IconBookmark, IconBookmarkFilled, IconHeart, IconHeartFilled, IconMessageCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useEngagement, useToggleReaction } from "@/features/engagement/api";
import { extractError } from "@/lib/api";

type Props = { articleId: string; likeCount: number; commentCount: number };

/** Like, bookmark and jump-to-comments for an article. Signed-out readers are sent to sign in. */
export function EngagementBar({ articleId, likeCount, commentCount }: Props) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { data: state } = useEngagement(articleId, !!user);
  const like = useToggleReaction(articleId, "like");
  const bookmark = useToggleReaction(articleId, "bookmark");
  const signIn = `${href("/auth")}?_next=${encodeURIComponent(pathname)}`;

  const likes = state?.likeCount ?? likeCount;
  const comments = state?.commentCount ?? commentCount;
  const onError = (error: unknown) => toast.error(extractError(error, "That didn't work. Please try again."));

  const likeButton = (
    <Button
      variant="outline"
      size="sm"
      aria-pressed={!!state?.liked}
      aria-label={state?.liked ? "Unlike" : "Like"}
      className={state?.liked ? "border-primary/40 text-primary" : undefined}
      onClick={user ? () => like.mutate(!state?.liked, { onError }) : undefined}
      asChild={!user}
    >
      {user ? (
        <>
          {state?.liked ? <IconHeartFilled /> : <IconHeart />}
          <span className="tabular-nums">{likes}</span>
        </>
      ) : (
        <Link to={signIn} title="Sign in to like">
          <IconHeart />
          <span className="tabular-nums">{likes}</span>
        </Link>
      )}
    </Button>
  );

  return (
    <div className="flex items-center gap-2">
      {likeButton}
      <Button variant="outline" size="sm" asChild>
        <a href="#comments" aria-label={`${comments} comments`}>
          <IconMessageCircle />
          <span className="tabular-nums">{comments}</span>
        </a>
      </Button>
      <div className="ml-auto">
        {user ? (
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={!!state?.bookmarked}
            className={state?.bookmarked ? "text-primary" : undefined}
            onClick={() =>
              bookmark.mutate(!state?.bookmarked, {
                onSuccess: (s) => toast.success(s.bookmarked ? "Saved to your bookmarks." : "Removed from your bookmarks."),
                onError,
              })
            }
          >
            {state?.bookmarked ? <IconBookmarkFilled /> : <IconBookmark />}
            {state?.bookmarked ? "Saved" : "Save"}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" asChild>
            <Link to={signIn}>
              <IconBookmark /> Save
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

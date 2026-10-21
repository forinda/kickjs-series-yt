import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { blogPostsKey } from "@/features/blogs/keys";

export const engagementKeys = {
  state: (articleId: string) => ["engagement", articleId] as const,
  comments: (articleId: string, page: number) => ["comments", articleId, page] as const,
  allComments: (articleId: string) => ["comments", articleId] as const,
  bookmarks: (page: number) => ["bookmarks", page] as const,
};

export type EngagementState = {
  likeCount: number;
  commentCount: number;
  commentsEnabled: boolean;
  liked: boolean;
  bookmarked: boolean;
};

/** The signed-in reader's like/bookmark state plus counts. Signed out: counts come from the article. */
export const useEngagement = (articleId: string, enabled: boolean) =>
  useQuery({
    queryKey: engagementKeys.state(articleId),
    queryFn: () => api.get("/articles/:id/engagement", { params: { id: articleId } }) as Promise<EngagementState>,
    enabled,
  });

/**
 * Like/bookmark toggles. Optimistic: the button flips instantly and rolls back on error;
 * the server's answer (idempotent) is the final word.
 */
export const useToggleReaction = (articleId: string, kind: "like" | "bookmark") => {
  const client = useQueryClient();
  const key = engagementKeys.state(articleId);
  return useMutation({
    mutationFn: (on: boolean) => {
      const path = kind === "like" ? "/articles/:id/like" : "/articles/:id/bookmark";
      const opts = { params: { id: articleId } };
      return (on ? api.put(path, opts) : api.delete(path, opts)) as Promise<EngagementState>;
    },
    onMutate: async (on) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<EngagementState>(key);
      if (previous) {
        client.setQueryData<EngagementState>(key, {
          ...previous,
          ...(kind === "like"
            ? { liked: on, likeCount: previous.likeCount + (on === previous.liked ? 0 : on ? 1 : -1) }
            : { bookmarked: on }),
        });
      }
      return { previous };
    },
    onError: (_error, _on, context) => context?.previous && client.setQueryData(key, context.previous),
    onSuccess: (state) => {
      client.setQueryData(key, state);
      if (kind === "bookmark") client.invalidateQueries({ queryKey: ["bookmarks"] });
      else client.invalidateQueries({ queryKey: blogPostsKey.all }); // list cards show like counts
    },
  });
};

export const useComments = (articleId: string, page: number) =>
  useQuery({
    queryKey: engagementKeys.comments(articleId, page),
    queryFn: ({ signal }) =>
      api.get("/articles/:id/comments", { params: { id: articleId }, query: { page, limit: 20 }, signal }),
    placeholderData: keepPreviousData,
  });

export type CommentRow = NonNullable<ReturnType<typeof useComments>["data"]>["items"][number];

const useRefreshAfterComment = (articleId: string) => {
  const client = useQueryClient();
  return () => {
    client.invalidateQueries({ queryKey: engagementKeys.allComments(articleId) });
    client.invalidateQueries({ queryKey: engagementKeys.state(articleId) });
    client.invalidateQueries({ queryKey: blogPostsKey.all });
  };
};

export const useAddComment = (articleId: string) => {
  const onSuccess = useRefreshAfterComment(articleId);
  return useMutation({
    mutationFn: (body: string) => api.post("/articles/:id/comments", { params: { id: articleId }, body: { body } }),
    onSuccess,
  });
};

export const useDeleteComment = (articleId: string) => {
  const onSuccess = useRefreshAfterComment(articleId);
  return useMutation({
    mutationFn: (commentId: string) => api.delete("/comments/:id", { params: { id: commentId } }),
    onSuccess,
  });
};

export const useSetCommentsEnabled = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.put("/manage/articles/:id/comments", { params: { id }, body: { enabled } }),
    onSuccess: (_d, { id }) => {
      client.invalidateQueries({ queryKey: blogPostsKey.all });
      client.invalidateQueries({ queryKey: engagementKeys.allComments(id) });
      client.invalidateQueries({ queryKey: engagementKeys.state(id) });
    },
  });
};

export const useBookmarks = (page: number) =>
  useQuery({
    queryKey: engagementKeys.bookmarks(page),
    queryFn: ({ signal }) => api.get("/me/bookmarks", { query: { page, limit: 12 }, signal }),
    placeholderData: keepPreviousData,
  });

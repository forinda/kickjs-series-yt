import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { blogPostsKey } from "./keys";

export type ManagedArticlesFilter = {
  q?: string;
  status?: "draft" | "in-review" | "published" | "archived";
  takenDown?: "true" | "false";
  category?: string;
  page: number;
  limit: number;
};

// Under blogPostsKey.all so moderation actions also refresh public and "my articles" lists.
const managedKey = (filter: ManagedArticlesFilter) => [...blogPostsKey.all, "managed", filter] as const;

export const useManagedArticles = (filter: ManagedArticlesFilter) =>
  useQuery({
    queryKey: managedKey(filter),
    queryFn: ({ signal }) => api.get("/manage/articles", { query: filter, signal }),
    placeholderData: keepPreviousData,
  });

export type ManagedArticle = NonNullable<ReturnType<typeof useManagedArticles>["data"]>["items"][number];

const useModeration = <T,>(fn: (vars: T) => Promise<unknown>) => {
  const client = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => client.invalidateQueries({ queryKey: blogPostsKey.all }) });
};

export const useTakeDownArticle = () =>
  useModeration(({ id, reason }: { id: string; reason: string }) =>
    api.put("/manage/articles/:id/takedown", { params: { id }, body: { reason } }),
  );

export const useRestoreArticle = () =>
  useModeration((id: string) => api.put("/manage/articles/:id/restore", { params: { id } }));

export const useDeleteManagedArticle = () =>
  useModeration((id: string) => api.delete("/manage/articles/:id", { params: { id } }));

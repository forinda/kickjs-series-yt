import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { userKeys } from "@/features/users/api";

export type WriterRequestStatus = "pending" | "approved" | "rejected";
export type WriterRequestsFilter = { status?: WriterRequestStatus; page: number; limit: number };

export const writerRequestKeys = {
  mine: ["writer-request", "mine"] as const,
  history: ["writer-request", "history"] as const,
  all: ["writer-requests"] as const,
  list: (filter: WriterRequestsFilter) => [...writerRequestKeys.all, filter] as const,
};

export const useMyWriterRequest = (enabled = true) =>
  useQuery({ queryKey: writerRequestKeys.mine, queryFn: () => api.get("/me/writer-request"), enabled });

export const useMyWriterRequestHistory = () =>
  useQuery({ queryKey: writerRequestKeys.history, queryFn: () => api.get("/me/writer-requests") });

export const useSubmitWriterRequest = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => api.post("/me/writer-request", { body: { message } }),
    onSuccess: (request) => {
      client.setQueryData(writerRequestKeys.mine, request);
      client.invalidateQueries({ queryKey: writerRequestKeys.history });
    },
  });
};

export const useWriterRequests = (filter: WriterRequestsFilter) =>
  useQuery({
    queryKey: writerRequestKeys.list(filter),
    queryFn: ({ signal }) => api.get("/writer-requests", { query: filter, signal }),
    placeholderData: keepPreviousData,
  });

/** Pending requests waiting for an admin, for the sidebar badge. Same cache family as the queue,
 * so approving/rejecting refreshes it; also re-checks periodically for new requests. */
export const usePendingWriterRequestCount = (enabled: boolean) =>
  useQuery({
    queryKey: [...writerRequestKeys.all, "pending-count"],
    queryFn: async ({ signal }) =>
      (await api.get("/writer-requests", { query: { status: "pending", page: 1, limit: 1 }, signal })).total,
    enabled,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

export type WriterRequestRow = NonNullable<ReturnType<typeof useWriterRequests>["data"]>["items"][number];

export const useReviewWriterRequest = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, note }: { id: string; decision: "approve" | "reject"; note?: string }) =>
      decision === "approve"
        ? api.put("/writer-requests/:id/approve", { params: { id }, body: note ? { note } : {} })
        : api.put("/writer-requests/:id/reject", { params: { id }, body: note ? { note } : {} }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: writerRequestKeys.all });
      client.invalidateQueries({ queryKey: userKeys.all }); // approval changes a role
    },
  });
};

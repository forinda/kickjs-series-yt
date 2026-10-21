import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type UsersFilter = { q?: string; role?: string; status?: "active" | "disabled"; page: number; limit: number };

export const userKeys = {
  all: ["users"] as const,
  list: (filter: UsersFilter) => [...userKeys.all, filter] as const,
  roles: ["roles"] as const,
};

export const useUsers = (filter: UsersFilter) =>
  useQuery({
    queryKey: userKeys.list(filter),
    queryFn: ({ signal }) => api.get("/users", { query: filter, signal }),
    placeholderData: keepPreviousData, // keep the current page on screen while the next loads
  });

export type UserRow = NonNullable<ReturnType<typeof useUsers>["data"]>["items"][number];

export const useRoles = () =>
  useQuery({ queryKey: userKeys.roles, queryFn: () => api.get("/roles"), staleTime: 5 * 60_000 });

export const useAssignRole = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) =>
      api.put("/users/:id/role", { params: { id }, body: { roleId } }),
    onSuccess: () => client.invalidateQueries({ queryKey: userKeys.all }),
  });
};

export const useSetUserStatus = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, disabled }: { id: string; disabled: boolean }) =>
      api.put("/users/:id/status", { params: { id }, body: { disabled } }),
    onSuccess: () => client.invalidateQueries({ queryKey: userKeys.all }),
  });
};

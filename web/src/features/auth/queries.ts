import { useQuery } from "@tanstack/react-query";
import { authKeys } from "./keys";
import { api } from "@/lib/api";

export const useMyProfile = (enabled = true) => {
    return useQuery({
        queryKey: authKeys.me,
        enabled,
        // Errors pass through untouched so callers (and the retry policy) can see the status.
        queryFn: () => api.get("/me"),
    });
};

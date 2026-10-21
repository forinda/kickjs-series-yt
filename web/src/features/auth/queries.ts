

import { useQuery } from "@tanstack/react-query";
import { authKeys } from "./keys";
import { api } from "@/lib/api";

export const useMyProfile = (enabled = true) => {
    return useQuery({
        queryKey: authKeys.me,
        enabled,
        queryFn: async () => {
            try {
                const response = await api.get("/me");
                return response;
            } catch {
                throw new Error("Failed to fetch user");
            }
        }
    });
};
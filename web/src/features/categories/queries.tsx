import { useQuery } from "@tanstack/react-query";
import { categoryKeys } from "./keys";
import { api } from "@/lib/api";

export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async () => {
      return await api.get("/category");
    },
  });
};

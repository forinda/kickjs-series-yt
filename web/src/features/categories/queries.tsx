import { useQuery } from "@tanstack/react-query";
import { categoryKeys } from "./keys";
import { api } from "@/lib/api";

export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async () => {
      return await api.get("/categories");
    },
  });
};

/** For remote Combobox pickers: name search, cancelled when a newer query starts. */
export const searchCategories = async (q: string, signal: AbortSignal) => {
  const categories = await api.get("/categories", { query: q ? { q } : {}, signal });
  return categories.map((c) => ({ value: c._id, label: c.name, description: c.description }));
};

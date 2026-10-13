import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { blogPostsKey } from "./keys";

export const useBlogPosts = function () {
  return useQuery({
    queryKey: blogPostsKey.all,
    queryFn: async () => {
      // Replace this with your actual data fetching logic
      return await api.get("/blogs");
    },
  });
};

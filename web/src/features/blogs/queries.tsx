import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { blogPostsKey } from "./keys";

export const useBlogPosts = function () {
  return useQuery({
    queryKey: blogPostsKey.all,
    queryFn: async () => {
      // Replace this with your actual data fetching logic
      return await api.get("/articles");
    },
  });
};


// export type BlogPost  = ReturnType<typeof api.get> extends Promise<{ data: infer T }> ? T : never;
export const useBlogPost = function (id: string) {
  return useQuery({
    queryKey: blogPostsKey.detail(id),
    queryFn: async () => {
      return await api.get("/articles/:id", { params: { id } });
    },
  });
};
export type BlogPostType  =  NonNullable<ReturnType<typeof useBlogPost>['data']>

export const useAllMyBlogs = function (userId: string) {
  return useQuery({
    queryKey: blogPostsKey.allMine(userId),
    queryFn: async () => {
      return await api.get("/me/articles");
    },
  });
};

export const useMyBlog = function (userId: string, blogId: string) {
  return useQuery({
    queryKey: blogPostsKey.mine(userId, blogId),
    queryFn: async () => {
      return await api.get("/me/articles/:id", { params: { id: blogId } });
    },
    enabled: !!blogId,
  });
};

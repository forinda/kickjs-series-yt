
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateBlogInput } from "./schema";
import { blogPostsKey } from "./keys";


export const useCreateBlog = () => {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async (newBlog: CreateBlogInput) => {
            return await api.post("/blogs", {
                body: { ...newBlog, status: 'published' }
            });
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: blogPostsKey.all });
        },

    });
};
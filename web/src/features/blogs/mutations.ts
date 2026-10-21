import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, http } from "@/lib/api";
import type { BlogFormInput } from "./schema";
import { blogPostsKey } from "./keys";


export const useCreateBlog = () => {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async (newBlog: BlogFormInput) => {
            return await api.post("/articles", { body: newBlog });
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: blogPostsKey.all });
        },

    });
};

export const useUpdateBlog = () => {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...body }: BlogFormInput & { id: string }) => {
            return await api.put("/articles/:id", { params: { id }, body });
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: blogPostsKey.all });
        },
    });
};

// The typed client always JSON-encodes bodies, so multipart goes through the raw axios instance.
export const useUploadThumbnail = () => {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, file }: { id: string; file: File }) => {
            const form = new FormData();
            form.append("document", file);
            const res = await http.post(`/api/v1/articles/${id}/thumbnail`, form);
            return res.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: blogPostsKey.all });
        },
    });
};

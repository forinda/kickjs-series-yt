import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";


export const createBlogSchema = z.object({
  title: z.string({error:'Title is required'}).min(1),
  body: z.string({error:'Body is required'}).min(1),
  category: z.string({error:'Category is required'}).min(1),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export const createBlogResolver = zodResolver(createBlogSchema);
export const blogPostStatuses = ["draft", "in-review", "published", "archived"] as const;

export const blogFormSchema = createBlogSchema.extend({
  status: z.enum(blogPostStatuses),
});

export type BlogFormInput = z.infer<typeof blogFormSchema>;
export const blogFormResolver = zodResolver(blogFormSchema);

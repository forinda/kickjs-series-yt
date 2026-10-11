import { z } from 'zod'
import { createBlogPostSchema } from './create-blogs.dto'

export const updateBlogSchema = createBlogPostSchema.partial()

export type UpdateBlogDTO = z.infer<typeof updateBlogSchema>

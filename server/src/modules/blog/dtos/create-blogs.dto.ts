import { mongoIdSchema } from '@/utils/mongo-id-zod'
import { z } from 'zod'
import { blogPostStatuses } from '@/db/models/blog'

export const createBlogPostSchema = z.object({
  title: z.string({ error: 'Title is required' }),
  body: z.string({ error: 'Body is required' }),
  status: z
    .enum(blogPostStatuses, {
      error: 'Invalid status. Allowed values are: ' + blogPostStatuses.join(', '),
    })
    .default('draft'),
  category: mongoIdSchema({
    invalidId: 'Please provide a valid category ID',
    required: 'Category is required',
  }),
})

export type CreateBlogPostDTO = z.infer<typeof createBlogPostSchema>

import { mongoIdSchema } from '@/utils/mongo-id-zod'
import { z } from 'zod'
import { blogPostStatuses } from '@/db/models/blog'
import { articleText } from '../article-html'

const status = z.enum(blogPostStatuses, {
  error: 'Invalid status. Allowed values are: ' + blogPostStatuses.join(', '),
})

export const createArticleSchema = z.object({
  title: z.string({ error: 'Title is required' }),
  // HTML from the editor; an empty editor still sends "<p></p>", so check the text.
  body: z
    .string({ error: 'Body is required' })
    .refine((html) => articleText(html) !== '', 'Body is required'),
  status: status.default('draft'),
  category: mongoIdSchema({
    invalidId: 'Please provide a valid category ID',
    required: 'Category is required',
  }),
})

// No defaults on update: Zod 4 applies `.default()` even inside `.partial()`,
// which would reset an article to draft whenever `status` is omitted.
export const updateArticleSchema = createArticleSchema.extend({ status: status.optional() }).partial()

export type CreateArticleDTO = z.infer<typeof createArticleSchema>
export type UpdateArticleDTO = z.infer<typeof updateArticleSchema>

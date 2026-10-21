import { z } from 'zod'
import { blogPostStatuses } from '@/db/models/blog'
import { mongoIdSchema } from '@/utils/mongo-id-zod'

export const listManagedArticlesQuerySchema = z.object({
  /** Title search, case-insensitive. */
  q: z.string().trim().max(120).optional(),
  status: z.enum(blogPostStatuses).optional(),
  /** Only articles a moderator has taken down. */
  takenDown: z.enum(['true', 'false']).optional(),
  category: mongoIdSchema({ required: 'Category is required', invalidId: 'Invalid category ID' }).optional(),
  author: mongoIdSchema({ required: 'Author is required', invalidId: 'Invalid author ID' }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const takedownArticleSchema = z.object({
  reason: z
    .string({ error: 'Give the writer a reason' })
    .trim()
    .min(10, 'Please explain in at least 10 characters')
    .max(500, 'Keep the reason under 500 characters'),
})

export type ListManagedArticlesQuery = z.infer<typeof listManagedArticlesQuerySchema>
export type TakedownArticleDTO = z.infer<typeof takedownArticleSchema>

import { z } from 'zod'

export const addCommentSchema = z.object({
  body: z
    .string({ error: 'Write a comment first' })
    .trim()
    .min(1, 'Write a comment first')
    .max(2000, 'Comments are limited to 2000 characters'),
})

export const commentSettingsSchema = z.object({ enabled: z.boolean() })

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type AddCommentDTO = z.infer<typeof addCommentSchema>
export type PageQuery = z.infer<typeof pageQuerySchema>

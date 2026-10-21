import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z
    .string({ error: 'Please provide a name' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),
  description: z
    .string({ error: 'Please provide a description' })
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(280, 'Description must be at most 280 characters'),
})

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>

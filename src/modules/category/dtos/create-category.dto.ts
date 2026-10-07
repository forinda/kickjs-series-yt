import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string({ error: 'Please provide a name' }),
  description: z.string({ error: 'Please provide a description' }),
})

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>

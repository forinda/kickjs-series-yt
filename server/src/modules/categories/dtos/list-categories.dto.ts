import { z } from 'zod'

export const listCategoriesQuerySchema = z.object({
  /** Case-insensitive name search, for pickers that query as you type. */
  q: z.string().trim().max(50).optional(),
})

export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>

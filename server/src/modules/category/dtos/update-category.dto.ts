import { z } from 'zod'
import { createCategorySchema } from './create-category.dto'

export const updateCategorySchema = createCategorySchema.partial()

export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>

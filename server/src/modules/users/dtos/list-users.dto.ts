import { z } from 'zod'
import { mongoIdSchema } from '@/utils/mongo-id-zod'

export const listUsersQuerySchema = z.object({
  /** Matches name, first/last name or email, case-insensitively. */
  q: z.string().trim().max(80).optional(),
  role: mongoIdSchema({ required: 'Role is required', invalidId: 'Invalid role ID' }).optional(),
  status: z.enum(['active', 'disabled']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>

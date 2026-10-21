import { mongoIdSchema } from '@/utils/mongo-id-zod'
import { z } from 'zod'

export const assignRoleSchema = z.object({
  roleId: mongoIdSchema({ required: 'Role ID is required', invalidId: 'Invalid Role ID' }),
})

export type AssignRoleDTO = z.infer<typeof assignRoleSchema>

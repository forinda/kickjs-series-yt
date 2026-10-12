import { z } from 'zod'

export const loginAuthSchema = z.object({
  email: z.string().optional(),
  password: z.string().optional(),
})

export type LoginAuthDTO = z.infer<typeof loginAuthSchema>

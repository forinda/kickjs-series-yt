import { z } from 'zod'

export const registerAuthSchema = z.object({
  name: z.string({ error: 'Name is required' }),
  email: z.string({ error: 'Email is required' }),
  password: z.string({ error: 'Password is required' }),
})

export type RegisterAuthDTO = z.infer<typeof registerAuthSchema>

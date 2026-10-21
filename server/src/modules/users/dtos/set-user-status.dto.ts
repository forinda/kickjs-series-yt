import { z } from 'zod'

export const setUserStatusSchema = z.object({ disabled: z.boolean() })

export type SetUserStatusDTO = z.infer<typeof setUserStatusSchema>

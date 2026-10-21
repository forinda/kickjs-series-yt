import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ error: 'Enter your current password' }).min(1, 'Enter your current password'),
    newPassword: z
      .string({ error: 'Choose a new password' })
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters'),
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ['newPassword'],
    message: 'Choose a password different from your current one',
  })

export const deleteAccountSchema = z.object({
  password: z.string({ error: 'Enter your password to confirm' }).min(1, 'Enter your password to confirm'),
})

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>
export type DeleteAccountDTO = z.infer<typeof deleteAccountSchema>

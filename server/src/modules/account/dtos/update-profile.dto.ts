import { z } from 'zod'

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} must be at most ${max} characters`).optional()

// Full http(s) URL, or "" to clear.
const socialUrl = z
  .union([z.url({ protocol: /^https?$/, error: 'Must be a valid http(s) URL' }), z.literal('')])
  .optional()

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
  firstName: optionalText(50, 'First name'),
  lastName: optionalText(50, 'Last name'),
  // YYYY-MM-DD; null clears it.
  dob: z.iso
    .date({ error: 'Date of birth must be a valid date' })
    .refine((d) => new Date(d) <= new Date(), 'Date of birth cannot be in the future')
    .nullable()
    .optional(),
  bio: optionalText(500, 'Bio'),
  socials: z
    .object({ website: socialUrl, x: socialUrl, github: socialUrl, linkedin: socialUrl })
    .optional(),
})

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>

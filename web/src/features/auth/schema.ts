

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const signInSchema = z.object({
    email: z.email({ error: 'Invalid email address' }),
    password: z.string({ error: 'Password must be at least 6 characters long' }).min(6),
});

export type SignInSchema = z.infer<typeof signInSchema>;
export const signInResolver = zodResolver(signInSchema);

// Mirrors server/src/modules/auth/dtos/register-auth.dto.ts
export const signUpSchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name must be at most 80 characters'),
    email: z.email({ error: 'Invalid email address' }),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be at most 128 characters'),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
export const signUpResolver = zodResolver(signUpSchema);
// Mirrors server/src/modules/auth/dtos/update-profile.dto.ts. Empty strings mean "not set".
const socialUrl = z.union([
    z.url({ protocol: /^https?$/, error: "Must be a full http(s) URL" }),
    z.literal(""),
]);

export const PROFILE_LIMITS = { firstName: 50, lastName: 50, bio: 500 } as const;

export const profileSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    firstName: z.string().trim().max(PROFILE_LIMITS.firstName, "At most 50 characters"),
    lastName: z.string().trim().max(PROFILE_LIMITS.lastName, "At most 50 characters"),
    dob: z
        .string()
        .refine((d) => !d || new Date(d) <= new Date(), "Date of birth cannot be in the future"),
    bio: z.string().trim().max(PROFILE_LIMITS.bio, "Bio must be at most 500 characters"),
    socials: z.object({ website: socialUrl, x: socialUrl, github: socialUrl, linkedin: socialUrl }),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export const profileResolver = zodResolver(profileSchema);

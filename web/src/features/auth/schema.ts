

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const signInSchema = z.object({
    email: z.email({ error: 'Invalid email address' }),
    password: z.string({ error: 'Password must be at least 6 characters long' }).min(6),
});

export type SignInSchema = z.infer<typeof signInSchema>;
export const signInResolver = zodResolver(signInSchema);

export const signUpSchema = z.object({
    ...signInSchema.shape,
    name: z.string({ error: 'Name is required' }).min(1),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
export const signUpResolver = zodResolver(signUpSchema);
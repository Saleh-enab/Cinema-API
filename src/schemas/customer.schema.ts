import { z } from 'zod';

export const customrSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    dateOfBirth: z.date(),
    phone: z.string(),
    password: z.string(),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirm"]
})
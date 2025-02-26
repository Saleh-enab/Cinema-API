import { z } from 'zod';
import { validate } from '../middlewares/validateResources';

export const customerSchema = z.object({
    body: z.object({
        name: z.string(),
        email: z.string().email(),
        dateOfBirth: z.string()
            .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Invalid date format. Use DD/MM/YYYY.")
            .optional(),
        phone: z.string(),
        password: z.string(),
        confirmPassword: z.string()
    })

}).refine((data) => data.body.password === data.body.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirm"]
})

export const signUpValidator = validate(customerSchema)
export type SignUpMiddleware = typeof signUpValidator
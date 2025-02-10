import { z } from 'zod';
import { validate } from '../middlewares/validateResources';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string()
    })
})

export const loginValidator = validate(loginSchema)
export type LoginMiddleware = typeof loginValidator

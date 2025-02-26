import { Router } from "express";
import { validate } from "../middlewares/validateResources";
import { loginSchema } from "../schemas/login.schema";
import { forgotPassword, login, logout, resetPassword } from "../controllers/auth.controller";
import { authorizeUser, generateNewToken } from "../middlewares/authorization";
import { customerSchema } from "../schemas/customer.schema";
import { generateNewOTP, signUp, verifyEmail } from "../controllers/auth.controller";


export const authRouter = Router();

authRouter.post('/sign-up', validate(customerSchema), signUp)

authRouter.post('/login', validate(loginSchema), login)

authRouter.get('/logout', logout)

authRouter.post('/token', generateNewToken)

authRouter.post('/verify', authorizeUser, verifyEmail)

authRouter.get('/resend-OTP', authorizeUser, generateNewOTP)

authRouter.post('/forgot-password', forgotPassword)

authRouter.post('/reset-password', resetPassword)
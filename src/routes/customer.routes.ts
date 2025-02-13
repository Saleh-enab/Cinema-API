import { Router } from "express";
import { validate } from "../middlewares/validateResources";
import { customerSchema } from "../schemas/customer.schema";
import { signUp, login, logout, getCustomerProfile, deleteCustomerProfile } from "../controllers/customer.controller";
import { loginSchema } from "../schemas/login.schema";
import { authorizeUser, generateNewToken } from "../middlewares/authorization";

export const customerRouter = Router();

customerRouter.post('/sign-up', validate(customerSchema), signUp)

customerRouter.post('/login', validate(loginSchema), login)

customerRouter.get('/logout', logout)

customerRouter.get('/profile/:id', authorizeUser, getCustomerProfile)

customerRouter.delete('/profile/:id', authorizeUser, deleteCustomerProfile)

customerRouter.post('/token', generateNewToken)
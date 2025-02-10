import { Router } from "express";
import { validate } from "../middlewares/validateResources";
import { customerSchema } from "../schemas/customer.schema";
import { signUp, login, allCustomers } from "../controllers/customer.controller";
import { loginSchema } from "../schemas/login.schema";

export const customerRouter = Router();

customerRouter.post('/sign-up', validate(customerSchema), signUp)

customerRouter.post('/login', validate(loginSchema), login)

customerRouter.get('/', allCustomers)
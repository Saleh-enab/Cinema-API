import { Router } from "express";
import { validate } from "../middlewares/validateResources";
import { customerSchema } from "../schemas/customer.schema";
import { createCustomer } from "../controllers/customer.controller";

export const customerRouter = Router();

customerRouter.post('/signUp', validate(customerSchema), createCustomer)
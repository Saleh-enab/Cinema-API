import { Router } from "express";
import { getCustomerProfile, deleteCustomerProfile } from "../controllers/customer.controller";
import { authorizeUser } from "../middlewares/authorization";


export const customerRouter = Router();

customerRouter.get('/profile/:id', authorizeUser, getCustomerProfile)

customerRouter.delete('/profile/:id', authorizeUser, deleteCustomerProfile)
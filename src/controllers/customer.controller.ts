import db from "../db";
import { CustomError } from "../utils/customError";
import { NextFunction, Request, Response } from "express";


export const getCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = req.params.id
        const customer = await db.customer.findUnique({
            where: {
                id: customerId
            },
            omit: {
                password: true,
                id: true,
            }
        })
        if (!customer) {
            throw new CustomError(400, "Invalid customer id", "CLIENT ERROR")
        }
        if (customerId !== req.customer.id) {
            throw new CustomError(400, "You are not authorized to access this customer's data.", "AUTHORIZATION ERROR")
        }
        res.json({
            customerData: customer
        })
    } catch (err: unknown) {
        if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"))
            return;
        } else {
            next(new CustomError(500, "Customer profile fetching error", "SERVER ERROR"))
            return;
        }
    }
}

export const deleteCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = req.params.id
        const customer = await db.customer.findUnique({
            where: {
                id: customerId
            }
        })
        if (!customer) {
            throw new CustomError(400, "Invalid customer id", "CLIENT ERROR")
        }
        if (customerId !== req.customer.id) {
            throw new CustomError(400, "You are not authorized to access this customer's account.", "AUTHORIZATION ERROR")
        }
        await db.customer.delete({
            where: {
                id: customer.id
            }
        })
        res.json({
            message: "Customer account has been deleted successfully"
        })
    } catch (err: unknown) {
        if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"))
            return;
        } else {
            next(new CustomError(500, "Customer profile deletion error", "SERVER ERROR"))
            return;
        }
    }
}
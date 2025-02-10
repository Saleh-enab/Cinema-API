import { NextFunction, Request, Response } from "express";
import db from "../db";
import { CustomError } from "../types/customError";
import { hashPassword } from "../middlewares/hashPassword";

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, dateOfBirth, phone, password } = req.body;
        const hashedPassword = await hashPassword(password);
        const [day, month, year] = dateOfBirth.split("/").map(Number);
        const formattedDOB = new Date(`${year}-${month}-${day}`);
        await db.customer.create({
            data: {
                name,
                email,
                dateOfBirth: formattedDOB,
                phone,
                password: hashedPassword
            }
        })
        res.sendStatus(201);
    }
    catch (err: unknown) {
        if (err instanceof CustomError) {
            next(new CustomError(500, err.message));
        } else {
            next(new CustomError(500, "An unknown error occurred"));
        }
    }
}
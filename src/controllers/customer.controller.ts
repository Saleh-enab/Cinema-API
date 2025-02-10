import db from "../db";
import { CustomError } from "../types/customError";
import { hashPassword, validatePassword } from "../middlewares/passwords";
import { createAccessToken } from "../middlewares/tokens";
import env from "../env";
import { SignUpMiddleware } from "../schemas/customer.schema";
import { LoginMiddleware } from "../schemas/login.schema";
import { NextFunction, Request, Response } from "express";

export const signUp: SignUpMiddleware = async (req, res, next) => {
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
        if (err instanceof Error) {
            return next(new CustomError(500, err.message, "USER CREATION ERROR"));
        } else {
            return next(new CustomError(500, "An unknown error occurred", "USER CREATION ERROR"));
        }
    }
}

export const login: LoginMiddleware = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const customer = await db.customer.findUnique({ where: { email } });

        if (!customer || !(await validatePassword(password, customer.password))) {
            res.status(400).json({
                validUser: false,
                message: "Wrong email or password"
            });
            return
        }

        const accessToken = createAccessToken(
            { id: customer.id, email: customer.email },
            { expiresIn: env.ACCESS_TOKEN_TTL }
        );

        if (accessToken instanceof CustomError) {
            return next(accessToken);
        }

        res.json({
            validUser: true,
            token: accessToken,
            expiresIn: env.ACCESS_TOKEN_TTL
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return next(new CustomError(500, err.message, "SERVER ERROR"));
        } else {
            return next(new CustomError(500, "An unknown error occurred", "SERVER ERROR"));
        }
    }

};

export const allCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customers = await db.customer.findMany({
            omit: {
                password: true
            }
        })
        res.json({
            length: customers.length,
            customers
        })
        return;
    } catch (err: unknown) {
        if (err instanceof Error) {
            return next(new CustomError(500, err.message, "FETCHING ALL CUSTOMERS ERROR"));
        } else {
            return next(new CustomError(500, "An unknown error occurred", "SERVER ERROR"));
        }
    }
}
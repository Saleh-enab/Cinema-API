import db from "../db";
import { CustomError } from "../utils/customError";
import { hashPassword, validatePassword } from "../middlewares/passwords";
import { createToken } from "../middlewares/tokens";
import env from "../env";
import { SignUpMiddleware } from "../schemas/customer.schema";
import { LoginMiddleware } from "../schemas/login.schema";
import { NextFunction, Request, Response } from "express";

export const signUp: SignUpMiddleware = async (req, res, next) => {
    try {
        const { name, email, dateOfBirth, phone, password } = req.body;
        const oldCustomers = await db.customer.findUnique({
            where: {
                email
            }
        })
        if (oldCustomers) {
            throw new CustomError(400, "A customer with this email already exists.", "CLIENT ERROR")
        }
        const hashedPassword = await hashPassword(password);
        const [day, month, year] = dateOfBirth.split("/").map(Number);
        const formattedDOB = new Date(`${year}-${month}-${day}`);
        const customer = await db.customer.create({
            data: {
                name,
                email,
                dateOfBirth: formattedDOB,
                phone,
                password: hashedPassword
            }, omit: {
                password: true
            }
        })
        res.status(201).json({
            customerData: customer
        });
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

        const accessToken = createToken(
            { id: customer.id, email: customer.email },
            "accessToken",
            { expiresIn: env.ACCESS_TOKEN_TTL }
        );

        const refreshToken = createToken(
            { id: customer.id, email: customer.email },
            "refreshToken",
            { expiresIn: env.REFRESH_TOKEN_TTL }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true
        })

        res.json({
            validUser: true,
            accessToken: accessToken,
            refreshToken: refreshToken,
            accessTokenExpiresIn: env.ACCESS_TOKEN_TTL,
            refreshTokenExpiresIn: env.REFRESH_TOKEN_TTL
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return next(new CustomError(500, err.message, "SERVER ERROR"));
        } else {
            return next(new CustomError(500, "An unknown error occurred", "SERVER ERROR"));
        }
    }

};

export const logout = (req: Request, res: Response) => {
    res.clearCookie("refreshToken", { httpOnly: true });

    res.json({
        success: true,
        message: "Logged out successfully"
    });
}

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
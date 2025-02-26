import { NextFunction, Request, Response } from "express";
import db from "../db";
import env from "../env";
import { hashPassword, validatePassword } from "../middlewares/passwords";
import { createToken } from "../middlewares/tokens";
import { LoginMiddleware } from "../schemas/login.schema";
import { CustomError } from "../utils/customError";
import crypto from 'crypto';
import { sendMail } from "../middlewares/sendMail";
import { SignUpMiddleware } from "../schemas/customer.schema";
import OTP from 'otp-generator';


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
        let formattedDOB;
        if (dateOfBirth) {
            const [day, month, year] = dateOfBirth.split("/").map(Number);
            formattedDOB = new Date(`${year}-${month}-${day}`);
        }
        const customer = await db.customer.create({
            data: {
                name,
                email,
                dateOfBirth: formattedDOB || null,
                phone,
                password: hashedPassword,
                OTP: OTP.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false }),
                OTPExpiration: new Date(Date.now() + 10 * 60 * 1000)
            }, omit: {
                password: true
            }
        })
        await sendMail({
            recipient: customer.email,
            OTP: customer.OTP,
            customerName: customer.name,
            type: "emailVerification"
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

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const mailOTP = req.body.OTP
        const customerId = req.query.customerId as string
        const customer = await db.customer.findUnique({
            where: {
                id: customerId
            }
        })
        if (!customer) {
            throw new CustomError(400, "Invalid customer ID", "EMAIL VERIFICATION ERROR")
        }
        const customerOTP = customer?.OTP
        if (mailOTP === customerOTP && customer?.OTPExpiration && Date.now() < customer.OTPExpiration.getTime()) {
            await db.customer.update({
                where: { id: customer.id },
                data: {
                    verified: true,
                    OTP: null,
                    OTPExpiration: null,
                },
            });

            res.status(200).json({ message: "Email has been verified successfully." })
            return;
        } else {
            throw new CustomError(400, "Failed to verify the email", "EMAIL VERIFICATION ERROR")
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"))
        } else {
            next(new CustomError(500, "Email verfification error", "SERVER ERROR"))
        }
    }

}

export const generateNewOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = req.query.customerId as string
        const customer = await db.customer.update({
            where: { id: customerId },
            data: {
                OTP: OTP.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false }),
                OTPExpiration: new Date(Date.now() + 10 * 60 * 1000)
            }
        })
        sendMail({
            recipient: customer.email,
            OTP: customer.OTP,
            customerName: customer.name,
            type: "emailVerification"
        })
        res.status(200).json({
            message: "New OTP has been sent successfully"
        })
    } catch (err: unknown) {
        if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"))
            return;
        } else {
            next(new CustomError(500, "New OTP generation error", "SERVER ERROR"))
            return;
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
            { id: customer.id, email: customer.email, role: customer.role },
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

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body
        const customer = await db.customer.findUnique({ where: { email } })
        if (!customer) {
            throw new CustomError(400, "Customer account not found", "CLIENT ERROR")
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        await db.customer.update({
            where: { email },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpiration: new Date(Date.now() + 10 * 60 * 1000)
            }
        })
        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;
        await sendMail({
            recipient: customer.email,
            resetPasswordUrl: resetUrl,
            customerName: customer.name,
            type: "resetPassword"
        })
        res.status(200).json({
            message: "Password reset link has been sent to your email"
        })
    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(new CustomError(err.status, err.message, "SERVER ERROR"))
            return;
        }
        else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"))
            return;
        } else {
            next(new CustomError(500, "Forget password function error", "SERVER ERROR"))
            return;
        }
    }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { passwordToken, email, newPassword } = req.body;
        if (!passwordToken || !email || !newPassword) {
            throw new CustomError(400, "Invalid request", "CLIENT ERROR")
        }
        const hashedToken = crypto.createHash('sha256').update(passwordToken).digest('hex');
        const newHashedPassword = await hashPassword(newPassword);

        const updatedCustomer = await db.customer.updateMany({
            where: {
                email,
                resetPasswordToken: hashedToken,
                resetPasswordExpiration: { gt: new Date() },
            },
            data: {
                password: newHashedPassword,
                resetPasswordExpiration: null,
                resetPasswordToken: null,
            },
        });

        if (updatedCustomer.count === 0) {
            return next(new CustomError(400, "Invalid or expired token", "CLIENT ERROR"));
        }
        res.status(200).json({
            message: "Password has been updated successfully"
        })
    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(new CustomError(err.status, err.message, "SERVER ERROR"))
            return;
        }
        else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"))
            return;
        } else {
            next(new CustomError(500, "Forget password function error", "SERVER ERROR"))
            return;
        }
    }
}
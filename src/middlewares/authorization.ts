import { NextFunction, Response, Request, RequestHandler } from "express";
import { createToken, verifyToken } from "./tokens";
import { CustomError } from "../utils/customError";
import env from "../env";
import { JwtPayload } from "jsonwebtoken";
import { logger } from "./logger";
import { UserPayload } from "../types/userPayload";
import { UserRole } from "@prisma/client";

export const authorizeUser: RequestHandler = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1]

    if (!token) {
        return next(new CustomError(400, "No access token provided", "AUTHORIZATION ERROR"))
    }
    const decoded = verifyToken(token, "accessToken")

    if (!decoded.verified) {
        return next(new CustomError(403, "Access Token has been expired", "AUTHORIZATION ERROR"))
    }

    req.customer = decoded.data as UserPayload
    return next();
}

export const generateNewToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken
        const authHeader = req.headers["authorization"]
        const accessToken = authHeader?.split(" ")[1]
        if (!accessToken) {
            throw new CustomError(403, "Access token not provided, Customer must login", "AUTHORIZATION ERROR")
        }
        if (!refreshToken) {
            throw new CustomError(403, "Refresh token not provided", "AUTHORIZATION ERROR")
        }
        const accessDecoded = verifyToken(accessToken, "accessToken")

        if (!accessDecoded.verified && refreshToken) {
            const refreshDecoded = verifyToken(refreshToken, "refreshToken")
            if (!refreshDecoded.verified) {
                throw new CustomError(403, "Refresh token has been expired, Customer must login again.", "AUTHORIZATION ERROR")
            }
            const { id, email, role } = refreshDecoded.data as JwtPayload
            const newAccessToken = createToken({ id, email, role }, "accessToken", { expiresIn: env.ACCESS_TOKEN_TTL })
            res.setHeader("x-access-token", newAccessToken);
            req.accessToken = newAccessToken
            logger.info("New access token has been generated")
            res.status(200).json({
                message: "New access token has been generated"
            })
            return;
        }
        res.json({
            message: "Access token still valid, try to logout first."
        })
        return;

    }
    catch (err) {
        if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"))
        }
        else {
            next(new CustomError(500, "An unknown error has been occured", "SERVER ERROR"))
        }
    }
}

export const checkAdminRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.customer.role !== UserRole.ADMIN) {
            throw (new CustomError(403, "Only admins can do this action", "AUTHORIZATION ERROR"))
        }
        next();
    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(new CustomError(err.status, err.message, "AUTHORIZATION ERROR"))
            return;
        }
        else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"))
            return;
        } else {
            next(new CustomError(500, "An unknown error has been occured", "SERVER ERROR"))
            return;
        }
    }
}
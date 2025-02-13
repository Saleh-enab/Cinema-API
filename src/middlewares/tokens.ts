import jwt, { JwtPayload } from 'jsonwebtoken';
import env from '../env';
import { CustomError } from '../utils/customError';
import { logger } from './logger';

export const createToken = (data: object, type: "accessToken" | "refreshToken", options?: jwt.SignOptions | undefined): string => {
    try {
        if (type === "accessToken") {
            var key = env.ACCESS_TOKEN_PRIVATE_KEY
        } else {
            key = env.REFRESH_TOKEN_PRIVATE_KEY
        }
        const accessToken = jwt.sign(data, key, {
            ...options,
            algorithm: 'RS256',
        })
        return accessToken;
    }
    catch (err: unknown) {
        if (err instanceof Error) {
            throw new CustomError(500, err.message, "JWT ERROR")
        } else {
            throw new CustomError(500, "JWT token creation error", "JWT ERROR")
        }
    }
}


export const verifyToken = (token: string, type: "accessToken" | "refreshToken"): { verified: boolean, data: string | JwtPayload } => {
    try {
        if (type === "accessToken") {
            var key = env.ACCESS_TOKEN_PUBLIC_KEY
        } else {
            key = env.REFRESH_TOKEN_PUBLIC_KEY
        }
        const decoded = jwt.verify(token, key)
        return {
            verified: true,
            data: decoded
        }
    }
    catch (err: unknown) {
        if (err instanceof jwt.TokenExpiredError) {
            logger.error(`${err.message}, tokens.ts file - line 44`)
            return {
                verified: false,
                data: "No data provided"
            }
        } else if (err instanceof Error) {
            throw new CustomError(403, err.message, "JWT ERROR")
        } else {
            throw new CustomError(403, "JWT verfifcation error", "JWT ERROR")
        }
    }
}
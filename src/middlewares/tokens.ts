import jwt from 'jsonwebtoken';
import env from '../env';
import { CustomError } from '../types/customError';

export const createAccessToken = (data: object, options?: jwt.SignOptions | undefined): CustomError | string => {
    try {
        const accessToken = jwt.sign(data, env.ACCESS_TOKEN_PRIVATE_KEY, {
            ...options,
            algorithm: 'RS256',
        })
        return accessToken;
    }
    catch (err: unknown) {
        if (err instanceof Error) {
            return new CustomError(500, err.message, "JWT ERROR")
        } else {
            return new CustomError(500, "JWT token creation error", "JWT ERROR")
        }
    }
}


export const verifyToken = (token: string): CustomError | object => {
    try {
        const decoded = jwt.verify(token, env.ACCESS_TOKEN_PUBLIC_KEY)
        return {
            verified: true,
            data: decoded
        }
    }
    catch (err: unknown) {
        if (err instanceof Error) {
            return new CustomError(400, err.message, "JWT Error")
        } else {
            return new CustomError(400, "JWT token verification error", "JWT ERROR")
        }
    }

}
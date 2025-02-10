import { logger } from './logger'
import { CustomError } from "../types/customError";
import { NextFunction, Request, Response } from "express";

export const errorHandler = (err: CustomError, req: Request, res: Response, _next: NextFunction): void => {
    console.error(err);
    logger.error(err.message)
    res.status(err.status).json({
        errorType: err.type,
        status: err.status,
        message: err.message
    })
}
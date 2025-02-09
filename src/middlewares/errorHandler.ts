import { logger } from './logger'
import { CustomError } from "../types/customError";
import { Request, Response } from "express";

export const errorHandler = (err: CustomError, req: Request, res: Response): void => {
    console.error(err);
    logger.error(err.message)
    res.json({
        status: err.status,
        message: err.message
    })
}
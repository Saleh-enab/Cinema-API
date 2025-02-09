import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../types/customError";

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        })
        next();
    }
    catch (err: any) {
        next(new CustomError(400, err.message));
    }
}

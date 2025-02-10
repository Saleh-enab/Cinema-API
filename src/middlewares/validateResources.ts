import { ZodTypeAny } from "zod";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../types/customError";

export const validate = (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params
    })
    if (!result.success) {
        next(new CustomError(400, JSON.stringify(result.error.format())));
    }

    next();
}

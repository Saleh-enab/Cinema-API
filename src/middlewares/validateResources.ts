import z, { ZodEffects } from 'zod';
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../types/customError";
import { fromError } from "zod-validation-error";

type ZodRequestSchema<B, Q, P> = z.ZodObject<{ body?: z.ZodSchema<B>, query?: z.ZodSchema<Q>, params?: z.ZodSchema<P> }>

export const validate = <B, Q, P>(schema: ZodRequestSchema<B, Q, P> | ZodEffects<ZodRequestSchema<B, Q, P>>) => {
    return (req: Request<P, object, B, Q>, res: Response, next: NextFunction) => {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params
        })
        if (!result.success) {
            const formattedError = fromError(result.error).toString()
            return next(new CustomError(400, formattedError, "ZOD VALIDATION ERROR"));
        }
        req.body = (result.data.body ?? req.body) as B
        req.query = (result.data.query ?? req.query) as Q
        req.params = (result.data.params ?? req.params) as P

        next();
    }
}
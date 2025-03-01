import z from "zod";
import { validate } from "../middlewares/validateResources";

export const hallDataSchema = z.object({
    body: z.object({
        id: z.string()
            .regex(/^H\d{1,2}$/, { message: "Hall ID must start with 'H' followed by 1 or 2 digits (e.g., H5, H12)." })
    })

})

export const addHallValidator = validate(hallDataSchema)
export type AddHallMiddleware = typeof addHallValidator  
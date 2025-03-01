import z from "zod";

export const movieDataSchema = z.object({
    name: z.string(),
    genre: z.string(),
    description: z.string(),
    duration: z.string()
        .regex(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: "Invalid format. Use hh:mm:ss" }),
    year: z.string().length(4, { message: "Year must be 4 digits" }),
    rate: z.number()
        .min(0, { message: "Rate must be a positive number" })
        .max(10, { message: "Rate must be between 0 and 10" })
        .refine(value => /^\d+(\.\d)?$/.test(value.toString()), { message: "Rate must have at most 1 decimal place" })
        .optional()
})
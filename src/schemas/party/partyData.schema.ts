// partyData.schema.ts
import z from "zod";

export const partyDataSchema = z.object({
    movieId: z.string({
        required_error: "Movie ID is required"
    }),
    hallId: z.string({
        required_error: "Hall ID is required"
    }),
    startTime: z.string({
        required_error: "Start time is required"
    })
        .transform((val) => {
            // Attempt to parse the date
            const date = new Date(val);
            // Return the ISO string if valid, undefined if not
            return isNaN(date.getTime()) ? undefined : date.toISOString();
        })
        .refine((val) => val !== undefined, {
            message: "Invalid start time format. Please use YYYY-MM-DD HH:MM format or the date picker."
        }),
    endTime: z.string({
        required_error: "End time is required"
    })
        .transform((val) => {
            const date = new Date(val);
            return isNaN(date.getTime()) ? undefined : date.toISOString();
        })
        .refine((val) => val !== undefined, {
            message: "Invalid end time format. Please use YYYY-MM-DD HH:MM format or the date picker."
        }),
    ticketPrice: z.number({
        required_error: "Ticket price is required"
    }).positive("Ticket price must be positive").optional()
});

// Create a separate validation function for the date comparison
export const validateDates = (data: any) => {
    // Skip validation if either date is missing (for partial updates)
    if (!data.startTime || !data.endTime) return true;
    console.log(1)

    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    console.log(2)
    return start < end;
};

// Full schema with refinement for create operations
export const fullPartyDataSchema = partyDataSchema.refine(validateDates, {
    message: "End time must be after start time",
    path: ["endTime"]
});

// Update schema with conditional refinement for partial updates
export const updatePartyDataSchema = partyDataSchema.partial().refine(
    validateDates,
    {
        message: "End time must be after start time",
        path: ["endTime"]
    }
);
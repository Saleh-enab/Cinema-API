import { z } from "zod";
import { validate } from "../../middlewares/validateResources";
import { updatePartyDataSchema } from "./partyData.schema";

export const updatePartySchema = z.object({
    params: z.object({
        id: z.string({
            required_error: "Party ID is required"
        })
    }),
    body: updatePartyDataSchema
});

export const updatePartyValidator = validate(updatePartySchema);
export type UpdatePartyMiddleware = typeof updatePartyValidator;
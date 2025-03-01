import { z } from "zod";
import { validate } from "../../middlewares/validateResources";
import { fullPartyDataSchema } from "./partyData.schema";

export const createPartySchema = z.object({
    body: fullPartyDataSchema
});

export const createPartyValidator = validate(createPartySchema);
export type CreatePartyMiddleware = typeof createPartyValidator;
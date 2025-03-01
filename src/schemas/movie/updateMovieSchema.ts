import { z } from 'zod';
import { validate } from '../../middlewares/validateResources';
import { movieDataSchema } from './movieData.schema';



export const updateMovieSchema = z.object({
    body: movieDataSchema.partial(),
    params: z.object({
        id: z.string()
    })
});


export const updateMovieValidator = validate(updateMovieSchema)
export type UpdateMovieMiddleware = typeof updateMovieValidator

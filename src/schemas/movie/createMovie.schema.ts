import { z } from 'zod';
import { validate } from '../../middlewares/validateResources';
import { movieDataSchema } from './movieData.schema';

export const createMovieSchema = z.object({
    body: movieDataSchema
});



export const createMovieValidator = validate(createMovieSchema)
export type CreateMovieMiddleware = typeof createMovieValidator
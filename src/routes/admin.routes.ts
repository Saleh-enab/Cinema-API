import { Router } from "express";
import { authorizeUser, checkAdminRole } from "../middlewares/authorization";
import { addHall, addMovie, createParty, deleteHall, deleteMovie, deleteParty, updateMovie, updateParty } from "../controllers/admin.controller";
import { validate } from "../middlewares/validateResources";
import { createMovieSchema } from "../schemas/movie/createMovie.schema";
import { updateMovieSchema } from "../schemas/movie/updateMovieSchema";
import { hallDataSchema } from "../schemas/hall.schema";
import { upload } from "../utils/cloudinary";
import { createPartySchema } from "../schemas/party/createParty.schema";
import { updatePartySchema } from "../schemas/party/updateParty.schema";

export const adminRouter = Router();

// Movie routes
adminRouter.post('/movies', authorizeUser, checkAdminRole, upload.single("image"), validate(createMovieSchema), addMovie);
adminRouter.patch('/movies/:id', authorizeUser, checkAdminRole, validate(updateMovieSchema), updateMovie);
adminRouter.delete('/movies/:id', authorizeUser, checkAdminRole, deleteMovie);

// Hall routes
adminRouter.post('/halls', authorizeUser, checkAdminRole, validate(hallDataSchema), addHall);
adminRouter.delete('/halls/:id', authorizeUser, checkAdminRole, deleteHall);

// Party routes
adminRouter.post('/parties', authorizeUser, checkAdminRole, validate(createPartySchema), createParty);
adminRouter.patch('/parties/:id', authorizeUser, checkAdminRole, validate(updatePartySchema), updateParty);
adminRouter.delete('/parties/:id', authorizeUser, checkAdminRole, deleteParty);

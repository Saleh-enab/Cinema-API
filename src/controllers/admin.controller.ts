import { CustomError } from "../utils/customError";
import db from "../db";
import { CreateMovieMiddleware } from "../schemas/movie/createMovie.schema";
import { UpdateMovieMiddleware } from "../schemas/movie/updateMovieSchema";
import { NextFunction, Request, Response } from "express";
import { AddHallMiddleware } from "../schemas/hall.schema";
import { uploadToCloudinary } from "../utils/cloudinary";
import { logger } from "../middlewares/logger";
import { CreatePartyMiddleware } from "../schemas/party/createParty.schema";
import { UpdatePartyMiddleware } from "../schemas/party/updateParty.schema";


export const addMovie: CreateMovieMiddleware = async (req, res, next) => {
    try {
        const { name, genre, description, duration, year, rate } = req.body
        const dublicatedMovie = await db.movie.findUnique({ where: { name } })
        if (dublicatedMovie) {
            throw new CustomError(400, "A movie with this the same already exists.", "ADMIN ERROR")
        }

        let imageId: string | null = null;
        if (req.file) {
            logger.info("Uploading image...");
            imageId = await uploadToCloudinary(req.file.buffer);
            logger.info("Upload successful:", imageId);
        }


        const movie = await db.movie.create({
            data: {
                name,
                genre,
                description,
                duration,
                year,
                rate,
                image: imageId
            }
        })
        res.status(201).json({
            movieData: movie
        })
        return;


    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(err);
            return;
        } else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"))
            return;
        } else {
            console.error(err)
            next(new CustomError(500, "Add movie function error", "SERVER ERROR"))
            return;
        }
    }
};

export const updateMovie: UpdateMovieMiddleware = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, genre, description, duration, year, rate } = req.body;

        // Check if movie exists
        const existingMovie = await db.movie.findUnique({
            where: { id }
        });

        if (!existingMovie) {
            throw new CustomError(404, "Movie not found", "ADMIN ERROR");
        }

        if (name && name !== existingMovie.name) {
            const duplicateMovie = await db.movie.findUnique({ where: { name } });
            if (duplicateMovie) {
                throw new CustomError(400, "A movie with this name already exists", "ADMIN ERROR");
            }
        }

        const updatedMovie = await db.movie.update({
            where: { id },
            data: {
                name,
                genre,
                description,
                duration,
                year,
                rate
            }
        });

        res.status(200).json({
            message: "Movie updated successfully",
            movieData: updatedMovie
        });

    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(err);
            return;
        } else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"));
            return;
        } else {
            next(new CustomError(500, "Update movie function error", "SERVER ERROR"));
            return;
        }
    }
};

export const deleteMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw new CustomError(400, "Movie id must be provided", "CLIENT ERROR")
        }
        const deletedMovie = await db.movie.deleteMany({
            where: {
                id
            }
        })
        if (deletedMovie.count === 0) {
            throw new CustomError(404, "There is no movies match this movie id", "CLIENT ERROR")
        }
        res.json({
            message: "Movie has been deleted successfully"
        })
        return;
    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(err);
            return;
        } else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"));
            return;
        } else {
            next(new CustomError(500, "Delete movie function error", "SERVER ERROR"));
            return;
        }
    }
};

export const addHall: AddHallMiddleware = async (req, res, next) => {
    try {
        const { id } = req.body;
        const hall = await db.hall.create({
            data: {
                id
            }
        })

        res.status(201).json({
            hallData: hall
        })
    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(err);
            return;
        } else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"));
            return;
        } else {
            next(new CustomError(500, "Update movie function error", "SERVER ERROR"));
            return;
        }
    }
};

export const deleteHall = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw new CustomError(400, "Hall id must be provided", "CLIENT ERROR")
        }
        const deletedHall = await db.hall.deleteMany({
            where: {
                id
            }
        })
        if (deletedHall.count === 0) {
            throw new CustomError(404, "There is no hall match this hall id", "CLIENT ERROR")
        }
        res.json({
            message: "Hall has been deleted successfully"
        })
        return;
    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(err);
            return;
        } else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"));
            return;
        } else {
            next(new CustomError(500, "Delete hall function error", "SERVER ERROR"));
            return;
        }
    }
};

export const createParty: CreatePartyMiddleware = async (req, res, next) => {
    try {
        const { movieId, hallId, startTime, endTime, ticketPrice } = req.body;

        // Check if movie exists
        const movie = await db.movie.findUnique({
            where: { id: movieId }
        });
        if (!movie) {
            throw new CustomError(404, "Movie not found", "ADMIN ERROR");
        }

        // Check if hall exists
        const hall = await db.hall.findUnique({
            where: { id: hallId }
        });
        if (!hall) {
            throw new CustomError(404, "Hall not found", "ADMIN ERROR");
        }

        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        // Check if hall is available during the requested time
        const overlappingParty = await db.party.findFirst({
            where: {
                hallId,
                OR: [
                    {
                        AND: [
                            { startTime: { lte: startDate } },
                            { endTime: { gt: startDate } }
                        ]
                    },
                    {
                        AND: [
                            { startTime: { lt: endDate } },
                            { endTime: { gte: endDate } }
                        ]
                    },
                    {
                        AND: [
                            { startTime: { gte: startDate } },
                            { endTime: { lte: endDate } }
                        ]
                    }
                ]
            }
        });

        if (overlappingParty) {
            throw new CustomError(400, "Hall is already booked during this time", "ADMIN ERROR");
        }

        // Create party
        const party = await db.party.create({
            data: {
                movieId,
                hallId,
                startTime: startDate,
                endTime: endDate,
                ticketPrice: ticketPrice || 80.0
            }
        });

        logger.info(`Party created with ID: ${party.id}`);
        res.status(201).json({
            message: "Party created successfully",
            partyData: party
        });
        return;

    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(err);
            return;
        } else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"));
            return;
        } else {
            next(new CustomError(500, "Create party function error", "SERVER ERROR"));
            return;
        }
    }
};

export const updateParty: UpdatePartyMiddleware = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { movieId, hallId, startTime, endTime, ticketPrice } = req.body;

        // Check if party exists
        const existingParty = await db.party.findUnique({
            where: { id }
        });

        if (!existingParty) {
            throw new CustomError(404, "Party not found", "ADMIN ERROR");
        }

        let startDate = existingParty.startTime;
        let endDate = existingParty.endTime;

        // If times are being updated, validate them
        if (startTime) {
            startDate = new Date(startTime);
        }
        if (endTime) {
            endDate = new Date(endTime);
        }

        // If movieId is provided, check if the movie exists
        if (movieId) {
            const movie = await db.movie.findUnique({
                where: { id: movieId }
            });
            if (!movie) {
                throw new CustomError(404, "Movie not found", "ADMIN ERROR");
            }
        }

        // If hallId is provided, check if the hall exists
        if (hallId) {
            const hall = await db.hall.findUnique({
                where: { id: hallId }
            });
            if (!hall) {
                throw new CustomError(404, "Hall not found", "ADMIN ERROR");
            }
        }

        // Check hall availability if hall or times are changed
        if (startTime || endTime || hallId) {
            const checkHallId = hallId || existingParty.hallId;
            const overlappingParty = await db.party.findFirst({
                where: {
                    id: { not: id }, // Exclude current party
                    hallId: checkHallId,
                    OR: [
                        {
                            AND: [
                                { startTime: { lte: startDate } },
                                { endTime: { gt: startDate } }
                            ]
                        },
                        {
                            AND: [
                                { startTime: { lt: endDate } },
                                { endTime: { gte: endDate } }
                            ]
                        },
                        {
                            AND: [
                                { startTime: { gte: startDate } },
                                { endTime: { lte: endDate } }
                            ]
                        }
                    ]
                }
            });

            if (overlappingParty) {
                throw new CustomError(400, "Hall is already booked during this time", "ADMIN ERROR");
            }
        }

        // Update party
        const updatedParty = await db.party.update({
            where: { id },
            data: {
                movieId,
                hallId,
                startTime: startDate,
                endTime: endDate,
                ticketPrice: ticketPrice !== undefined ? ticketPrice : undefined
            }
        });

        logger.info(`Party updated with ID: ${updatedParty.id}`);
        res.status(200).json({
            message: "Party updated successfully",
            partyData: updatedParty
        });
        return;

    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(err);
            return;
        } else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"));
            return;
        } else {
            next(new CustomError(500, "Update party function error", "SERVER ERROR"));
            return;
        }
    }
};

export const deleteParty = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new CustomError(400, "Party id must be provided", "CLIENT ERROR");
        }

        // Check if party exists and has reservations
        const partyWithReservations = await db.party.findUnique({
            where: { id },
            include: { Reservation: true }
        });

        if (!partyWithReservations) {
            throw new CustomError(404, "Party not found", "CLIENT ERROR");
        }

        // Check if party has reservations
        if (partyWithReservations.Reservation.length > 0) {
            throw new CustomError(400, "Cannot delete party with existing reservations", "ADMIN ERROR");
        }

        // Delete party
        const deletedParty = await db.party.delete({
            where: { id }
        });

        logger.info(`Party deleted with ID: ${deletedParty.id}`);
        res.status(200).json({
            message: "Party has been deleted successfully"
        });
        return;

    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(err);
            return;
        } else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"));
            return;
        } else {
            next(new CustomError(500, "Delete party function error", "SERVER ERROR"));
            return;
        }
    }
};


import db from "../db";
import { CustomError } from "../utils/customError";
import { NextFunction, Request, Response } from "express";


export const getCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = req.params.id
        const customer = await db.customer.findUnique({
            where: {
                id: customerId
            },
            omit: {
                password: true,
                id: true,
            }
        })
        if (!customer) {
            throw new CustomError(400, "Invalid customer id", "CLIENT ERROR")
        }
        if (customerId !== req.customer.id) {
            throw new CustomError(400, "You are not authorized to access this customer's data.", "AUTHORIZATION ERROR")
        }
        res.json({
            customerData: customer
        })
    } catch (err: unknown) {
        if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"))
            return;
        } else {
            next(new CustomError(500, "Customer profile fetching error", "SERVER ERROR"))
            return;
        }
    }
};
export const deleteCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = req.params.id
        const customer = await db.customer.findUnique({
            where: {
                id: customerId
            }
        })
        if (!customer) {
            throw new CustomError(400, "Invalid customer id", "CLIENT ERROR")
        }
        if (customerId !== req.customer.id) {
            throw new CustomError(400, "You are not authorized to access this customer's account.", "AUTHORIZATION ERROR")
        }
        await db.customer.delete({
            where: {
                id: customer.id
            }
        })
        res.json({
            message: "Customer account has been deleted successfully"
        })
    } catch (err: unknown) {
        if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"))
            return;
        } else {
            next(new CustomError(500, "Customer profile deletion error", "SERVER ERROR"))
            return;
        }
    }
};

export const getAllMovies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.query;
        const currentDate = new Date();

        const movies = await db.movie.findMany({
            where: name ? {
                name: {
                    contains: String(name),
                    mode: 'insensitive'
                }
            } : undefined,
            include: {
                Party: {
                    where: {
                        startTime: {
                            gte: currentDate
                        }
                    },
                    include: {
                        hall: true
                    },
                    orderBy: {
                        startTime: 'asc'
                    }
                }
            }
        });

        // Map movies to include only relevant data and format dates for parties
        const formattedMovies = movies.map(movie => ({
            id: movie.id,
            name: movie.name,
            genre: movie.genre,
            description: movie.description,
            duration: movie.duration,
            year: movie.year,
            rate: movie.rate,
            image: movie.image,
            availableParties: movie.Party.map(party => ({
                id: party.id,
                startTime: party.startTime,
                endTime: party.endTime,
                ticketPrice: party.ticketPrice,
                hallId: party.hallId,
                hallName: party.hall.id
            }))
        }));

        res.status(200).json({
            movies: formattedMovies,
            count: formattedMovies.length
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"));
            return;
        } else {
            next(new CustomError(500, "Error fetching movies", "SERVER ERROR"));
            return;
        }
    }
};

export const getMovieById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const currentDate = new Date();

        const movie = await db.movie.findUnique({
            where: {
                id
            },
            include: {
                Party: {
                    where: {
                        startTime: {
                            gte: currentDate
                        }
                    },
                    include: {
                        hall: true
                    },
                    orderBy: {
                        startTime: 'asc'
                    }
                }
            }
        });

        if (!movie) {
            throw new CustomError(404, "Movie not found", "CLIENT ERROR");
        }

        // Format response
        const formattedMovie = {
            id: movie.id,
            name: movie.name,
            genre: movie.genre,
            description: movie.description,
            duration: movie.duration,
            year: movie.year,
            rate: movie.rate,
            image: movie.image,
            availableParties: movie.Party.map(party => ({
                id: party.id,
                startTime: party.startTime,
                endTime: party.endTime,
                ticketPrice: party.ticketPrice,
                hallId: party.hallId,
                hallName: party.hall.id
            }))
        };

        res.status(200).json({
            movie: formattedMovie
        });
    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(new CustomError(500, err.message, "SERVER ERROR"))
            return;
        } else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"));
            return;
        } else {
            next(new CustomError(500, "Error fetching movie details", "SERVER ERROR"));
            return;
        }
    }
};

export const reserveParty = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { partyId, seatId } = req.body;
        const customerId = req.customer.id;

        // Validate required fields
        if (!partyId || !seatId) {
            throw new CustomError(400, "Party ID and seat ID are required", "CLIENT ERROR");
        }

        // Check if party exists and is in the future
        const party = await db.party.findUnique({
            where: { id: partyId },
            include: { hall: true }
        });

        if (!party) {
            throw new CustomError(404, "Party not found", "CLIENT ERROR");
        }

        // Check if party is in the future
        const currentDate = new Date();
        if (party.startTime <= currentDate) {
            throw new CustomError(400, "Cannot reserve for a past or ongoing party", "CLIENT ERROR");
        }

        // Check if seat exists and belongs to the party's hall
        const seat = await db.seat.findUnique({
            where: { id: seatId }
        });

        if (!seat) {
            throw new CustomError(404, "Seat not found", "CLIENT ERROR");
        }

        if (seat.hallId !== party.hallId) {
            throw new CustomError(400, "The selected seat does not belong to the party's hall", "CLIENT ERROR");
        }

        // Check if seat is already reserved for this party
        const existingReservation = await db.reservation.findFirst({
            where: {
                partyId,
                seatId
            }
        });

        if (existingReservation) {
            throw new CustomError(400, "This seat is already reserved for this party", "CLIENT ERROR");
        }

        // Create the reservation
        const reservation = await db.reservation.create({
            data: {
                customerId,
                partyId,
                seatId
            },
            include: {
                party: {
                    include: {
                        movie: true,
                        hall: true
                    }
                },
                seat: true
            }
        });

        // Format the response
        const formattedReservation = {
            id: reservation.id,
            movieName: reservation.party.movie.name,
            hallName: reservation.party.hall.id,
            seat: `${reservation.seat.row}${reservation.seat.seatNumber}`,
            startTime: reservation.party.startTime,
            endTime: reservation.party.endTime,
            ticketPrice: reservation.party.ticketPrice,
            reservedAt: reservation.createdAt
        };

        res.status(201).json({
            message: "Seat reserved successfully",
            reservation: formattedReservation
        });
    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(new CustomError(500, err.message, "SERVER ERROR"))
            return;
        } else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"));
            return;
        } else {
            next(new CustomError(500, "Error reserving seat", "SERVER ERROR"));
            return;
        }
    }
};

export const getCustomerReservations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = req.customer.id;

        const reservations = await db.reservation.findMany({
            where: {
                customerId
            },
            include: {
                party: {
                    include: {
                        movie: true,
                        hall: true
                    }
                },
                seat: true
            },
            orderBy: {
                party: {
                    startTime: 'asc'
                }
            }
        });

        // Format the response
        const formattedReservations = reservations.map(reservation => ({
            id: reservation.id,
            movieName: reservation.party.movie.name,
            movieImage: reservation.party.movie.image,
            hallName: reservation.party.hall.id,
            seat: `${reservation.seat.row}${reservation.seat.seatNumber}`,
            startTime: reservation.party.startTime,
            endTime: reservation.party.endTime,
            ticketPrice: reservation.party.ticketPrice,
            reservedAt: reservation.createdAt
        }));

        res.status(200).json({
            reservations: formattedReservations,
            count: formattedReservations.length
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"));
            return;
        } else {
            next(new CustomError(500, "Error fetching reservations", "SERVER ERROR"));
            return;
        }
    }
};

export const cancelReservation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reservationId } = req.params;
        const customerId = req.customer.id;

        // Find the reservation
        const reservation = await db.reservation.findUnique({
            where: { id: reservationId },
            include: {
                party: true
            }
        });

        if (!reservation) {
            throw new CustomError(404, "Reservation not found", "CLIENT ERROR");
        }

        // Check if the reservation belongs to the customer
        if (reservation.customerId !== customerId) {
            throw new CustomError(403, "You are not authorized to cancel this reservation", "AUTHORIZATION ERROR");
        }

        // Check if the party has not started yet (e.g., allow cancellation up to 2 hours before)
        const currentDate = new Date();
        const timeDiff = reservation.party.startTime.getTime() - currentDate.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff < 2) {
            throw new CustomError(400, "Reservations can only be cancelled at least 2 hours before the party starts", "CLIENT ERROR");
        }

        // Delete the reservation
        await db.reservation.delete({
            where: { id: reservationId }
        });

        res.status(200).json({
            message: "Reservation cancelled successfully"
        });
    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(err);
            return;
        } else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"));
            return;
        } else {
            next(new CustomError(500, "Error cancelling reservation", "SERVER ERROR"));
            return;
        }
    }
};

export const getAvailableSeats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { partyId } = req.params;

        // Check if party exists
        const party = await db.party.findUnique({
            where: { id: partyId },
            include: { hall: true }
        });

        if (!party) {
            throw new CustomError(404, "Party not found", "CLIENT ERROR");
        }

        // Get all seats in the hall
        const allSeats = await db.seat.findMany({
            where: { hallId: party.hallId }
        });

        // Get reserved seats for this party
        const reservedSeats = await db.reservation.findMany({
            where: { partyId },
            select: { seatId: true }
        });

        const reservedSeatIds = reservedSeats.map(r => r.seatId);

        // Filter out reserved seats
        const availableSeats = allSeats
            .filter(seat => !reservedSeatIds.includes(seat.id))
            .map(seat => ({
                id: seat.id,
                row: seat.row,
                seatNumber: seat.seatNumber,
                display: `${seat.row}${seat.seatNumber}`
            }));

        res.status(200).json({
            hallId: party.hallId,
            availableSeats,
            totalSeats: allSeats.length,
            availableCount: availableSeats.length
        });
    } catch (err: unknown) {
        if (err instanceof CustomError) {
            next(err);
            return;
        } else if (err instanceof Error) {
            next(new CustomError(500, err.message, "SERVER ERROR"));
            return;
        } else {
            next(new CustomError(500, "Error fetching available seats", "SERVER ERROR"));
            return;
        }
    }
};
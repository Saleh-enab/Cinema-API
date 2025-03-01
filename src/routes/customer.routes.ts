import { Router } from "express";
import { getCustomerProfile, deleteCustomerProfile, getAllMovies, getMovieById, reserveParty, getCustomerReservations, cancelReservation, getAvailableSeats } from "../controllers/customer.controller";
import { authorizeUser } from "../middlewares/authorization";


export const customerRouter = Router();

// Profile routes
customerRouter.get('/profile/:id', authorizeUser, getCustomerProfile)
customerRouter.delete('/profile/:id', authorizeUser, deleteCustomerProfile)

// Movie routes
customerRouter.get('/movies', authorizeUser, getAllMovies)
customerRouter.get('/movies/:id', authorizeUser, getMovieById)

// Reservation routes
customerRouter.post('/reservations', authorizeUser, reserveParty)
customerRouter.get('/reservations', authorizeUser, getCustomerReservations)
customerRouter.delete('/reservations/:reservationId', authorizeUser, cancelReservation)

// Party routes
customerRouter.get('/parties/:partyId', authorizeUser, getAvailableSeats)
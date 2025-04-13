# Cinema API

A RESTful API for a cinema ticket booking system built with Express.js, TypeScript, and PostgreSQL.

## Overview

This Cinema API provides endpoints for user authentication, movie browsing, ticket reservation, seat selection, and admin functionalities for managing theaters and movie screenings.

## Technology Stack

- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Documentation**: Swagger/OpenAPI
- **Email Service**: Nodemailer
- **File Upload**: Cloudinary
- **Validation**: Zod
- **Development Tools**: ESLint, Prettier

## Features

### Authentication
- User registration with email verification via OTP
- Login/Logout functionality
- Password reset
- JWT-based authentication with token refresh

### Customer Features
- Browse available movies
- View movie details
- Browse available screenings
- Reserve tickets for movie screenings
- Select available seats
- View reservation history
- Cancel reservations

### Admin Features
- Manage movies (CRUD operations)
- Manage theater halls
- Create and manage movie screenings/parties
- Upload movie images to Cloudinary

## Project Structure

```
Cinema API/
├── prisma/                 # Database schema and migrations
├── src/
│   ├── controllers/        # Route handlers
│   ├── middlewares/        # Auth, validation middleware
│   ├── routes/             # API routes
│   ├── schemas/            # Validation schemas
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── app.ts              # Express app setup
│   ├── env.ts              # Environment variables
│   └── db.ts               # Database connection
├── emailTemplates/         # Email templates
├── swagger.yaml            # API documentation
├── .env                    # Environment variables
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Cloudinary account (for image uploads)
- SMTP email service

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cinema-api.git
cd cinema-api
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```
# Create a .env file with the following variables
DATABASE_URL="postgresql://user:password@localhost:5432/cinema"
JWT_SECRET="your-jwt-secret"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
EMAIL_SERVICE="your-email-service"
EMAIL_USER="your-email"
EMAIL_PASS="your-email-password"
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

5. Start the development server:
```bash
pnpm run dev
```

### API Documentation

The API is documented using Swagger/OpenAPI. Once the server is running, you can access the documentation at:
```
http://localhost:3000/api-docs
```

## Scripts

- `pnpm run build` - Build the project
- `pnpm run start` - Start the production server
- `pnpm run dev` - Start the development server with hot reload
- `pnpm run studio` - Open Prisma Studio to explore the database
- `pnpm run format` - Format code with Prettier

## Database Schema

The database includes models for:
- Customer - User management
- Movie - Movie details
- Party - Movie screening events
- Hall - Theater halls
- Seat - Individual seats in halls
- Reservation - Ticket bookings

## License

This project is licensed under the ISC License.

## Author

Saleh Enab

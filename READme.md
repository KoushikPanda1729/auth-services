# Auth Service

This service is a part of a microservices architecture and is responsible for handling authentication and authorization.

## Features

- User registration and login
- Token-based authentication (e.g., JWT)
- Role-based access control
- Password hashing and validation
- Token refresh and expiration handling

## Technologies

- **Backend**: [Your backend framework, e.g., Node.js, Express]
- **Database**: [Your database, e.g. PostgreSQL]
- **Authentication**: JSON Web Tokens (JWT), OAuth2

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` file:
   ```env
   PORT=3000
   DATABASE_URL=<your-database-url>
   JWT_SECRET=<your-secret-key>
   ```
4. Start the service:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /register` - Register a new user
- `POST /login` - Authenticate user and return token
- `GET /self` - Get user profile (requires authentication)
- `POST /refresh-token` - Refresh authentication token
- `POST /logout` - logout user

## Work in Progress

This project is currently under development. Some features may not be fully implemented or stable. Contributions and feedback are welcome to help improve the service.

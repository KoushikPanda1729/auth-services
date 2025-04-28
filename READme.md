# 🚀 Auth Services

A simple and efficient authentication service built with **Node.js, TypeScript, and Express**, using **TypeORM** for database management.

## 📌 Features

- User authentication (Register, Login, Logout)
- Password hashing with **bcrypt**
- Input validation using **express-validator**
- Structured logging with **winston**
- Environment-based configurations using **dotenv**
- Database management with **TypeORM** and **PostgreSQL**
- Linting and formatting with **ESLint** & **Prettier**
- Docker support for easy deployment

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/KoushikPanda1729/auth-services.git
cd auth-services
```

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Setup Environment Variables

Copy `.env.dev` to `.env` and configure the variables.

### 4️⃣ Run the Development Server

```sh
npm run dev
```

## 🧪 Running Tests

Run unit tests using Jest:

```sh
npm test
```

## 📜 Scripts

| Command        | Description                        |
| -------------- | ---------------------------------- |
| `npm run dev`  | Start development server (nodemon) |
| `npm start`    | Start production server            |
| `npm run lint` | Lint code with ESLint              |
| `npm run test` | Run tests with Jest                |

💡 _Built with ❤️ by [Koushik Panda](https://github.com/KoushikPanda1729)_

## 🛠️ Future Enhancements

- Implement OAuth2.0 for third-party authentication.
- Add support for multi-factor authentication (MFA).
- Enhance API documentation with tools like Swagger.
- Introduce rate limiting to prevent abuse.
- Add integration tests for end-to-end validation.
- Improve error handling and monitoring with tools like Sentry.
- Expand database support to include MySQL and MongoDB.

Stay tuned for more updates!

## 🚧 In Progress

This README is a work in progress. More details and updates will be added soon!

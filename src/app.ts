import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { logger } from "./config/logger";
import authRouter from "./routes/auth.route";
import "reflect-metadata";

const app = express();

app.use("/auth", authRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: [
      {
        type: err.name,
        message: err.message,
        path: "",
        location: "",
      },
    ],
  });
});

export default app;

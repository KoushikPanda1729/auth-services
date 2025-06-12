import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { HttpError } from "http-errors";
import { logger } from "./config/logger";
import authRouter from "./routes/auth.route";
import "reflect-metadata";
import cookieParser from "cookie-parser";
import tenantRouter from "./routes/tenant.route";
import userRouter from "./routes/user.route";
import cors from "cors";
import { Config } from "./config";
const app = express();

app.use(express.static("public", { dotfiles: "allow" }));
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: Config.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.statusCode || err.status || 500;
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
}) as unknown as RequestHandler);

export default app;

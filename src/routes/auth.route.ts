import { Router, Response, Request, NextFunction } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { logger } from "../config/logger";

const authRouter = Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);
authRouter.post(
  "/register",
  (req: Request, res: Response, next: NextFunction) =>
    authController.resgister(req, res, next)
);

export default authRouter;

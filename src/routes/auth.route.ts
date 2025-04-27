import { NextFunction, Request, Response, Router } from "express";
import { AppDataSource } from "../config/data-source";
import { logger } from "../config/logger";
import { AuthController } from "../controllers/AuthController";
import { User } from "../entity/User";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import registerValidator from "../validator/registerValidator";
import { RefreshToken } from "../entity/RefreshToken";
import loginValidator from "../validator/loginValidator";
import { CredentialsService } from "../services/CredentialsService";

const authRouter = Router();

const userRepository = AppDataSource.getRepository(User);
const tokenRepository = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);
const tokenService = new TokenService(tokenRepository);
const credentialsService = new CredentialsService();
const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credentialsService
);
authRouter.post(
  "/register",
  registerValidator,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.register(req, res, next);
  }
);
authRouter.post(
  "/login",
  loginValidator,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.login(req, res, next);
  }
);

export default authRouter;

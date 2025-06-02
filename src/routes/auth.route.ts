import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from "express";
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
import authenticate from "../../middlewares/authenticate";
import { IAuthRequest } from "../types";
import validateRefreshToken from "../../middlewares/validateRefreshToken";
import parseRefreshToken from "../../middlewares/parseRefreshToken";

const authRouter = Router();

const userRepository = AppDataSource.getRepository(User);
const tokenRepository = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);
const tokenService = new TokenService(tokenRepository, logger);
const credentialsService = new CredentialsService();
const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credentialsService
);
authRouter.post("/register", registerValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await authController.register(req, res, next);
}) as RequestHandler);
authRouter.post("/login", loginValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await authController.login(req, res, next);
}) as RequestHandler);
authRouter.get("/self", authenticate, (async (req: Request, res: Response) => {
  await authController.self(req as IAuthRequest, res);
}) as RequestHandler);
authRouter.post("/refresh", validateRefreshToken, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await authController.refresh(req as IAuthRequest, res, next);
}) as RequestHandler);
authRouter.post("/logout", authenticate, parseRefreshToken, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await authController.logout(req as IAuthRequest, res, next);
}) as RequestHandler);

export default authRouter;

import {
  NextFunction,
  Request,
  Response,
  Router,
  RequestHandler,
} from "express";
import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import { logger } from "../config/logger";
import authenticate from "../../middlewares/authenticate";
import { canAccess } from "../../middlewares/canAccess";
import { roles } from "../constants";
import listUsersValidator from "../validator/list-users-validator";

const tenantRouter = Router();
const userRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(userRepository);
const tenantController = new TenantController(tenantService, logger);

tenantRouter.post("/", authenticate, canAccess([roles.ADMIN]), (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await tenantController.create(req, res, next);
}) as RequestHandler);

tenantRouter.get("/", listUsersValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await tenantController.getAll(req, res, next);
}) as RequestHandler);

tenantRouter.patch("/:id", authenticate, listUsersValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await tenantController.update(req, res, next);
}) as RequestHandler);
tenantRouter.get("/:id", authenticate, listUsersValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await tenantController.getOne(req, res, next);
}) as RequestHandler);

tenantRouter.delete("/:id", authenticate, listUsersValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await tenantController.deleteOne(req, res, next);
}) as RequestHandler);

tenantRouter.delete("/", authenticate, listUsersValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await tenantController.deleteAll(req, res, next);
}) as RequestHandler);

export default tenantRouter;

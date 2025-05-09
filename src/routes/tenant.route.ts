import { NextFunction, Request, Response, Router } from "express";
import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import { logger } from "../config/logger";
import authenticate from "../../middlewares/authenticate";
import { canAccess } from "../../middlewares/canAccess";
import { roles } from "../constants";

const tenantRouter = Router();
const userRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(userRepository);
const tenantController = new TenantController(tenantService, logger);

tenantRouter.post(
  "/",
  authenticate,
  canAccess([roles.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    await tenantController.create(req, res, next);
  }
);

export default tenantRouter;

import { NextFunction, Response } from "express";
import { TenantService } from "../services/TenantService";
import { ICreateTenantReqest } from "../types";
import { Logger } from "winston";
export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger
  ) {}
  async create(req: ICreateTenantReqest, res: Response, next: NextFunction) {
    const { name, address } = req.body;
    try {
      const tenant = await this.tenantService.create({ name, address });
      this.logger.info("Tenant created successfully", { id: tenant.id });
      res.status(201).json({ id: tenant.id });
    } catch (error) {
      next(error);
    }
  }
}

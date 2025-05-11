import { NextFunction, Response, Request } from "express";
import { TenantService } from "../services/TenantService";
import { ICreateTenantReqest, TenantQueryParams } from "../types";
import { Logger } from "winston";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";
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

  async getAll(req: Request, res: Response, next: NextFunction) {
    const validatedQuery = matchedData(req, { onlyValidData: true });
    try {
      const [tenants, count] = await this.tenantService.getAll(
        validatedQuery as TenantQueryParams
      );

      this.logger.info("All tenant have been fetched");
      res.json({
        currentPage: validatedQuery.currentPage as number,
        perPage: validatedQuery.perPage as number,
        total: count,
        data: tenants,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { name, address } = (req as ICreateTenantReqest).body;
    const tenantId = req.params.id;
    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }
    this.logger.debug("Request for updating a tenant", req.body);

    try {
      await this.tenantService.update(Number(tenantId), {
        name,
        address,
      });

      this.logger.info("Tenant has been updated", { id: tenantId });

      res.json({ id: Number(tenantId) });
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;
    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }
    try {
      const tenant = await this.tenantService.getTenantById(Number(tenantId));
      res.json(tenant);
    } catch (error) {
      next(error);
    }
  }

  async deleteOne(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;
    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }
    try {
      const tenant = await this.tenantService.deleteTenantById(
        Number(tenantId)
      );
      res.json({ id: Number(tenantId), tenant: tenant });
    } catch (error) {
      next(error);
    }
  }

  async deleteAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await this.tenantService.deleteAllTenant();
      res.json(tenant);
    } catch (error) {
      next(error);
    }
  }
}

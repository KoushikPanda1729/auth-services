import { NextFunction, Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { UserService } from "../services/UserService";
import { IRequestBody, IUpdateUserRequest, UserQueryParams } from "../types";

export class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger
  ) {}

  async create(req: IRequestBody, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { firstName, lastName, gmail, password, role, tenantId } = req.body;
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        gmail,
        password,
        role,
        tenantId,
      });
      this.logger.info("User created successfully", { id: user.id });
      res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
    }
  }

  async update(req: IUpdateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { firstName, lastName, gmail, role, tenantId } = req.body;
    const userId = req.params.id;
    if (isNaN(Number(userId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }
    try {
      await this.userService.update(Number(userId), {
        firstName,
        lastName,
        gmail,
        role,
        tenantId,
      });
      this.logger.info("user has been updated", { id: userId });

      res.json({ id: Number(userId) });
    } catch (error) {
      next(error);
    }
  }
  async getSingleUser(
    req: IUpdateUserRequest,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.params.id;
    if (isNaN(Number(userId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }
    try {
      await this.userService.getUserById(Number(userId));
      this.logger.info("user has been updated", { id: userId });

      res.json({ id: Number(userId) });
    } catch (error) {
      next(error);
    }
  }
  async getAllUser(req: IUpdateUserRequest, res: Response, next: NextFunction) {
    const validatedQuery = matchedData(req, { onlyValidData: true });
    try {
      const [user, count] = await this.userService.getAlluser(
        validatedQuery as UserQueryParams
      );
      this.logger.info("All user fetched successfully", {});
      res.json({
        currentPage: validatedQuery.currentPage as number,
        perPage: validatedQuery.perPage as number,
        total: count,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteSingleUser(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id;
    if (isNaN(Number(userId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }
    try {
      const user = await this.userService.deleteUserById(Number(userId));
      this.logger.info("a user has been deleted", { id: userId });

      res.json({ id: Number(userId), user: user });
    } catch (error) {
      next(error);
    }
  }
  async deleteAllUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.deleteAllUser();
      this.logger.info("All user has been deleted");

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

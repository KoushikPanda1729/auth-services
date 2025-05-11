import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import { Logger } from "winston";
import { roles } from "../constants";
import { UserService } from "../services/UserService";
import { IRequestBody, IUpdateUserRequest } from "../types";
import createHttpError from "http-errors";

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
    const { firstName, lastName, gmail, password } = req.body;
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        gmail,
        password,
        role: roles.MANAGER,
      });
      this.logger.info("User created successfully", { id: user.id });
      res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
    }
  }

  async update(req: IUpdateUserRequest, res: Response, next: NextFunction) {
    console.log("4444444444444444444444444444444", req.body);

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
}

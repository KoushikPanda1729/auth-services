import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { Logger } from "winston";
import { roles } from "../constants";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import { IRequestBody } from "../types";

export class AuthController {
  public UserService: UserService;
  public logger: Logger;
  public tokenService: TokenService;
  constructor(
    userService: UserService,
    logger: Logger,
    tokenService: TokenService
  ) {
    this.UserService = userService;
    this.logger = logger;
    this.tokenService = tokenService;
  }
  async register(req: IRequestBody, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, gmail, password } = req.body;

    this.logger.debug("New user registered", {
      firstName,
      lastName,
      gmail,
      password: "**********",
    });
    try {
      const user = await this.UserService.create({
        firstName,
        lastName,
        gmail,
        password,
        role: roles.CUSTOMER,
      });
      this.logger.info("User register successfully", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };
      const accessToken = this.tokenService.generateAccessToken(payload);

      const token = await this.tokenService.persistsRefreshToken(user);

      const refreshToken = this.tokenService.genereateRefreshToken({
        ...payload,
        id: String(token.id),
      });
      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
      });
      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });
      res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }
}

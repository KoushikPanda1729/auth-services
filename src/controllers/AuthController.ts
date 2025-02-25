import fs from "fs";
import path from "path";
import { NextFunction, Response } from "express";
import { IRequestBody } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { roles } from "../constants";
import { validationResult } from "express-validator";
import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config";

export class AuthController {
  public UserService: UserService;
  public logger: Logger;
  constructor(userService: UserService, logger: Logger) {
    this.UserService = userService;
    this.logger = logger;
  }
  async register(req: IRequestBody, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, gmail, password, role } = req.body;

    this.logger.debug("New user registered", {
      firstName,
      lastName,
      gmail,
      password: "**********",
      role,
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
      let privateKey: Buffer;
      try {
        privateKey = fs.readFileSync(
          path.join(__dirname, "../../scripts/certs/privateKey.pem")
        );
      } catch {
        const error = createHttpError(
          500,
          "Error occured while reading a private key"
        );
        next(error);
        return;
      }
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };
      const accessToken = sign(payload, privateKey, {
        algorithm: "RS256",
        expiresIn: "1h",
        issuer: "Auth-services",
      });
      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
        algorithm: "HS256",
        expiresIn: "1y",
        issuer: "Auth-service",
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

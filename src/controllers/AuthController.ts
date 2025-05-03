import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { JwtPayload } from "jsonwebtoken";
import { Logger } from "winston";
import { roles } from "../constants";
import { CredentialsService } from "../services/CredentialsService";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import { IAuthRequest, IRequestBody } from "../types";

export class AuthController {
  public UserService: UserService;
  public logger: Logger;
  public tokenService: TokenService;
  public credentialsService: CredentialsService;

  constructor(
    userService: UserService,
    logger: Logger,
    tokenService: TokenService,
    credentialsService: CredentialsService
  ) {
    this.UserService = userService;
    this.logger = logger;
    this.tokenService = tokenService;
    this.credentialsService = credentialsService;
  }

  // Helper function to set cookies
  private setTokensInCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ) {
    res.cookie("accessToken", accessToken, {
      domain: "localhost",
      sameSite: true,
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      secure: true,
    });
    res.cookie("refreshToken", refreshToken, {
      domain: "localhost",
      sameSite: true,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: true,
    });
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
      this.logger.info("User registered successfully", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      const token = await this.tokenService.persistsRefreshToken(user);
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(token.id),
      });

      this.setTokensInCookies(res, accessToken, refreshToken);
      res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }

  async login(req: IRequestBody, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { gmail, password } = req.body;

    this.logger.debug("User login attempt", {
      gmail,
      password: "**********",
    });

    try {
      const user = await this.UserService.findByEmail(gmail);
      if (!user) {
        const err = createHttpError(400, "Email or password not matched");
        next(err);
        return;
      }

      const isPasswordCorrect = await this.credentialsService.comparePassword(
        password,
        user.password
      );
      if (!isPasswordCorrect) {
        const err = createHttpError(400, "Email or password not matched");
        next(err);
        return;
      }

      this.logger.info("User logged in successfully", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      const token = await this.tokenService.persistsRefreshToken(user);
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(token.id),
      });

      this.setTokensInCookies(res, accessToken, refreshToken);
      res.status(200).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }

  async self(req: IAuthRequest, res: Response) {
    const user = await this.UserService.findById(Number(req.auth.sub));
    res.json({ ...user, password: undefined });
  }

  async refresh(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: String(req.auth.sub),
        role: req.auth.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      const user = await this.UserService.findById(Number(req.auth.sub));
      if (!user) {
        const err = createHttpError(
          400,
          "User with this token could not be found"
        );
        next(err);
        return;
      }

      const token = await this.tokenService.persistsRefreshToken(user);

      const deleteRefreshToken = await this.tokenService.deleteRefreshToken(
        Number(req.auth.id)
      );
      if (!deleteRefreshToken) {
        const err = createHttpError(400, "Old refresh token not deleted");
        next(err);
        return;
      }

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(token.id),
      });

      this.setTokensInCookies(res, accessToken, refreshToken);
      this.logger.info("User has been refreshed", { id: user?.id });

      res.status(200).json({ ...user, password: undefined });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));
      res
        .clearCookie("refreshToken")
        .clearCookie("accessToken")
        .json({ success: true, message: "User logged out successfully" });
    } catch (error) {
      next(error);
      return;
    }
  }
}

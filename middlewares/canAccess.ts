import { NextFunction, Request, Response } from "express";
import { IAuthRequest } from "../src/types";
import createHttpError from "http-errors";

export const canAccess = (role: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as IAuthRequest;
    const roleFormToken = _req.auth.role;
    if (!role.includes(roleFormToken)) {
      const error = createHttpError(403, "You do not have enough permission");
      next(error);
      return;
    }
    next();
  };
};

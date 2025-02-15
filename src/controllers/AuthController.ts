import { Request, Response } from "express";

export class AuthController {
  resgister(req: Request, res: Response) {
    res.status(201).json();
  }
}

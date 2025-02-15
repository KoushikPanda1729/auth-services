import { Router, Response, Request } from "express";
import { AuthController } from "../controllers/AuthController";

const authRouter = Router();

const authController = new AuthController();
authRouter.post("/register", (req: Request, res: Response) =>
  authController.resgister(req, res)
);

export default authRouter;

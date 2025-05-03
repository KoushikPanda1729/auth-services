import { Request } from "express";
import { expressjwt } from "express-jwt";
import { Config } from "../src/config";
import { IAuthCookie } from "../src/types";

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ["HS256"],
  getToken(req: Request) {
    const { refreshToken } = req.cookies as IAuthCookie;

    return refreshToken;
  },
});

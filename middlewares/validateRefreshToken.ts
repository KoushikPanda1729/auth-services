import { expressjwt } from "express-jwt";
import { Config } from "../src/config";
import { Request } from "express";
import { IAuthCookie, IRefreshTokePayload } from "../src/types";
import { AppDataSource } from "../src/config/data-source";
import { RefreshToken } from "../src/entity/RefreshToken";
import { logger } from "../src/config/logger";

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ["HS256"],
  getToken(req: Request) {
    const { refreshToke } = req.cookies as IAuthCookie;
    return refreshToke;
  },
  isRevoked(req: Request, token) {
    console.log("===============", token);
    try {
      const refresTokenRepository = AppDataSource.getRepository(RefreshToken);
      const refreshToken = refresTokenRepository.findOne({
        where: {
          id: Number((token?.payload as IRefreshTokePayload)?.id),
          user: { id: Number(token?.payload.sub) },
        },
      });
      return refreshToken === null;
    } catch (error) {
      logger.error("Error while getting the refresh token", {
        id: (token?.payload as IRefreshTokePayload).id,
        error,
      });
      return true;
    }
  },
});

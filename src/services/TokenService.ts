import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import { Repository } from "typeorm";
import { Config } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { Logger } from "winston";

export class TokenService {
  constructor(
    private readonly TokenRepository: Repository<RefreshToken>,
    private readonly logger: Logger
  ) {}

  generateAccessToken(payload: JwtPayload) {
    let privateKey: string;
    if (!Config.PRIVATE_KEY) {
      const error = createHttpError(500, "Private key is missing");
      throw error;
    }
    try {
      privateKey = Config.PRIVATE_KEY;
      this.logger.info("Private key is set for signing JWT", {
        privateKey: privateKey,
      });
    } catch {
      const error = createHttpError(
        500,
        "Error occured while reading a private key"
      );
      throw error;
    }
    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      issuer: "Auth-services",
    });
    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "Auth-service",
      jwtid: String(payload.id),
    });

    return refreshToken;
  }

  async persistsRefreshToken(user: User) {
    const expireAt = 1000 * 60 * 60 * 24 * 365;

    const token = await this.TokenRepository.save({
      user: user,
      expireAt: new Date(Date.now() + expireAt),
    });
    return token;
  }

  async deleteRefreshToken(tokenId: number) {
    const isDeleteOldRefreshToken = await this.TokenRepository.delete({
      id: tokenId,
    });
    return isDeleteOldRefreshToken.affected === 1;
  }
}

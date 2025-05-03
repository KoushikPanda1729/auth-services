import fs from "fs";
import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import path from "path";
import { Repository } from "typeorm";
import { Config } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";

export class TokenService {
  constructor(private TokenRepository: Repository<RefreshToken>) {}

  generateAccessToken(payload: JwtPayload) {
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

  async deleteOldRefreshToken(tokenId: number) {
    const isDeleteOldRefreshToken = await this.TokenRepository.delete({
      id: tokenId,
    });
    return isDeleteOldRefreshToken.affected === 1;
  }
}

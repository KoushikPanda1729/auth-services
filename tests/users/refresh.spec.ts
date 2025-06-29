import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { isJwtValid } from "../../src/utils";
import AppDataSource from "../../src/config/data-source";

describe("POST /auth/refresh", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });
  const registerAndLogin = async () => {
    const userData = {
      firstName: "Koushik",
      lastName: "Panda",
      gmail: "test@example.com",
      password: "12345",
    };
    await request(app).post("/auth/register").send(userData);

    const response = await request(app).post("/auth/login").send({
      gmail: userData.gmail,
      password: userData.password,
    });
    interface Headers {
      ["set-cookie"]: string[];
    }
    const cookies =
      (response.headers as unknown as Headers)["set-cookie"] || [];
    let refreshToken: string | null = null;
    cookies.forEach((cookie) => {
      if (cookie.startsWith("refreshToken=")) {
        refreshToken = cookie.split(";")[0].split("=")[1];
      }
    });

    return { refreshToken, response };
  };

  describe("Given all fields for refresh token", () => {
    it("should return 200 and new tokens if refresh token is valid", async () => {
      const { refreshToken } = await registerAndLogin();

      expect(refreshToken).not.toBeNull();
      expect(isJwtValid(refreshToken)).toBeTruthy();

      const response = await request(app)
        .post("/auth/refresh")
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .send();

      expect(response.statusCode).toBe(200);
    });

    it("should return 401 if refresh token is missing", async () => {
      const response = await request(app).post("/auth/refresh").send();
      expect(response.statusCode).toBe(401);
    });

    it("should return 401 if refresh token is empty", async () => {
      const { refreshToken } = await registerAndLogin();

      expect(refreshToken).not.toBeNull();
      expect(isJwtValid(refreshToken)).toBeTruthy();

      const response = await request(app)
        .post("/auth/refresh")
        .set("Cookie", [`refreshToken=${""}`])
        .send();

      expect(response.statusCode).toBe(401);
    });

    it("should return 401 if refresh token is invalid", async () => {
      const { refreshToken } = await registerAndLogin();
      expect(refreshToken).not.toBe(null);
      const response = await request(app)
        .post("/auth/refresh")
        .set("Cookie", `refreshToken=${"not a refresh token"}`);
      expect(response.statusCode).toBe(401);
    });

    it("should return 401 if refresh token is not JWT", async () => {
      const res = await request(app)
        .post("/auth/refresh")
        .set("Cookie", [`refreshToken=random_string_not_jwt`])
        .send();

      expect(res.statusCode).toBe(401);
    });

    it("should return 401 if refresh token is tampered", async () => {
      const { refreshToken } = await registerAndLogin();

      const tamperedToken = (refreshToken ?? "").slice(0, -1) + "X";

      const res = await request(app)
        .post("/auth/refresh")
        .set("Cookie", [`refreshToken=${tamperedToken}`])
        .send();

      expect(res.statusCode).toBe(401);
    });
  });
});

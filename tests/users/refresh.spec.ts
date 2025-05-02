import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";

describe("GET /auth/refresh", () => {
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

  describe("Given all fields for login", () => {
    it("should return 200 status code", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        gmail: "test@123.com",
        password: "12345",
      };

      // Register the user
      await request(app).post("/auth/register").send(userData);

      // Login to get cookies
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ gmail: userData.gmail, password: userData.password });

      // Extract refresh token cookie
      const cookies: string[] | undefined = Array.isArray(
        loginRes.headers["set-cookie"]
      )
        ? loginRes.headers["set-cookie"]
        : [loginRes.headers["set-cookie"]].filter(Boolean);
      const refreshTokenCookie: string | undefined = Array.isArray(cookies)
        ? cookies.find((cookie) => cookie.startsWith("refreshToken"))
        : undefined;

      expect(refreshTokenCookie).toBeDefined(); // Sanity check

      // Send request with the refresh token cookie
      const refreshRes = await request(app)
        .post("/auth/refresh")
        .set("Cookie", refreshTokenCookie || "");

      expect(refreshRes.statusCode).toBe(200);
    });
  });
});

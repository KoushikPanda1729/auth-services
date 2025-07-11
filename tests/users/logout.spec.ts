import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { createJWKSMock, JWKSMock } from "mock-jwks";
import { roles } from "../../src/constants";
import AppDataSource from "../../src/config/data-source";

describe("POST /auth/logout", () => {
  let connection: DataSource;
  let jwks: JWKSMock;
  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:8000");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });
  afterEach(() => {
    jwks.stop();
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
    let accessToken: string | null = null;
    cookies.forEach((cookie) => {
      if (cookie.startsWith("refreshToken=")) {
        refreshToken = cookie.split(";")[0].split("=")[1];
      }
      if (cookie.startsWith("accessToken=")) {
        accessToken = cookie.split(";")[0].split("=")[1];
      }
    });

    return { refreshToken, accessToken };
  };

  it("should return 200 status code", async () => {
    const { refreshToken } = await registerAndLogin();

    const accessToken = jwks.token({ sub: String(1), role: roles.ADMIN });

    const response = await request(app)
      .post("/auth/logout")
      .set("Cookie", [
        `refreshToken=${refreshToken}`,
        `accessToken=${accessToken}`,
      ])
      .send();
    expect(response.statusCode).toBe(200);
  });

  it("should return 401 status code if your is not authenticated", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .set("Cookie", [`refreshToken=${""}`])
      .set("Cookie", [`accessToken=${""}`])
      .send();
    expect(response.statusCode).toBe(401);
  });

  it("should return 200 status code if user sucessfully logged out", async () => {
    const { refreshToken: loginRefreshToken } = await registerAndLogin();

    const accessToken = jwks.token({ sub: String(1), role: roles.ADMIN });

    const response = await request(app)
      .post("/auth/logout")
      .set("Cookie", [
        `refreshToken=${loginRefreshToken}`,
        `accessToken=${accessToken}`,
      ])
      .send();
    interface Header {
      "set-cookie": string[];
    }
    const cookies = (response.headers as unknown as Header)["set-cookie"] || [];
    let refreshToken: string | null = null;
    let acccessToken: string | null = null;
    cookies.forEach((cookie) => {
      if (cookie.startsWith("refreshToken=")) {
        refreshToken = cookie.split(";")[0].split("=")[1];
      }
      if (cookie.startsWith("accessToken=")) {
        acccessToken = cookie.split(";")[0].split("=")[1];
      }
    });
    expect(refreshToken).toBe("");
    expect(acccessToken).toBe("");
    expect(response.statusCode).toBe(200);
  });
});

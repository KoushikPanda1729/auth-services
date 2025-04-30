import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import request from "supertest";
import { createJWKSMock, JWKSMock } from "mock-jwks";
import { User } from "../../src/entity/User";
import { roles } from "../../src/constants";

describe("GET /auth/self", () => {
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

  describe("Given all fields for self", () => {
    it("should return 200 status code", async () => {
      const accessToken = jwks.token({ sub: String(1), role: roles.CUSTOMER });
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();
      expect(response.statusCode).toBe(200);
    });

    it("should return the user data", async () => {
      const userData = {
        firstName: "Koushik",
        lastName: "Panda",
        gmail: "test@123.com",
        password: "12345",
      };
      const userRepository = connection.getRepository(User);
      const user = await userRepository.save({
        ...userData,
        role: roles.CUSTOMER,
      });
      const accessToken = jwks.token({ sub: String(user.id), role: user.role });
      // Act
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();
      // Assert
      expect((response.body as Record<string, string>).id).toBe(user.id);
    });

    it("should not  return the user password", async () => {
      const userData = {
        firstName: "Koushik",
        lastName: "Panda",
        gmail: "test@123.com",
        password: "12345",
      };
      const userRepository = connection.getRepository(User);
      const user = await userRepository.save({
        ...userData,
        role: roles.CUSTOMER,
      });
      const accessToken = jwks.token({ sub: String(user.id), role: user.role });
      // Act
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();
      // Assert
      expect(response.body as Record<string, string>).not.toHaveProperty(
        "password"
      );
    });

    it("should return 401 status code if token does not exists", async () => {
      const response = await request(app).get("/auth/self").send();
      expect(response.statusCode).toBe(401);
    });
  });
});

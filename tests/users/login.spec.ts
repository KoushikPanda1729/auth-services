import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import request from "supertest";
import { User } from "../../src/entity/User";
import { isJwtValid } from "../../src/utils";

describe("POST /auth/login", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
    const userData = {
      firstName: "Koushik",
      lastName: "Panda",
      gmail: "test@123.com",
      password: "12345",
    };

    await request(app).post("/auth/register").send(userData);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields for login", () => {
    it("should return 200 status code", async () => {
      // AAA
      // Arrange
      const userData = {
        gmail: "test@123.com",
        password: "12345",
      };

      // Act
      const response = await request(app).post("/auth/login").send(userData);
      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return json data", async () => {
      // Arrange
      const userData = {
        gmail: "test@123.com",
        password: "12345",
      };

      // Act
      const response = await request(app).post("/auth/login").send(userData);
      // Assert
      expect(
        (response.headers as Record<string, string>)["content-type"]
      ).toEqual(expect.stringContaining("json"));
    });

    it("should return user id", async () => {
      const userData = {
        gmail: "test@123.com",
        password: "12345",
      };
      const response = await request(app).post("/auth/login").send(userData);
      const responseBody = response.body as { id: number };
      const userRepository = connection.getRepository(User);
      const user = await userRepository.findOne({
        where: { gmail: userData.gmail },
      });
      expect(user?.id).toBe(responseBody.id);
    });

    it("should set accessToken and refreshToken cookies", async () => {
      const userData = { gmail: "test@123.com", password: "12345" };
      const response = await request(app).post("/auth/login").send(userData);

      interface Headers {
        ["set-cookie"]: string[];
      }
      const cookies =
        (response.headers as unknown as Headers)["set-cookie"] || [];
      let accessToken = null;
      let refreshToken = null;
      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken=")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        }
        if (cookie.startsWith("refreshToken=")) {
          refreshToken = cookie.split(";")[0].split("=")[1];
        }
      });

      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();
      expect(isJwtValid(accessToken)).toBeTruthy();
      expect(isJwtValid(refreshToken)).toBeTruthy();
    });
  });
  describe("fields are missing", () => {
    it("Should return 400 status code if gmail is missing.", async () => {
      const userData = {
        gmail: "",
        password: "12345",
      };

      const response = await request(app).post("/auth/login").send(userData);
      expect(400).toBe(response.statusCode);
    });

    it("Should return 400 status code if invalid gmail", async () => {
      const userData = {
        gmail: "sffsdfsddf",
        password: "12345",
      };

      const response = await request(app).post("/auth/login").send(userData);
      expect(400).toBe(response.statusCode);
    });

    it("Should return 400 status code if password is missing.", async () => {
      const userData = {
        gmail: "test123@gmail.com",
        password: "",
      };

      const response = await request(app).post("/auth/login").send(userData);
      expect(400).toBe(response.statusCode);
    });

    it("should 404 if wrong password", async () => {
      // Arrange
      const userData = {
        gmail: "test@123.com",
        password: "12345asdsad",
      };

      // Act
      const response = await request(app).post("/auth/login").send(userData);
      // Assert
      expect(
        (response.headers as Record<string, string>)["content-type"]
      ).toEqual(expect.stringContaining("json"));
    });
  });
});

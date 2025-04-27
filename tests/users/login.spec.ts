import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import request from "supertest";

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
    it("should return 201 status code", async () => {
      // AAA
      // Arrange
      const userData = {
        gmail: "test@123.com",
        password: "12345",
      };

      // Act
      const response = await request(app).post("/auth/login").send(userData);
      // Assert
      expect(response.statusCode).toBe(201);
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

    // it("should return user", async () => {
    //   const userData = {
    //     gmail: "test@123.com",
    //     password: "12345",
    //   };
    //    const response = await request(app).post("/auth/login").send(userData);
    // });
  });
});

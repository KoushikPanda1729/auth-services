import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { roles } from "../../src/constants";

describe("POST /auth/register", () => {
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

  describe("Given all fields", () => {
    it("should return 201 status code", async () => {
      // AAA
      // Arrange
      const userData = {
        firstName: "Koushik",
        lastName: "panda",
        gmail: "test@123.com",
        password: "12345",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);
      // Assert
      expect(response.statusCode).toBe(201);
    });
    it("should return json data", async () => {
      // AAA
      // Arrange
      const userData = {
        firstName: "Koushik",
        lastName: "panda",
        gmail: "test@123.com",
        password: "12345",
      };
      // Act
      const response = await request(app).post("/auth/register").send(userData);
      // Assert
      expect(
        (response.headers as Record<string, string>)["content-type"]
      ).toEqual(expect.stringContaining("json"));
    });
    it("should should persists the users in database", async () => {
      // Arrange
      const userData = {
        firstName: "Koushik",
        lastName: "panda",
        gmail: "test@123.com",
        password: "12345",
      };
      // Act
      await request(app).post("/auth/register").send(userData);
      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].gmail).toBe(userData.gmail);
      expect(users[0].firstName).toBe("Koushik");
    });
    it("should persist the user in the database and return an id", async () => {
      const userData = {
        firstName: "Koushik",
        lastName: "Panda",
        gmail: "test@123.com",
        password: "12345",
      };
      // Act
      const response = await request(app).post("/auth/register").send(userData);
      const responseBody = response.body as { id: number };
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("id");
      const userRepository = connection.getRepository(User);
      const user = await userRepository.findOne({
        where: { gmail: userData.gmail },
      });
      expect(user).toBeDefined();
      expect(user?.id).toBe(responseBody.id);
    });
    it("should describe the role of users", async () => {
      const userData = {
        firstName: "Koushik",
        lastName: "panda",
        gmail: "test@123.com",
        password: "12345",
        role: "customer",
      };

      await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(roles.CUSTOMER);
    });
  });
  describe("fields are missing", () => {});
});

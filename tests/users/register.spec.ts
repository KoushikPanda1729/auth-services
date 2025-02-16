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

    it("should describe the hash of password", async () => {
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
      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/);
    });

    it("should describe email is already exists", async () => {
      // Arrange
      const userData = {
        firstName: "Koushik",
        lastName: "panda",
        gmail: "test@123.com",
        password: "12345",
        role: "customer",
      };

      // act
      const userRepository = connection.getRepository(User);
      await userRepository.save(userData);
      const response = await request(app).post("/auth/register").send(userData);
      const users = await userRepository.find();
      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });
  });

  describe("fields are missing", () => {
    it("Should return 400 status code if gmail is missing.", async () => {
      const userData = {
        firstName: "Koushik",
        lastName: "panda",
        gmail: "",
        password: "12345",
        role: "customer",
      };

      const response = await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(response.statusCode).toBe(400);
      expect(user).toHaveLength(0);
    });

    it("Should return 400 status code if firstName is missing", async () => {
      const userData = {
        firstName: "",
        lastName: "panda",
        gmail: " test@123gmail.com ",
        password: "12345",
        role: "customer",
      };

      const response = await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(response.statusCode).toBe(400);
      expect(user).toHaveLength(0);
    });
    it("Should return 400 status code if lastName is missing", async () => {
      const userData = {
        firstName: "Koushik",
        lastName: "",
        gmail: " test@123gmail.com ",
        password: "12345",
        role: "customer",
      };

      const response = await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(response.statusCode).toBe(400);
      expect(user).toHaveLength(0);
    });
    it("Should return 400 status code if password is missing", async () => {
      const userData = {
        firstName: "Koushik",
        lastName: "panda",
        gmail: " test@123gmail.com ",
        password: "",
        role: "customer",
      };

      const response = await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(response.statusCode).toBe(400);
      expect(user).toHaveLength(0);
    });
    it("Should return 400 status code if email is not a valid email", async () => {
      const userData = {
        firstName: "Koushik",
        lastName: "panda",
        gmail: " Test_123gmail.com ",
        password: "12345",
        role: "customer",
      };

      const response = await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();

      expect(response.statusCode).toBe(400);
      expect(user).toHaveLength(0);
    });
    it("Should return 400 status code if password length is less than 4 and max 10 characters", async () => {
      const userData = {
        firstName: "Koushik",
        lastName: "panda",
        gmail: " test@123gmail.com ",
        password: "123456789076896",
        role: "customer",
      };

      const response = await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();

      expect(response.statusCode).toBe(400);
      expect(user).toHaveLength(0);
    });
  });

  describe("fields are in proper format", () => {
    it("should trim the email field ", async () => {
      const userData = {
        firstName: "Koushik",
        lastName: "panda",
        gmail: " test@123gmail.com ",
        password: "12345",
        role: "customer",
      };

      await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0].gmail).toBe("test@123gmail.com");
    });
    it("should trim the first name field ", async () => {
      const userData = {
        firstName: " Koushik ",
        lastName: "panda",
        gmail: " test@123gmail.com ",
        password: "12345",
        role: "customer",
      };

      await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0].firstName).toBe("Koushik");
    });
    it("Should return an array of error messages if email is missing", async () => {
      const userData = {
        firstName: "Koushik",
        lastName: "panda",
        gmail: "",
        password: "123456789076896",
        role: "customer",
      };

      const response = await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();

      expect(
        (response.body as Record<string, string>).errors.length
      ).toBeGreaterThan(0);
      expect(response.body).toHaveProperty("errors");
      expect(user).toHaveLength(0);
    });
  });
});

import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
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
    // it("should should persists the users in database", async () => {
    //   // AAA
    //   // Arrange
    //   const userData = {
    //     firstName: "Koushik",
    //     lastName: "panda",
    //     gmail: "test@123.com",
    //     password: "12345",
    //   };
    //   // Act
    //   const response = await request(app).post("/auth/register").send(userData);
    //   // Assert
    //   expect(
    //     (response.headers as Record<string, string>)["content-type"]
    //   ).toEqual(expect.stringContaining("json"));
    // });
  });
  describe("fields are missing", () => {});
});

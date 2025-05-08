import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";

describe("POST /tenants", () => {
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

  it("should return 201 status code", async () => {
    const tenantsData = {
      name: "",
      address: "",
    };
    const response = await request(app).post("/tenants").send(tenantsData);
    expect(response.statusCode).toBe(201);
  });
});

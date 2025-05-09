import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Tenant } from "../../src/entity/Tenant";
import { createJWKSMock, JWKSMock } from "mock-jwks";
import { roles } from "../../src/constants";

describe("POST /tenants", () => {
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

  it("should return 201 status code", async () => {
    const accessToken = jwks.token({ sub: String(1), role: roles.ADMIN });
    const tenantsData = {
      name: "Tenant name",
      address: "Tenant address",
    };
    const response = await request(app)
      .post("/tenants")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send(tenantsData);
    expect(response.statusCode).toBe(201);
  });

  it("should return 201 status code", async () => {
    const tenantsData = {
      name: "Tenant name",
      address: "Tenant address",
    };
    const accessToken = jwks.token({ sub: String(1), role: roles.ADMIN });
    const response = await request(app)
      .post("/tenants")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send(tenantsData);

    const tenantRepository = connection.getRepository(Tenant);
    const tenants = await tenantRepository.find();
    expect(response.statusCode).toBe(201);
    expect(tenants).toHaveLength(1);
  });

  it("should return 401 status code if user not logged in", async () => {
    const tenantsData = {
      name: "Tenant name",
      address: "Tenant address",
    };
    const response = await request(app).post("/tenants").send(tenantsData);
    expect(response.statusCode).toBe(401);

    const tenantRepository = connection.getRepository(Tenant);
    const tenants = await tenantRepository.find();
    expect(tenants).toHaveLength(0);
  });
});

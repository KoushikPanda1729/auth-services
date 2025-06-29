import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { Tenant } from "../../src/entity/Tenant";
import { createJWKSMock, JWKSMock } from "mock-jwks";
import { roles } from "../../src/constants";
import AppDataSource from "../../src/config/data-source";

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

  it("should return 403 status code if user is not an admin", async () => {
    const tenantsData = {
      name: "Tenant name",
      address: "Tenant address",
    };
    const accessToken = jwks.token({ sub: String(1), role: roles.MANAGER });
    const response = await request(app)
      .post("/tenants")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send(tenantsData);

    const tenantRepository = connection.getRepository(Tenant);
    const tenants = await tenantRepository.find();
    expect(response.statusCode).toBe(403);
    expect(tenants).toHaveLength(0);
  });

  it("should return 200 status code and tenant data", async () => {
    const accessToken = jwks.token({ sub: String(1), role: roles.ADMIN });

    // Create one tenant
    const tenantRepository = connection.getRepository(Tenant);
    await tenantRepository.save({
      name: "Sample Tenant",
      address: "123 Sample Street",
    });

    const response = await request(app)
      .get("/tenants")
      .set("Cookie", [`accessToken=${accessToken}`])
      .query({
        q: "Sample",
        currentPage: 1,
        perPage: 5,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray((response.body as Record<string, string>).data)).toBe(
      true
    );
    expect((response.body as Record<string, string>).data).toHaveLength(1);
    expect((response.body as Record<string, string>).data[0]).toMatchObject({
      name: "Sample Tenant",
      address: "123 Sample Street",
    });
  });

  it("should return 200 status code and updated data if tenant is updated", async () => {
    const accessToken = jwks.token({ sub: String(1), role: roles.ADMIN });

    // Step 1: Create a tenant
    const tenantRepository = connection.getRepository(Tenant);
    const newTenant = await tenantRepository.save({
      name: "Sample Tenant",
      address: "123 Sample Street",
    });

    // Step 2: Update the tenant
    const updatedTenantData = {
      name: "Updated Tenant Name",
      address: "456 Updated Street",
    };

    const responseUpdate = await request(app)
      .patch(`/tenants/${newTenant.id}`)
      .set("Cookie", [`accessToken=${accessToken}`])
      .send(updatedTenantData);

    expect(responseUpdate.statusCode).toBe(200);
    expect(responseUpdate.body).toHaveProperty("id");
    expect((responseUpdate.body as Record<string, string>).id).toBe(
      newTenant.id
    );

    // Step 3: Verify that the tenant was updated when retrieving tenants
    const response = await request(app)
      .get("/tenants")
      .set("Cookie", [`accessToken=${accessToken}`])
      .query({
        q: "Updated",
        currentPage: 1,
        perPage: 5,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray((response.body as Record<string, string>).data)).toBe(
      true
    );
    expect((response.body as Record<string, string>).data).toHaveLength(1);
    expect((response.body as Record<string, string>).data[0]).toMatchObject(
      updatedTenantData
    );
  });

  it("should return 200 status code and single tenant", async () => {
    const accessToken = jwks.token({ sub: String(1), role: roles.ADMIN });

    // Step 1: Create a tenant
    const tenantRepository = connection.getRepository(Tenant);
    const tenant = await tenantRepository.save({
      name: "Sample Tenant",
      address: "123 Sample Street",
    });

    const response = await request(app)
      .get(`/tenants/${tenant.id}`)
      .set("Cookie", [`accessToken=${accessToken}`]);

    expect(response.statusCode).toBe(200);

    // Directly check the properties of the tenant object returned
    expect(response.body).toHaveProperty("id", tenant.id);
    expect(response.body).toHaveProperty("name", "Sample Tenant");
    expect(response.body).toHaveProperty("address", "123 Sample Street");
    expect(response.body).toHaveProperty("createdAt");
    expect(response.body).toHaveProperty("updatedAt");
  });

  it("should return 200 status code and if a  tenant is deleted", async () => {
    const accessToken = jwks.token({ sub: String(1), role: roles.ADMIN });

    // Step 1: Create a tenant
    const tenantRepository = connection.getRepository(Tenant);
    const tenant = await tenantRepository.save({
      name: "Sample Tenant",
      address: "123 Sample Street",
    });

    const response = await request(app)
      .delete(`/tenants/${tenant.id}`)
      .set("Cookie", [`accessToken=${accessToken}`]);
    expect(response.statusCode).toBe(200);

    // Directly check the properties of the tenant object returned
    expect(response.body).toHaveProperty("id", tenant.id);
    expect(response.body).toHaveProperty("tenant");
    expect((response.body as Record<string, string>).tenant).toHaveProperty(
      "affected",
      1
    );
    expect((response.body as Record<string, string>).tenant).toHaveProperty(
      "raw"
    );
  });

  it("should return 200 status code and if all tenants are deleted", async () => {
    const accessToken = jwks.token({ sub: String(1), role: roles.ADMIN });

    // Create tenant
    const tenantRepository = connection.getRepository(Tenant);
    await tenantRepository.save({
      name: "Sample Tenant",
      address: "123 Sample Street",
    });

    const response = await request(app)
      .delete(`/tenants`)
      .set("Cookie", [`accessToken=${accessToken}`]);

    expect(response.statusCode).toBe(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(
      (response.body as Array<{ name: string; address: string }>)[0]
    ).toMatchObject({
      name: "Sample Tenant",
      address: "123 Sample Street",
    });
  });
});

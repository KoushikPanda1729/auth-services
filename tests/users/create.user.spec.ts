import { createJWKSMock, JWKSMock } from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { roles } from "../../src/constants";
import { User } from "../../src/entity/User";
import { Tenant } from "../../src/entity/Tenant";

describe("POST /users", () => {
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

  it("should return 400 if required fields are missing", async () => {
    const accessToken = jwks.token({ sub: String(1), role: roles.ADMIN });
    const incompleteUserData = {
      firstName: "John",
      password: "12345",
      tenantId: 1,
    };

    const response = await request(app)
      .post("/users")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send(incompleteUserData);

    expect(response.status).toBe(400);
  });

  it("should return 400 if user with the same gmail already exists", async () => {
    const accessToken = jwks.token({ sub: String(1), role: roles.ADMIN });
    const userData = {
      firstName: "Koushik",
      lastName: "D",
      gmail: "duplicate@gmail.com",
      password: "pass123",
      tenantId: 1,
    };

    // First create user
    await request(app)
      .post("/users")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send(userData);

    // Try to create the same user again
    const response = await request(app)
      .post("/users")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send(userData);

    expect(response.status).toBe(400);
  });

  it("should trim and lowercase gmail before saving", async () => {
    const accessToken = jwks.token({ sub: String(1), role: roles.ADMIN });
    const userData = {
      firstName: "Alex",
      lastName: "Smith",
      gmail: "   Test@EMAIL.com   ",
      password: "pass123",
      tenantId: 1,
      role: roles.MANAGER,
    };

    const response = await request(app)
      .post("/users")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send(userData);
    expect(response.status).toBe(201);
    const userRepository = connection.getRepository(User);
    const user = await userRepository.findOneBy({ gmail: "test@email.com" });
    expect(user).not.toBeNull();
  });

  it("should return 403 if user is not an ADMIN", async () => {
    const accessToken = jwks.token({ sub: String(2), role: roles.MANAGER });
    const userData = {
      firstName: "Jane",
      lastName: "Doe",
      gmail: "jane@example.com",
      password: "securepass",
      tenantId: 1,
    };

    const response = await request(app)
      .post("/users")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send(userData);

    expect(response.status).toBe(403);
  });

  it("should return 201 status code if user successfully created", async () => {
    const accessToken = jwks.token({ sub: String(1), role: roles.ADMIN });
    const userData = {
      firstName: "Koushik",
      lastName: "panda",
      gmail: " test@123gmail.com ",
      password: "12345",
      tenantId: 1,
      role: roles.MANAGER,
    };
    const response = await request(app)
      .post("/users")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send(userData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    const userRepository = connection.getRepository(User);
    const users = await userRepository.find();

    expect(users).toHaveLength(1);
    expect(users[0].role).toBe(roles.MANAGER);
  });

  it("should return 200 status code if user successfully updated", async () => {
    const accessToken = jwks.token({ sub: String(1), role: roles.ADMIN });
    const tenantRepository = connection.getRepository(Tenant);
    const tenant = await tenantRepository.save({
      name: "Test Tenant",
      address: "123 Test St",
      // Add other required fields for your Tenant entity
    });
    const userData = {
      firstName: "Koushik",
      lastName: "panda",
      gmail: " test@123gmail.com ",
      password: "12345",
      tenantId: tenant.id,
      role: roles.ADMIN,
    };
    const userRepository = connection.getRepository(User);
    const newUser = await userRepository.save(userData);
    const updatedTenant = await tenantRepository.save({
      name: "Test Tenant",
      address: "123 Test St",
      // Add other required fields for your Tenant entity
    });
    const updatedUserData = {
      firstName: "Alex",
      lastName: "Jonson",
      gmail: " panda@123gmail.com ",
      password: "12345",
      tenantId: updatedTenant.id,
      role: roles.ADMIN,
    };
    const responseUpdate = await request(app)
      .patch(`/users/${newUser.id}`)
      .set("Cookie", [`accessToken=${accessToken}`])
      .send(updatedUserData);
    console.log("==============->", responseUpdate.error);
    expect(responseUpdate.statusCode).toBe(200);
    expect(responseUpdate.body).toHaveProperty("id");
    expect((responseUpdate.body as Record<string, string>).id).toBe(newUser.id);

    const response = await request(app)
      .patch(`/users/${newUser.id}`)
      .set("Cookie", [`accessToken=${accessToken}`]);
    console.log("------------------>", response.error);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray((response.body as Record<string, string>).data)).toBe(
      true
    );
    expect((response.body as Record<string, string>).data).toHaveLength(1);
    expect((response.body as Record<string, string>).data[0]).toMatchObject(
      updatedUserData
    );
  });
});

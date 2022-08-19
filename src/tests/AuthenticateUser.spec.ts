import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../app"
import startConnection from "../shared/infra/typeorm";

let connection: Connection;

describe("Authenticate user integration tests", () => {
  beforeAll(async () => {
    connection = await startConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "user-test",
      email: "admin@test.com.br",
      password: "admin"
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  test("when all params are valid returns a user authenticated", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@test.com.br",
      password: "admin"
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  })

  test("if email or password is wrong returns an error", async () => {
    const response1 = await request(app).post("/api/v1/sessions").send({
      email: "user@test.com.br",
      password: "admin"
    });

    const response2 = await request(app).post("/api/v1/sessions").send({
      email: "admin@test.com.br",
      password: "123"
    });

    expect(response1.statusCode).toBe(401);
    expect(response2.statusCode).toBe(401);
  })
})
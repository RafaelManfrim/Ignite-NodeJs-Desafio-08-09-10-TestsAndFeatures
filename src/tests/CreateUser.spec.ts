import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../app"
import startConnection from "../shared/infra/typeorm";

let connection: Connection;

describe("Create user integration tests", () => {
  beforeAll(async () => {
    connection = await startConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  test("Create User when all params are valid", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "user-test",
      email: "admin@test.com.br",
      password: "admin"
    });

    expect(response.statusCode).toBe(201);
  })

  test("if user already exists return an error", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user-test",
      email: "admin@test.com.br",
      password: "admin"
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "user-test-2",
      email: "admin@test.com.br",
      password: "12345"
    });

    expect(response.statusCode).toBe(400);
  })
})
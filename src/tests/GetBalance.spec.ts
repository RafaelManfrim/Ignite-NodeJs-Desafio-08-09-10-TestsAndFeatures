import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../app"
import startConnection from "../shared/infra/typeorm";

let connection: Connection;

describe("Get user balance integration tests", () => {
  beforeAll(async () => {
    connection = await startConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  test("when all params are valid, returns the user balance", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user-test",
      email: "admin@test.com.br",
      password: "admin"
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@test.com.br",
      password: "admin"
    });

    const { token } = response.body;

    const response_balance = await request(app).get("/api/v1/statements/balance").set({ Authorization: `Bearer ${token}` });

    expect(response_balance.statusCode).toBe(200);
    expect(response_balance.body).toHaveProperty("balance");
    expect(response_balance.body).toHaveProperty("statement");
  })

  test("when the token is invalid, returns an error", async () => {
    const response_balance = await request(app).get("/api/v1/statements/balance").set({ Authorization: `Bearer 123` });

    expect(response_balance.statusCode).toBe(401);
  })
})
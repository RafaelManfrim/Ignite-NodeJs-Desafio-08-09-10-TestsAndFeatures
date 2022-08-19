import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../app"
import startConnection from "../shared/infra/typeorm";

let connection: Connection;

describe("Show user profile integration tests", () => {
  beforeAll(async () => {
    connection = await startConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  test("when jwt in header is valid, returns user profile", async () => {
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

    const response_profile = await request(app).get("/api/v1/profile").set({ Authorization: `Bearer ${token}` });

    expect(response_profile.statusCode).toBe(200);
    expect(response_profile.body).toHaveProperty("id");
  })

  test("when jwt is invalid, returns an error", async () => {
    const response_profile = await request(app).get("/api/v1/profile").set({ Authorization: `Bearer 123` });

    expect(response_profile.statusCode).toBe(401);
  })
})
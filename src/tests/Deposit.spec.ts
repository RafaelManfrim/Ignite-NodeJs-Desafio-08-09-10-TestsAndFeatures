import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../app"
import startConnection from "../shared/infra/typeorm";

let connection: Connection;

describe("Deposit integration tests", () => {
  beforeAll(async () => {
    connection = await startConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  test("when all params are valid, returns the deposit", async () => {
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

    const depositAmmount = 10

    const response_deposit = await request(app).post("/api/v1/statements/deposit").send({
      amount: depositAmmount,
      description: "description-test"
    }).set({ Authorization: `Bearer ${token}` });

    expect(response_deposit.statusCode).toBe(201);
    expect(response_deposit.body.type).toEqual("deposit");
    expect(response_deposit.body.amount).toEqual(depositAmmount);
  })

  test("when the token is invalid, returns an error", async () => {
    const response_deposit = await request(app).post("/api/v1/statements/deposit").send({
      amount: 10,
      description: "description-test"
    }).set({ Authorization: `Bearer 123` });

    expect(response_deposit.statusCode).toBe(401);
  })
})
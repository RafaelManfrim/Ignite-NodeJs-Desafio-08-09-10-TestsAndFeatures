import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../app"
import startConnection from "../shared/infra/typeorm";

let connection: Connection;

describe("Withdraw integration tests", () => {
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

  test("when all params are valid, returns the withdraw", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@test.com.br",
      password: "admin"
    });

    const { token } = response.body;

    const depositAmmount = 10

    await request(app).post("/api/v1/statements/deposit").send({
      amount: depositAmmount,
      description: "description-test"
    }).set({ Authorization: `Bearer ${token}` });

    const withdrawAmmount = 10

    const response_withdraw = await request(app).post("/api/v1/statements/withdraw").send({
      amount: withdrawAmmount,
      description: "description-test"
    }).set({ Authorization: `Bearer ${token}` });

    expect(response_withdraw.statusCode).toBe(201);
    expect(response_withdraw.body.type).toEqual("withdraw");
    expect(response_withdraw.body.amount).toEqual(withdrawAmmount);
  })

  test("when the withdraw is bigger than the user balance, returns an error", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@test.com.br",
      password: "admin"
    });

    const { token } = response.body;

    const withdrawAmmount = 10

    const response_withdraw = await request(app).post("/api/v1/statements/withdraw").send({
      amount: withdrawAmmount,
      description: "description-test"
    }).set({ Authorization: `Bearer ${token}` });

    expect(response_withdraw.statusCode).toBe(400);
  })

  test("when the token is invalid, returns an error", async () => {
    const response_withdraw = await request(app).post("/api/v1/statements/deposit").send({
      amount: 10,
      description: "description-test"
    }).set({ Authorization: `Bearer 123` });

    expect(response_withdraw.statusCode).toBe(401);
  })
})
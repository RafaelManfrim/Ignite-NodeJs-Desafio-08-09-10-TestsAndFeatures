import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../app"
import startConnection from "../shared/infra/typeorm";

let connection: Connection;

describe("GetOperation integration tests", () => {
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

  test("when all params are valid, returns the operation", async () => {
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

    const { id } = response_deposit.body;

    const response_operation = await request(app).get(`/api/v1/statements/${id}`).set({ Authorization: `Bearer ${token}` });

    expect(response_operation.statusCode).toBe(200);
    expect(response_operation.body.type).toEqual("deposit");
    expect(Number(response_operation.body.amount)).toEqual(depositAmmount);
  })

  test("when the token is invalid, returns an error", async () => {
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

    const { id } = response_deposit.body;

    const response_operation = await request(app).get(`/api/v1/statements/${id}`).set({ Authorization: `Bearer 123` });

    expect(response_operation.statusCode).toBe(401);
  })

  test("when the operation does not exist, returns an error", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@test.com.br",
      password: "admin"
    });

    const { token } = response.body;

    const invalidOperationId = "17ee09ad-c591-46ae-b2d6-88e373b236f2"

    const response_operation = await request(app).get(`/api/v1/statements/${invalidOperationId}`).set({ Authorization: `Bearer ${token}` });

    expect(response_operation.statusCode).toBe(404);
  })
})
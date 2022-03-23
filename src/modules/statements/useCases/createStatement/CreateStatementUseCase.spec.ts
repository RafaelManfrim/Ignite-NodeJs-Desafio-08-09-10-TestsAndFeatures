import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementError } from "./CreateStatementError"
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let createStatementUseCase: CreateStatementUseCase

describe("CreateStatementUseCase", () => {
    beforeEach(() => {
        inMemoryStatementsRepository = new InMemoryStatementsRepository()
        inMemoryUsersRepository = new InMemoryUsersRepository()
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    })

    test("Deve ser possível realizar um depósito", async () => {
        const user = await inMemoryUsersRepository.create({ name: "Juliet", email: "ju@test.com", password: "12344" })

        const statement = await createStatementUseCase.execute({ user_id: user.id!, amount: 100, description: "Test deposit", type: OperationType.DEPOSIT })

        expect(statement).toHaveProperty("id")
    })

    test("Deve ser possível realizar um saque", async () => {
        const user = await inMemoryUsersRepository.create({ name: "antony", email: "antony@test.com", password: "12348" })

        await createStatementUseCase.execute({ user_id: user.id!, amount: 100, description: "Test deposit", type: OperationType.DEPOSIT })

        const statement = await createStatementUseCase.execute({ user_id: user.id!, amount: 50, description: "Test withdraw", type: OperationType.WITHDRAW })

        expect(statement).toHaveProperty("id")
    })

    test("Não deve ser possível realizar um saque se não houver saldo suficiente", async () => {
        const user = await inMemoryUsersRepository.create({ name: "clay", email: "clay@test.com", password: "1535" })

        await createStatementUseCase.execute({ user_id: user.id!, amount: 100, description: "Test deposit", type: OperationType.DEPOSIT })

        await expect(
            createStatementUseCase.execute({ user_id: user.id!, amount: 150, description: "Test withdraw", type: OperationType.WITHDRAW })
        ).rejects.toEqual(new CreateStatementError.InsufficientFunds())
    })

    test("Não deve ser possível realizar uma transação para um usuário não existente", async () => {
        await expect(
            createStatementUseCase.execute({ user_id: "24242343", amount: 150, description: "Test withdraw", type: OperationType.WITHDRAW })
        ).rejects.toEqual(new CreateStatementError.UserNotFound())
    })
})
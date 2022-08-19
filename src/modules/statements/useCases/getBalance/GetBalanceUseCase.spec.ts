import "dotenv/config"

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { GetBalanceError } from "./GetBalanceError"
import { GetBalanceUseCase } from "./GetBalanceUseCase"

let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let getBalanceUseCase: GetBalanceUseCase

describe("GetBalanceUseCase", () => {
    beforeEach(() => {
        inMemoryStatementsRepository = new InMemoryStatementsRepository()
        inMemoryUsersRepository = new InMemoryUsersRepository()
        getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
    })

    test("Deve ser possível retornar o balanço do usuário", async () => {
        const user = await inMemoryUsersRepository.create({ name: "Leya", email: "leya@test.com", password: "1234" })

        const balance = await getBalanceUseCase.execute({ user_id: user.id! })

        expect(balance).toHaveProperty("statement")
        expect(balance.statement).toHaveLength(0)
        expect(balance).toHaveProperty("balance")
    })

    test("Não deve ser possível retornar o balanço de um usuário não existente", async () => {
        await expect(
            getBalanceUseCase.execute({ user_id: "2423535" })
        ).rejects.toEqual(new GetBalanceError())
    })
})
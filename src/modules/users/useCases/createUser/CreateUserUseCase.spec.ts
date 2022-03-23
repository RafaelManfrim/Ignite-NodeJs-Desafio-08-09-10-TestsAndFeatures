import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from "./CreateUserError"
import { CreateUserUseCase } from "./CreateUserUseCase"

let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository

describe("CreateUserUseCase", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    })

    test("Deve ser possível criar um usuário", async () => {
        const user = await createUserUseCase.execute({ name: "John", email: "john@example.com", password: "1234" })

        expect(user).toHaveProperty("id")
    })

    test("Não deve ser possível criar um usuário com e-mail já existente", async () => {
        const baseUser = { name: "John Doe", email: "john_doe@example.com", password: "12345" }
        await createUserUseCase.execute(baseUser)

        await expect(
            createUserUseCase.execute({ name: "John Lenn", email: baseUser.email, password: "123456" })
        ).rejects.toEqual(new CreateUserError())
    })
})
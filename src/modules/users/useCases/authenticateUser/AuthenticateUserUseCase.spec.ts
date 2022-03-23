import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError"

let inMemoryUsersRepository: InMemoryUsersRepository
let authenticateUserUseCase: AuthenticateUserUseCase
let createUserUseCase: CreateUserUseCase

describe('AuthenticateUserUseCase', () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    })

    test("Deve ser possível autenticar um usuário", async () => {
        const user = { name: "John Doe", email: "john.doe@gmail.com", password: "123" }

        await createUserUseCase.execute(user)

        const authResponse = await authenticateUserUseCase.execute({ email: user.email, password: user.password })

        expect(authResponse).toHaveProperty("token")
        expect(authResponse.user).toHaveProperty("id")
    })

    test("Não deve ser possível autenticar um usuário não existente", async () => {
        await expect(
            authenticateUserUseCase.execute({ email: "naoexiste@teste.com", password: "12345" })
        ).rejects.toEqual(new IncorrectEmailOrPasswordError())
    })

    test("Não deve ser possível autenticar um usuário com a senha errada", async () => {
        const user = { name: "Johnny", email: "johnny@gmail.com", password: "42342525534534535" }

        await createUserUseCase.execute(user)

        await expect(
            authenticateUserUseCase.execute({ email: user.email, password: "12345" })
        ).rejects.toEqual(new IncorrectEmailOrPasswordError())
    })
})
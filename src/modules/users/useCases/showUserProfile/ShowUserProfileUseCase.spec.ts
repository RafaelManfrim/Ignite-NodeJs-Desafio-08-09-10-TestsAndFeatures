import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { ShowUserProfileError } from "./ShowUserProfileError"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let showUserProfileUseCase: ShowUserProfileUseCase

describe("ShowUserProfileUseCase", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository()
        showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
    })

    test("Deve ser possível exibir o profile do usuário", async () => {
        const user = await inMemoryUsersRepository.create({ name: "Marie", email: "marie@example.com", password: "1234" })

        const profile = await showUserProfileUseCase.execute(user.id!)

        expect(profile).toHaveProperty("id")
    })

    test("Não deve ser possível exibir o profile de um usuário não existente", async () => {
        await expect(
            showUserProfileUseCase.execute("3244")
        ).rejects.toEqual(new ShowUserProfileError())
    })
})
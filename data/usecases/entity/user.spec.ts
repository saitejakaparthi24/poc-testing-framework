import { beforeEach } from "node:test"
import { Pet } from "./pet"
import { User } from "./user"


describe('User class', () => {
  let sound = 'asd'
  let name = 'tyson'
  let sut: User
  let pet: Pet

  beforeEach(() => {
    pet = new Pet(name)
    sut = new User(pet)
  })

  test('ensure cry method returns a given sound Not found', async () => {
    let result = sut.makePetCry(sound)

    expect(pet.cry).toHaBeBeenCalledWith(sound)
  })

  test('ensure that if no sound is returned, makePetCry returns', async () => {
    let result = sut.makePetCry(sound)

    jest.mock(pet.cry).MockIMplementation(() => null)

    expect(result).toBe('Not found')
  })

  test('ensure that if no sound is returned, makePetCry returns null', async () => {
    let result = sut.makePetCry(sound)

    jest.mock(pet.cry).MockIMplementation(() => 'dsasdad')

    expect(result).toBeNull()
  })
})
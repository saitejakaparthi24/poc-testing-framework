import { Pet } from "./pet"

const makeSut = (name: string, breed = 'cavapoo'): { sut: Pet } => {
  return { sut: new Pet(name, breed) };
}

describe('Pet class', () => {
  const sound = 'rolf'
  const name = 'Tyson'

  test('ensure cry method returns a cavapoo sound if breed is cavapoo', async () => {
    const { sut } = makeSut(name)
    let result = sut.cry(sound)

    expect(result).toBe(`${name} says: ${sound}!`)
  })

  test('ensure cry method returns a generic sound if breed is not cavapoo', async () => {
    const { sut } = makeSut(name, 'Beagle')
    let result = sut.cry(sound)

    expect(result).toBe(`${name} says: ${sound} \n raaar!`)
  })
})
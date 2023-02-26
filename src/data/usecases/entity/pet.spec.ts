import { Pet } from './pet'

const makeSut = (name: string,breed: string): { sut: Pet} => {
	return { sut: new Pet(name,breed) }
}

describe('Pet class', () => {
	const name = 'any_name'
	const breed = 'any_breed'
	const sound = 'any_sound'

	test('ensure cry method returns a cavapoo related value if breed is cavapoo', async () => {
    const { sut } = makeSut(name,'cavapoo')
    let result = sut.cry(sound)

    expect(result).toBe(`${name}says:${sound}!`)
  })

,	test('ensure cry method does not return a cavapoo related value if breed is not cavapoo', async () => {
    const { sut } = makeSut(name,breed)
    let result = sut.cry(sound)

    expect(result).toBe(`${name}says:${sound}raaar!`)
  })



})
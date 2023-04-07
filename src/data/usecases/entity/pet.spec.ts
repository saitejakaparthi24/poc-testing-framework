import { Pet } from './pet'

const makeSut = (name: string,breed: string): { sut: Pet} => {
	return { sut: new Pet(name,breed) }
}

describe('Pet class', () => {
describe('cry method', () => {
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
}}

  describe('intro method', () => {
    const name = 'any_name';

    test('should return expected string when breed is cavapoo', () => {
      const breed = 'cavapoo';
      const sound = 'any_sound';
      const pet = new Pet(name, breed);
      const result = pet.intro(sound);
      expect(result).toBe(`${name} says: ${sound}!`);
    })

    test('should return expected string when breed is canine', () => {
      const breed = 'canine';
      const sound = 'any_sound';
      const pet = new Pet(name, breed);
      const result = pet.intro(sound);
      expect(result).toBe(`${name} says: ${sound}!`);
    })

    test('should return expected string when breed is poodles', () => {
      const breed = 'poodles';
      const sound = 'any_sound';
      const pet = new Pet(name, breed);
      const result = pet.intro(sound);
      expect(result).toBe(`${name} says: ${sound}!`);
    })

    test('should return expected string when breed is bulldogs', () => {
      const breed = 'bulldogs';
      const sound = 'any_sound';
      const pet = new Pet(name, breed);
      const result = pet.intro(sound);
      expect(result).toBe(`${name} says: ${sound}!`);
    })

    test('should return default string when breed is unknown', () => {
      const breed = 'unknown';
      const sound = 'any_sound';
      const pet = new Pet(name, breed);
      const result = pet.intro(sound);
      expect(result).toBe(`${name} says: ${sound} default sound!`);
    })
  })
})
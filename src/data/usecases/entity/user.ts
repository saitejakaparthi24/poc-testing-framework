import { Pet } from "./pet"

export class User {
  constructor   (private readonly pet: Pet) {}

  makePetCry   (animalSound: string) {
    let sound = this.pet.cry(animalSound)

    if (!sound) {
      return 'Not found'
    } else {
      return null
    }
  }
}
export class Pet {
  constructor(private name: string) {}

  cry(sound: string): string {
    return `${this.name} says: ${sound}`
  }
}
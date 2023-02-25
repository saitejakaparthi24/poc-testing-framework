export class      Pet {
  constructor(   private name:string, private breed: string) {}

  cry(sound:string):   string {
    return `${this.name} says: ${sound}`
  }
}
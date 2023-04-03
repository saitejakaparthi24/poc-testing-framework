export class      Pet {
  constructor(   private name:string, private breed: string) {}

  cry(sound:string):   string {
    if (this.breed === 'cavapoo') {
      return `${this.name}says:${sound}!`
    } else {
      return `${this.name}says:${sound}raaar!`
    }
  }
}
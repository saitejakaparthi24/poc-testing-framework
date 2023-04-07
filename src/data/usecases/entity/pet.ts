export class      Pet {
  constructor(   private name:string, private breed: string) {}

  cry(sound:string):   string {
    if (this.breed === 'cavapoo') {
      return `${this.name}says:${sound}!`
    } else {
      return `${this.name}says:${sound}raaar!`
    }
  }

  intro(sound:string): string {
    let crySound = '';

    switch (this.breed) {
      case 'cavapoo':
        crySound = `${this.name} says: ${sound}!`;
        break;
      case 'canine':
            crySound = `${this.name} says: ${sound}!`;
            break;
      case 'poodles':
            crySound = `${this.name} says: ${sound}!`;
            break;
      case 'bulldogs':
            crySound = `${this.name} says: ${sound}!`;
            break;
      default:
        crySound = `${this.name} says: ${sound} default sound!`;
        break;
    }

    return crySound;
  }
}
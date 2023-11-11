import math from '../../math';
import { string } from '../../utils';
import { Random } from '../../math/random';
import LongWordList from '../../utils/wordlist';
import { type PasswordGeneratorOptions } from './_types';


const DefaultOptions: PasswordGeneratorOptions = {
  length: 14,
  ambiguous: false,
  number: true,
  minNumber: 1,
  uppercase: true,
  minUppercase: 0,
  lowercase: true,
  minLowercase: 0,
  special: false,
  minSpecial: 1,
  type: 'password',
  numWords: 3,
  wordSeparator: '-',
  capitalize: false,
  includeNumber: false,
};


export class PasswordGenerator {
  public generatePassword(options?: PasswordGeneratorOptions): string {
    const o: PasswordGeneratorOptions = Object.assign({}, DefaultOptions, options);

    if (o.type === 'passphrase') return this.generatePassphrase(options);

    this._sanitizePasswordLength(o, true);

    let positions: string[] = [];

    if (o.lowercase && o.minLowercase! > 0) {
      for (let i = 0; i < o.minLowercase!; i++) {
        positions.push('l');
      }
    }

    if (o.uppercase && o.minUppercase! > 0) {
      for (let i = 0; i < o.minUppercase!; i++) {
        positions.push('u');
      }
    }

    if (o.number && o.minNumber! > 0) {
      for (let i = 0; i < o.minNumber!; i++) {
        positions.push('n');
      }
    }

    if (o.special && o.minSpecial! > 0) {
      for (let i = 0; i < o.minSpecial!; i++) {
        positions.push('s');
      }
    }

    while (positions.length < o.length!) {
      positions.push('a');
    }

    positions = this._shuffle(positions);

    let allCharSet = '';

    let lowercaseCharSet = 'abcdefghijkmnopqrstuvwxyz';

    if (o.ambiguous) {
      lowercaseCharSet += 'l';
    }

    if (o.lowercase) {
      allCharSet += lowercaseCharSet;
    }

    let uppercaseCharSet = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

    if (o.ambiguous) {
      uppercaseCharSet += 'IO';
    }

    if (o.uppercase) {
      allCharSet += uppercaseCharSet;
    }

    let numberCharSet = '23456789';

    if (o.ambiguous) {
      numberCharSet += '01';
    }

    if (o.number) {
      allCharSet += numberCharSet;
    }

    const specialCharSet = '!@#$%^&*';

    if (o.special) {
      allCharSet += specialCharSet;
    }

    let password = '';

    for (let i = 0; i < o.length!; i++) {
      let positionChars: string = '';

      switch (positions[i]) {
        case 'l':
          positionChars = lowercaseCharSet;
          break;
        case 'u':
          positionChars = uppercaseCharSet;
          break;
        case 'n':
          positionChars = numberCharSet;
          break;
        case 's':
          positionChars = specialCharSet;
          break;
        case 'a':
          positionChars = allCharSet;
          break;
        default:
          break;
      }

      const randomCharIndex = Random.uniform(0, positionChars.length - 1, 'round');
      password += positionChars.charAt(randomCharIndex);
    }

    return password;
  }

  public generatePassphrase(options?: PasswordGeneratorOptions): string {
    const o: PasswordGeneratorOptions = Object.assign({}, DefaultOptions, options);

    if (o.numWords == null || o.numWords <= 2) {
      o.numWords = DefaultOptions.numWords;
    }

    if (o.wordSeparator == null || o.wordSeparator.length === 0 || o.wordSeparator.length > 1) {
      o.wordSeparator = ' ';
    }

    if (o.capitalize == null) {
      o.capitalize = false;
    }

    if (o.includeNumber == null) {
      o.includeNumber = false;
    }
        
    const listLength = LongWordList.length - 1;
    let wordList = new Array(o.numWords).fill('');
        
    for (let i = 0; i < o.numWords!; i++) {
      const wordIndex = Random.uniform(0, listLength, 'round');
            
      if (o.capitalize) {
        wordList[i] = string.capitalizeText(LongWordList[wordIndex]);
      } else {
        wordList[i] = LongWordList[wordIndex];
      }
    }
        
    if (o.includeNumber) {
      wordList = this._appendRandomNumberToRandomWord(wordList)!;
    }

    return wordList.join(o.wordSeparator);
  }

  private _appendRandomNumberToRandomWord(wordList: any[]): any[] | null {
    if (wordList == null || wordList.length <= 0) return null;

    const index = Random.uniform(0, wordList.length - 1, 'round');
    const num = Random.uniform(0, 9, 'round');
    wordList[index] = wordList[index] + num;

    return wordList;
  }

  private _sanitizePasswordLength(options: any, forGeneration: boolean): PasswordGeneratorOptions {
    let minUppercaseCalc = 0;
    let minLowercaseCalc = 0;
    let minNumberCalc: number = options.minNumber;
    let minSpecialCalc: number = options.minSpecial;

    if (options.uppercase && options.minUppercase <= 0) {
      minUppercaseCalc = 1;
    } else if (!options.uppercase) {
      minUppercaseCalc = 0;
    }

    if (options.lowercase && options.minLowercase <= 0) {
      minLowercaseCalc = 1;
    } else if (!options.lowercase) {
      minLowercaseCalc = 0;
    }

    if (options.number && options.minNumber <= 0) {
      minNumberCalc = 1;
    } else if (!options.number) {
      minNumberCalc = 0;
    }

    if (options.special && options.minSpecial <= 0) {
      minSpecialCalc = 1;
    } else if (!options.special) {
      minSpecialCalc = 0;
    }

    // This should never happen but is a final safety net
    if (!options.length || options.length < 1) {
      options.length = 10;
    }

    const minLength: number = minUppercaseCalc + minLowercaseCalc + minNumberCalc + minSpecialCalc;
    // Normalize and Generation both require this modification
    if (options.length < minLength) {
      options.length = minLength;
    }

    // Apply other changes if the options object passed in is for generation
    if (forGeneration) {
      options.minUppercase = minUppercaseCalc;
      options.minLowercase = minLowercaseCalc;
      options.minNumber = minNumberCalc;
      options.minSpecial = minSpecialCalc;
    }

    return options;
  }

  private _shuffle(array: any[]) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while(currentIndex != 0) {

      // Pick a remaining element.
      randomIndex = (new math.random()).nextInt(currentIndex - 1);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  }
}


export default PasswordGenerator;
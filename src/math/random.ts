import { Exception } from '../errors/exception';
import { strShuffle } from '../utils/string';
import nmath from './built-in';


export class Random {
  #value: number;
  #scale: number;

  constructor() {
    this.#value = nmath.random();
    this.#scale = 1;
  }

  public static get random(): number {
    return nmath.random();
  }

  public static uniform(start: number, end?: number, round?: 'ceil' | 'floor' | 'round'): number {
    if(!end) {
      end = start;
      start = 0;
    }

    const random = Math.random() * (end - start) + start;
    
    if(!round || !['ceil', 'floor', 'round'].includes(round)) return random;
    return nmath[round](random);
  }

  public static string(length: number, useSpecialChars: boolean = true): string {
    const keys: string = strShuffle(`abcdefghijklmnopqrstuvwxyz${'abcdefghijklmnopqrstuvwxyz'.toUpperCase()}0987654321${useSpecialChars ? '@#-_)([];:%*' : ''}`);
    let result: string = '';

    for(let i = 0; i < length; i++) {
      const offset = nmath.floor(nmath.random() * keys.length);
      result += keys.substring(offset, offset + 1);
    }

    return result;
  }

  public static choice<T>(arr: ReadonlyArray<T>): T {
    const i = nmath.floor(nmath.random() * arr.length);
    return arr[i];
  }

  public static permutation<T>(x: number | [T[], number]): T[] {
    return permutation(x);
  }

  public get static(): number {
    return this.#value;
  }

  public get random() {
    return nmath.random() * this.#scale;
  }

  public setScale(value: number): this {
    this.#scale = value;
    return this;
  }

  public nextInt(n: number | unknown[]): number {
    let result: number = -1;

    if(Array.isArray(n)) {
      if(n.length < 1) {
        throw new Exception('The provided array must contain at least one element.');
      }

      result = nmath.floor(nmath.random() * n.length);
    } else {
      if(!Number.isFinite(n)) {
        throw new Exception('The provided value must be a finite number.');
      }

      result = nmath.floor(this.random * (n + 1));
    }

    return result;
  }
}


export function permutation<T>(x: number | [T[], number]): T[] {
  let arr: T[];
  let size: number;

  if(Array.isArray(x)) {
    [arr, size] = x;
  } else {
    arr = (Array.from({ length: x }, (_, i) => i) as unknown as any);
    size = x;
  }

  for(let i = arr.length - 1; i > 0; i--) {
    const j = nmath.floor(nmath.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, size);
}


export default Random;
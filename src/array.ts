import { Random } from './math';


export type MultidimensionalArray<T = number> = (T | MultidimensionalArray<T>)[];
export type BidimensionalArray<T = number> = (T | T[])[];


/**
 * Shuffles the elements of the given array asynchronously using the Fisher-Yates algorithm.
 * 
 * @param arr - The array to be shuffled.
 * @returns A Promise that resolves to the shuffled array.
 */
export async function shuffleArray<T>(arr: Array<T>): Promise<Array<T>> {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Random.uniform(0, i, 'round');
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}


/**
 * Shuffles the elements of the given array synchronously using the Fisher-Yates algorithm.
 * 
 * @param arr - The array to be shuffled.
 * @returns The shuffled array.
 */
export function shuffleArraySync<T>(arr: Array<T>): Array<T> {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Random.uniform(0, i, 'round');
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}


/**
 * Generates an inorder traversal of a multidimensional array using a generator function.
 * 
 * @param arr - The multidimensional array to traverse.
 * @returns A generator for the inorder traversal of the array.
 */
export function* inorderTransversal<T>(arr: MultidimensionalArray<T>): Generator<T, void, unknown> {
  const stack: MultidimensionalArray<T> = [arr];

  while(stack.length > 0) {
    const current = stack.pop();

    if(Array.isArray(current)) {
      stack.push(...current.reverse());
    } else {
      yield current! as T;
    }
  }
}


/**
 * Groups elements of an array based on the result of a grouping function.
 * 
 * @param arr - The array to be grouped.
 * @param fn - The grouping function that produces keys for grouping.
 * @returns An object mapping group keys to arrays of elements.
 */
export function groupBy<T>(arr: T[], fn: ((item: T) => string)): Record<string, T[]> {
  const result: Record<string, T[]> = {};

  arr.forEach(item => {
    const key = fn(item);

    if(!result[key]) {
      result[key] = [];
    }

    result[key].push(item);
  });

  return result;
}


/**
 * Returns the last element of an array, or -1 if the array is empty.
 * 
 * @param arr - The array.
 * @returns The last element of the array or -1 if the array is empty.
 */
export function arrayLast<T>(arr: T[]): T | -1 {
  return arr.at(-1) ?? -1;
}


/**
 * Flattens a multidimensional array up to a specified depth.
 * 
 * @param arr - The multidimensional array to flatten.
 * @param n - The depth to flatten the array.
 * @returns The flattened array.
 */
export function arrayFlat<T = number>(arr: MultidimensionalArray<T>, n: number): MultidimensionalArray<T> {
  if(n === 0) return arr;
  const result: MultidimensionalArray<T> = [];

  const repeat = (arr: MultidimensionalArray<T>, level: number) => {
    for(const item of arr) {
      if(level > 0 && Array.isArray(item)) {
        repeat(item, level - 1);
      } else {
        result.push(item);
      }
    }
  };

  repeat(arr, n);
  return result;
}


/**
 * Divides an array into chunks of a specified size.
 * 
 * @param arr - The array to be chunked.
 * @param size - The size of each chunk.
 * @returns An array of chunks.
 */
export function arrayChunk(arr: any[], size: number): any[][] {
  const result: any[][] = [];

  for(let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }

  return result;
}


export class ArrayWrapper {
  #content: number[];

  constructor(value: number[]) {
    this.#content = value;
  }

  public valueOf(): number {
    return this.#content.reduce((acc, n) => acc + n, 0);
  }

  public toString(): string {
    return `[${this.#content.join(',')}]`;
  }
}


export default Object.freeze({
  groupBy,
  arrayLast,
  arrayFlat,
  arrayChunk,
  ArrayWrapper,
  shuffleArray,
  shuffleArraySync,
  inorderTransversal,
});
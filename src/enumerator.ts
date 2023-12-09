import { isPlainObject } from './utils/is';

export type Enumerable<T> = [index: number, value: T][];


export function enumerateIterableIterator<T>(iterator: IterableIterator<T> | Record<string | number, T> | T[]): Enumerable<T> {
  let index = 0;
  const enumerable: Enumerable<T> = [];

  if(Array.isArray(iterator)) {
    for(const value of iterator) {
      enumerable.push([index++, value]);
    }
  } else if(typeof iterator === 'object' && isPlainObject(iterator)) {
    for(const value of Object.values(iterator)) {
      enumerable.push([index++, value]);
    }
  } else {
    for(const value of (iterator as IterableIterator<T>)) {
      enumerable.push([index++, value]);
    }
  }

  return enumerable;
}

export default enumerateIterableIterator;
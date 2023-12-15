import { type ReadonlyStorageBlock } from './list';
import { isPlainObject } from './utils/is';


export type Enumerable<T> = [index: number, value: T][];

export type EnumerableIterator<T> =
  | IterableIterator<T>
  | Record<string | number, T>
  | ReadonlyStorageBlock<T>
  | T[];


export function enumerateIterableIterator<T>(iterator: EnumerableIterator<T>): Enumerable<T> {
  function _validateStorageBlock(value: unknown): value is ReadonlyStorageBlock<T> {
    if(typeof value !== 'object' || value == null) return false;

    const keys = Object.keys(value);
    if(keys.length !== 4) return false;

    if(!keys.includes('key')) return false;
    if(!keys.includes('value')) return false;
    if(!keys.includes('code')) return false;
    if(!keys.includes('next')) return false;

    if((value as Record<string, any>).next != null) return _validateStorageBlock((value as Record<string, any>).next);
    return true;
  }

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
  } else if(_validateStorageBlock(iterator)) {
    let block: ReadonlyStorageBlock<T> | null = iterator;

    while(block != null) {
      enumerable.push([index++, block.value]);
      block = block.next;
    }
  } else {
    for(const value of (iterator as IterableIterator<T>)) {
      enumerable.push([index++, value]);
    }
  }

  return enumerable;
}



const _default = {
  enumerateIterableIterator,
};

export default Object.freeze(_default);
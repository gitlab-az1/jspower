import type { GenericFunction } from '../types';

export * from './asci';
export * from './object';
export * as is from './is';
export * as object from './object';
export * as string from './string';
export * as platform from './platform';
export { default as wordlist } from './wordlist';


/**
 * Resolve object with deep prototype chain to a flat object
 * 
 * @param {Object} sourceObj source object
 * @param {Object} [destObj]
 * @param {Function|Boolean} [filter]
 * @param {Function} [propFilter]
 *
 * @returns {Object}
 */
export function toFlatObject(sourceObj: Record<any, any>, destObj: Record<any, any>, filter?: (src: object, dest: object) => boolean | boolean, propFilter?: (prop: string, src: object, dest: object) => boolean): Record<any, any> {
  let props;
  let i;
  let prop;
  const merged: Record<any, any> = {};

  destObj = destObj || {};
  if(sourceObj == null) return destObj;

  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;

    while (i-- > 0) {
      prop = props[i];

      if((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }

    sourceObj = (filter as unknown as any) !== false && Object.getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

  return destObj;
}


/**
 * Check if the specified value is a typed array
 * 
 * @param value 
 * @returns 
 */
export function isTypedArray(value: any): value is NodeJS.TypedArray {
  const typedArrayConstructors = [
    Uint8Array,
    Uint8ClampedArray,
    Uint16Array,
    Uint32Array,
    Int8Array,
    Int16Array,
    Int32Array,
    BigUint64Array,
    BigInt64Array,
    Float32Array,
    Float64Array,
  ];

  let result: boolean = false;

  for (let i = 0; i < typedArrayConstructors.length; i++) {
    if (value instanceof typedArrayConstructors[i]) {
      result = true;
      break;
    }
  }

  return result;
}


/**
 * Check if two values are deeply equal
 * 
 * @param a 
 * @param b 
 * @returns 
 */
export function areDeeplyEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (
    typeof a !== 'object' || typeof b !== 'object'
    || Array.isArray(a) !== Array.isArray(b)
    || Object.keys(a).length !== Object.keys(b).length
  ) return false;

  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && JSON.stringify(a) === JSON.stringify(b);

  let result = true;

  for (const key of Object.keys(a)) {
    if (!areDeeplyEqual(a[key], b[key])) {
      result = false;
      break;
    }
  }

  return result;
}

export function debounce<T>(fn: GenericFunction<T>, timeout: number): GenericFunction<void> {
  let _timeout: ReturnType<typeof setTimeout> | null = null;

  return ((...args: any[]) => {
    if (_timeout) {
      clearTimeout(_timeout);
    }

    _timeout = setTimeout(() => fn(...args), timeout);
  });
}

export function throttle<T>(fn: GenericFunction<T>, t: number): GenericFunction<void> {
  let argv: Parameters<typeof fn> | null = null;
  let _timeout: ReturnType<typeof setTimeout> | null = null;

  function _timeoutCallback() {
    if (!argv || argv == null) return void (_timeout = null);
    fn(...argv);
    argv = null;
    _timeout = setTimeout(_timeoutCallback, t);
  }

  return ((...args: any[]) => {
    if (_timeout) return void (argv = args);
    fn(...args);
    _timeout = setTimeout(_timeoutCallback, t);
  });
}


/**
 * Returns the current time in milliseconds
 * 
 * @returns {number} The current time in milliseconds 
 */
export function now(): number {
  const time = typeof performance !== 'undefined' && typeof performance.now === 'function' ?
    performance.now() :
    Date.now();
  
  return time;
}


/** The most common HTTP methods */
export const validHttpMethods = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'options',
  'connect',
  'trace',
  'head',
] as const;


/**
 * Joins an array of strings with a separator
 * 
 * @param {any[]} arr Some array
 * @param {string} [separator=' | '] The separator to use
 * @returns {string} The joined string
 */
export function join<T extends any[]>(arr: T, separator: string = ' | '): string {
  return arr.map(item => {
    if(typeof item === 'string') return `'${item}'`;
    return item;
  }).join(separator);
}

/**
 * Returns a function that can only be called once
 * 
 * @param fn The function to wrap 
 * @returns The wrapped function
 */
export function once<T>(fn: (...args: any[]) => T): (...args: any[]) => T {
  let called = false;
  let result: T;

  return (...args: any[]) => {
    if(called) return result;

    called = true;
    return (result = fn(...args));
  };
}


/**
 * Maps an object to a new object
 * 
 * @param {object} obj The object to map 
 * @param {Function} mapper The mapper function 
 * @returns {object} The mapped object
 */
export function map<T extends Record<string | number | symbol, any>, V, K extends string | number | symbol>(obj: Record<K, V>, mapper: ((key: K, value: V) => any)): T {
  return Object.entries(obj).reduce((accumulator, [key, value]) => {
    return {
      ...accumulator,
      [key]: mapper(key as K, value as V),
    };
  }, {} as T);
}


/**
 * Removes duplicate values from an array
 * 
 * @param {any[]} arr The array to remove duplicates from 
 * @returns {any[]} The array without duplicates
 */
export function uniq<T extends unknown[]>(arr: T): T {
  return [...new Set(arr)] as T;
}

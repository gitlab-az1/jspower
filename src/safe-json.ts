import { isPlainObject, typeofTest } from './utils/is';


/**
 * Safely parse JSON data
 * 
 * @param {string} data A JSON string 
 * @returns {*} The parsed data or null if an error occurred
 */
export function jsonSafeParser<T>(data: string): T | null {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}


/**
 * Safely stringify JSON data
 * 
 * @param {*} data The data to stringify
 * @returns {string} A JSON string or null if an error occurred
 */
export function jsonSafeStringify<T>(data: T): string | null {
  if(typeof data !== 'object' && !Array.isArray(data)) return JSON.stringify(data);

  try {
    const safeData = Array.isArray(data) ? _replaceArrayCirculars(data) : _replaceObjectCirculars(data);
    return JSON.stringify(safeData);
  } catch (err: any) {
    console.error(err);
    return null;
  }
}

function _replaceArrayCirculars(arr: any[]): any[] {
  const safeValues = new Array(arr.length);

  for(const item of arr) {
    if(Array.isArray(item)) {
      safeValues.push(_replaceArrayCirculars(item));
    } else if(typeofTest('object')(item)) {
      safeValues.push(_replaceObjectCirculars(item));
    } else {
      safeValues.push(item);
    }
  }

  return safeValues;
}

function _replaceObjectCirculars(obj: any): any {
  const safeValues: Record<string | number | symbol, any> = {};
  let refsCount = 0,
    circularCount = 0;

  for(const prop in obj) {
    if(typeofTest('object')(obj[prop])) {
      if(Array.isArray(obj[prop])) {
        safeValues[prop] = _replaceArrayCirculars(obj[prop]);
      } else {
        safeValues[prop] = _replaceObjectCirculars(obj[prop]);
      }
    } else if(_isInstanceOf(obj[prop])) {
      safeValues[prop] = `<Ref *${++refsCount}>${obj[prop].constructor.name ? '(' + obj[prop].constructor.name + ')' : ''}`;
    } else if(_isCircularObject(obj[prop])) {
      safeValues[prop] = `[Circular *${++circularCount}]`;
    } else {
      safeValues[prop] = obj[prop];
    }
  }

  return safeValues;
}

function _isInstanceOf(thing: any) {
  if(
    typeofTest('object')(thing) &&
    !isPlainObject(thing) &&
    !Array.isArray(thing) &&
    (
      typeof thing[Symbol.toStringTag] === 'undefined' ||
        !thing[Symbol.toStringTag]
    ) &&
    !thing.toString
  ) return true;

  return false;
}

function _isCircularObject(thing: any): boolean {
  try {
    JSON.stringify(thing);
    return false;
  } catch {
    return true;
  }
}


const _default = {
  safeParse: jsonSafeParser,
  safeStringify: jsonSafeStringify,
} as const;

export default Object.freeze(_default);
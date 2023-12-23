import { enumToObject } from '../utils';
import { typeofTest } from '../utils/is';


export enum Type {
  string,
  nan,
  number,
  integer,
  float,
  boolean,
  date,
  bigint,
  symbol,
  function,
  undefined,
  null,
  array,
  object,
  unknown,
  promise,
  void,
  never,
  map,
  set,
}


const typeObject = enumToObject(Type) as Record<keyof typeof Type, keyof typeof Type>;


/**
 * Get the type of a value
 * 
 * @category Internal
 */
export function _getType(value: any): keyof typeof typeObject {
  const t = typeof value;

  switch(t) {
    case 'string':
      return typeObject.string;
    case 'undefined':
      return typeObject.undefined;
    case 'number':
      return isNaN(value) ? typeObject.nan : typeObject.number;
    case 'boolean':
      return typeObject.boolean;
    case 'function':
      return typeObject.function;
    case 'bigint':
      return typeObject.bigint;
    case 'symbol':
      return typeObject.symbol;
    case 'object':
      if(Array.isArray(value)) return typeObject.array;
      if(value == null) return typeObject.null;

      if(
        value.then &&
        typeofTest('function')(value.then) &&
        value.catch &&
        typeofTest('function')(value.catch)
      ) return typeObject.promise;

      if(typeof Map !== 'undefined' && value instanceof Map) return typeObject.map;
      if(typeof Set !== 'undefined' && value instanceof Set) return typeObject.set;
      if(typeof Date !== 'undefined' && value instanceof Date) return typeObject.date;

      return typeObject.object;
    default:
      return typeObject.unknown;
  }
}

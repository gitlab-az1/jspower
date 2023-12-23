import type { Dict } from '../types';


/**
 * Returns an array of a given object's own enumerable property names.
 * 
 * @param obj An object containing the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
 * @returns An array of strings that represent all the enumerable properties of the given object.
 */
export const objectKeys: ObjectConstructor['keys'] =
  typeof Object.keys === 'function'
    ? (obj: any) => Object.keys(obj)
    : (object: any) => {
      const keys = [];

      for(const key in object) {
        if(Object.prototype.hasOwnProperty.call(object, key)) {
          keys.push(key);
        }
      }

      return keys;
    };


    
/**
 * Converts an enum to an object.
 * 
 * @param e The enum to convert.
 * @returns An object.
 */
export function enumToObject<T extends string>(e: Record<T, string | number>): Record<T, string | number> {
  return objectKeys(e).reduce((accumulator, key) => {
    (accumulator as Dict<any>)[key] = e[key as T];
    return accumulator;
  }, {} as Record<T, string | number>);
}

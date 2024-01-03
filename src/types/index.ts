export * from './http';
export * from './common';
export * from './_external/type-fest';


/**
 * A type that can be either a single value or an array of that value.
 */
export type MaybeArray<T> = T | T[];


/**
 * A type that can be either a single value or a promise of that value.
 */
export type MaybePromise<T> = T | Promise<T>;


/**
 * Extract the type of the values in an array.
 */
export type ArrayValues<T> = T extends Array<infer U> ? U : never;


/**
 * Extract the type of the values in a promise.
 */
export type PromiseResult<T> = T extends () => Promise<infer U> ? U : never;

/**
 * Create a type that represents the properties of type `T` that are not present in type `U`.
 * 
 * The resulting type has the same properties as `T`, except for those that also exist in `U`, and each of those properties is marked as optional with the `?: never` type (indicating that it should not be present).
 */
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

/**
 * Create a type that represents the exclusive or (XOR) combination of types `T` and `U`.
 * 
 * It checks if either `T` or `U` extends object (meaning they are object types), and if so, it performs the XOR operation.
 * 
 * If `T` and `U` are objects, it creates a type that includes the properties that are exclusive to each type, effectively representing the XOR of the two types.
 */
export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
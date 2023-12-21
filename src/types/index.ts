export * from './common';
export * from './http';


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
'use strict';


import { isBoolean, isObject, isPlainObject } from '../utils/is';


interface InterceptorHandler<T> {
  readonly fulfilled: ((data: T) => void | Promise<void>);
  readonly rejected: ((reason?: string | Error) => void | Promise<void>);
  readonly synchronous: boolean;
  readonly index: number;
}

type UseInterceptorOptions = {
  readonly synchronous?: boolean;
}


/**
 * InterceptorsManager
 * A stack of interceptors for handling `then` and `reject` for a `Promise`
 * 
 * @template T The type of the data to be intercepted
 * 
 * @copyright axios
 * @license MIT
 * @see https://axios-http.com/
 * @see https://github.com/axios/axios/blob/v1.x/lib/core/InterceptorManager.js
 */
export class InterceptorsManager<T> {
  public readonly handlers: (Partial<InterceptorHandler<T>> | null)[] = [];

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  public use(
    fulfilled?: ((data: T) => void | Promise<void>),
    rejected?: ((reason?: string | Error) => void | Promise<void>),
    options?: UseInterceptorOptions,
  ): number {
    const index = this.handlers.length;

    this.handlers.push({
      synchronous: typeof options?.synchronous !== 'undefined' && isBoolean(options.synchronous) ? options.synchronous : false,
      fulfilled,
      rejected,
      index,
    });

    return this.handlers.length - 1;
  }

  /**
  * Remove an interceptor from the stack
  *
  * @param {Number} id The ID that was returned by `use`
  *
  * @returns {this} `true` if the interceptor was removed, `false` otherwise
  */
  public eject(id: number): this {
    if (this.handlers[id]) {
      this.handlers[id] = null;
      this.handlers.splice(id, 1);
    }

    return this;
  }

  /**
   * Clear all interceptors from the stack
   *
   * @returns {this}
   */
  public clear(): this {
    if (this.handlers) {
      (this as any).handlers = [];
    }

    return this;
  }

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} callback The function to call for each interceptor
   *
   * @returns {this}
   */
  public forEach(callback: ((item: InterceptorHandler<T>, index: number, array: InterceptorHandler<T>[]) => void | Promise<void>)): this {
    this.handlers.forEach(async (item, index, array) => {
      if (item != null && isObject(item) && isPlainObject(item)) {
        if(item.synchronous === true) {
          callback(item as any, index, array as any);
        } else {
          await callback(item as any, index, array as any);
        }
      }
    });

    return this;
  }
}

export default InterceptorsManager;
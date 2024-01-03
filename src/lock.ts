import { format } from 'node:util';

import { errno } from './ps-client/_utils';
import { LockTimeoutError, Throwable } from './errors';


const TIMEOUT_MESSAGE = 'Timeout while acquiring lock (%d waiting locks)';

const $locked = Symbol('Lock::$LOCKED');
const $timeout = Symbol('Lock::$TIMEOUT');
const $waiting = Symbol('Lock::$WAITING');
const $timeoutErrorMessage = Symbol('Lock::$TIMEOUT_ERROR_MESSAGE');


/**
 * Type definition for LockOptions
 */
export type LockOptions = {

  /** The timeout in milliseconds. */
  timeout: number;

  /** An optional description for the lock. */
  description?: string;
}

/** Class representing a lock with timeout functionality */
export class Lock {
  private [$locked]: boolean;
  private [$timeout]: number;
  private [$waiting]: Set<() => Promise<void>>;
  private [$timeoutErrorMessage]: () => string;

  /**
   * Constructor for the Lock class.
   * @param options Lock options including timeout and optional description.
   * @throws {Throwable} Throws an error if the 'timeout' is not a number.
   */
  constructor(options: LockOptions) {
    if(typeof options.timeout !== 'number') {
      throw new Throwable(`'timeout' is not a number, received '${typeof options.timeout}'`, {
        errno: errno.invalid_argument,
      });
    }

    this[$locked] = false;
    this[$waiting] = new Set();
    this[$timeout] = options.timeout;
    this[$timeoutErrorMessage] = () => {
      const _formated = format(TIMEOUT_MESSAGE, this[$waiting].size);

      return options.description && options.description.trim().length > 0 ?
        `${_formated}: "${options.description}"` :
        _formated;
    };
  }

  /**
   * Asynchronously acquires the lock.
   * @returns A Promise that resolves when the lock is acquired, or rejects with a LockTimeoutError.
   */
  public async acquire(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if(!this[$locked]) {
        this[$locked] = true;
        return resolve(void 0);
      }

      let timeoutId = null;
      const tryAcquire = async () => {
        if(!this[$locked]) {
          this[$locked] = true;
          clearTimeout(timeoutId!);
          this[$waiting].delete(tryAcquire);
          return resolve(void 0);
        }
      };

      this[$waiting].add(tryAcquire);
      timeoutId = setTimeout(() => {
        const err = new LockTimeoutError(this[$timeoutErrorMessage]());
        this[$waiting].delete(tryAcquire);

        reject(err);
      }, this[$timeout]);
    });
  }

  /**
   * Releases the lock and returns the result of the first waiting function.
   * @returns The result of the first waiting function or null if no function is waiting.
   */
  public release<T>(): T | null {
    this[$locked] = false;
    const waiting = this[$waiting].values().next().value;

    if(waiting) return waiting();
    return null;
  }
}

export default Lock;
import * as math from '../math';
import delayPromise from './delay';
import { Exception } from '../errors/exception';
import { createRetry } from '../ps-client/retry';


type RetryOptions = {
  retries?: number;
  minTimeout?: number;
  maxTimeout?: number;
  factor?: number;
  delay?: number;
};

export async function asyncRetry<T>(
  fn: ((...args: any[]) => Promise<T>),
  options: RetryOptions,
  ...args: any[]
): Promise<T> {
  const {
    retries = 3,
    minTimeout = 1000,
    maxTimeout = 5000,
    factor = 2,
    delay = 0,
  } = options;

  let retryCount = 0;
  let timeout = minTimeout;

  while(retryCount < retries) {
    try {
      const result = await fn(...args);
      return result;
    } catch (error: any) {
      retryCount++;

      if(retryCount >= retries) {
        throw new Exception(error.message || error);
      }

      await delayPromise(timeout + delay);
      timeout = math.min(maxTimeout, timeout * factor);
    }
  }

  throw new Exception(`Retry failed after ${retries} attempts.`, { context: { function: fn.toString() } });
}

export const createAdvancedRetry = createRetry;

export default asyncRetry;
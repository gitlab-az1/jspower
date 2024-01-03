import { errno } from '../ps-client/_utils';
import type { MaybePromise } from '../types';
import { GatewayTimeoutError } from '../errors/http/extended';


export type WaitForOptions = {
  delay?: number;
  maxWait?: number;
  ignoreTimeout?: boolean;
  timeoutMessage?: string;
}

export async function waitFor<T>(fn: ((tw: number) => MaybePromise<T>),
  options?: WaitForOptions): Promise<T> {
  const { delay = 50, maxWait = 10000, ignoreTimeout = false } = options ?? {};

  let timeoutId = null;
  let totalWait = 0;
  let fulfilled = false;

  const _check = async (resolve: (value: any) => void, reject: (reason?: any) => void) => {
    totalWait += delay;
    if(fulfilled) return;

    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      const result = await fn(totalWait);

      if(result) {
        fulfilled = true;
        clearTimeout(timeoutId!);
        return resolve(result);
      }

      _check(resolve, reject);
    } catch (err: any) {
      fulfilled = true;
      clearTimeout(timeoutId!);
      return reject(err);
    }
  };

  return new Promise((resolve, reject) => {
    _check(resolve, reject);
    if(ignoreTimeout) return;

    timeoutId = setTimeout(() => {
      if(fulfilled) return;

      fulfilled = true;
      reject(new GatewayTimeoutError(options?.timeoutMessage ?? 'Timed out while waiting for condition.', undefined, undefined, {
        errno: errno.gateway_timeout,
      }));
    }, maxWait);
  });
}

export default waitFor;
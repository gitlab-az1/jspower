import math from '../math';
import AbortedError from './errors/AbortedError';
import NonRetriableError from './errors/NonRetriableError';
import MaximumNumberOfRetriesExceededError from './errors/MaximumNumberOfRetriesExceededError';


type Resolver<T> = (value?: T | PromiseLike<T>) => void;
type Rejector = (reason?: any) => void;

/**
 * Options for retrying a function
 */
export type RetryOptions = {
  maxRetryTime?: number;
  initialRetryTime?: number;
  factor?: number;
  multiplier?: number;
  retries?: number;
  restartOnFailure?: (e: Error) => Promise<boolean>;
};

const DEFUALT_OPTIONS: RetryOptions = {
  maxRetryTime: 30 * 1000,
  initialRetryTime: 300,
  factor: 0.2, // randomization factor
  multiplier: 2, // exponential factor
  retries: 5, // max retries
};



const randomFromRetryTime = (factor: number, retryTime: number): number => {
  const delta = factor * retryTime;
  return math.random.uniform(retryTime - delta, retryTime + delta, 'ceil');
};

const UNRECOVERABLE_ERRORS = ['RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'Throwable'];
const isErrorUnrecoverable = (e: Record<string, any>) => UNRECOVERABLE_ERRORS.includes(e.name);

const isErrorRetriable = (error: Record<string, any>) => (
  (error.retriable || error.retriable !== false) &&
  !isErrorUnrecoverable(error)
);


function _initRetriableFrame<T>(
  options: Required<RetryOptions>,
  resolve: Resolver<T>,
  reject: Rejector,
  method: ((abort: (err?: any) => void, rc: number, rt: number) => Promise<T>) // eslint-disable-line comma-dangle
): ((rt: number, rc?: number) => void) {
  let aborted = false;
  const { factor, multiplier, maxRetryTime, retries } = options;

  const bail = (error: Error | Record<string, any>) => {
    aborted = true;
    reject(error ?? new AbortedError('Function aborted'));
  };

  const calculateExponentialRetryTime = (retryTime: number) => {
    return math.min(randomFromRetryTime(factor, retryTime) * multiplier, maxRetryTime);
  };

  const retry = (rt: number, rc: number = 0) => {
    if(aborted) return;

    const nextTime = calculateExponentialRetryTime(rt);
    const shouldRetry = rc < retries;

    const scheduleNext = () => {
      if(!shouldRetry) return;
      setTimeout(() => retry(nextTime, rc + 1), rt);
    };

    method(bail, rc, rt)
      .then(resolve)
      .catch(err => {
        if(!isErrorRetriable(err)) return reject(err instanceof NonRetriableError ? 
          err :
          new NonRetriableError(err.message ?? 'Unknown error', err.cause ?? 'Unknown cause', {
            _inner: err,
            _innerName: err.name,
          }) // eslint-disable-line comma-dangle
        );

        if(!shouldRetry) return reject(new MaximumNumberOfRetriesExceededError(
          err.message ?? 'Unknown error',
          err.cause ?? 'Unknown cause',
          rc,
          rt,
          {
            _inner: err,
            _innerName: err.name,
          } // eslint-disable-line comma-dangle
        ));

        scheduleNext();
      });
  };

  return retry;
}


/**
 * A function that retries a function
 */
export type RetryableFunction = (<T>(fn: ((bail: (error?: Error | Record<string, any>) => void, rc: number, rt: number) => Promise<T>)) => Promise<T>);

/**
 * Create a function that retries a function
 * @param options 
 */
export function createRetry(options?: RetryOptions): RetryableFunction {
  return <T>(fn: ((bail: ((error?: Error | Record<string, any>) => void), rc: number, rt: number) => Promise<T>)) => {
    return new Promise<T>((resolve, reject) => {
      const o = Object.assign({}, DEFUALT_OPTIONS, options) as Required<RetryOptions>;
      const start = _initRetriableFrame<T>(o, resolve as () => void, reject, fn);

      start(randomFromRetryTime(o.factor, o.initialRetryTime));
    });
  };
}

export default createRetry;
import type { MaybePromise } from './types';

const $done = Symbol('Limiter::$DONE');
const $run = Symbol('Limiter::$RUN');


/**
 * Type definition for a job function that may return a promise
 */
export type Job = (next?: () => void) => MaybePromise<void>;

/**
 * Limiter class that manages the execution of concurrent jobs with optional intervals between them.
 */
export class Limiter {
  private readonly [$done]: () => void;

  private readonly _concurrency: number;
  private readonly _interval: number;
  private readonly _jobs: any[];
  private _pending: number;

  /**
   * Constructs a Limiter instance with optional concurrency and interval parameters.
   */
  constructor();

  /**
   * Constructs a Limiter instance with optional concurrency and interval parameters.
   * @param concurrency The maximum number of jobs allowed to run concurrently.
   */
  constructor(concurrency: number);

  /**
   * Constructs a Limiter instance with optional concurrency and interval parameters.
   * @param concurrency The maximum number of jobs allowed to run concurrently.
   * @param interval The time interval between consecutive job executions (in milliseconds).
   */
  constructor(concurrency: number, interval: number);

  /**
   * Constructs a Limiter instance with optional concurrency and interval parameters.
   * @param concurrency The maximum number of jobs allowed to run concurrently.
   * @param interval The time interval between consecutive job executions (in milliseconds).
   */
  constructor(concurrency: number, interval?: number);

  /**
   * Constructs a Limiter instance with optional concurrency and interval parameters.
   * @param concurrency The maximum number of jobs allowed to run concurrently.
   * @param interval The time interval between consecutive job executions (in milliseconds).
   */
  constructor(concurrency?: number, interval?: number) {
    this._concurrency = concurrency || Infinity - 1;
    this._interval = interval || 0;
    this._pending = 0;
    this._jobs = [];

    this[$done] = () => {
      this._pending--;
      this[$run]();
    };
  }

  /**
   * Adds a new job to the Limiter for execution.
   * @param job The job function to be executed.
   */
  public add(job: Job): void {
    this._jobs.push(job);
    this[$run]();
  }

  /**
   * Internal method responsible for triggering the execution of pending jobs.
   */
  private [$run](): void {
    // Check if the concurrency limit has been reached
    if(this._pending === this._concurrency) return;

    // Check if there are pending jobs in the queue
    if(this._jobs.length > 0) {
      // Dequeue the next job
      const job = this._jobs.shift();
      if(!job) return;

      if(this._interval > 0) { // Execute the job after the specified interval if applicable
        setTimeout(() => {
          this._pending++;
          job(this[$done]);
        }, this._interval);
      } else { // Execute the job immediately
        this._pending++;
        job(this[$done]);
      }
    }
  }
}

export default Limiter;
import { errno } from '../_utils';
import type { Dict } from '../../types';


export class MaximumNumberOfRetriesExceededError extends Error {
  public readonly errno: number;
  public readonly cause: string;
  public readonly retryTime: number;
  public readonly retryCount: number;
  public readonly context: Dict<any>;
  public override readonly message: string;
  public override readonly name = 'MaximumNumberOfRetriesExceededError' as const;

  constructor(
    message: string,
    cause: string,
    retryCount: number,
    retryTime: number,
    context?: Dict<any> // eslint-disable-line comma-dangle
  ) {
    super(message);

    Object.assign(this, (context ?? {}));
    this.context = context ?? {};

    this.cause = cause;
    this.message = message;
    this.retryTime = retryTime;
    this.retryCount = retryCount;
    this.errno = errno.retry_limit_exceeded;
  }
}

export default MaximumNumberOfRetriesExceededError;
import { errno } from '../_utils';
import type { Dict } from '../../types';


export class NonRetriableError extends Error {
  public readonly errno: number;
  public readonly cause: string;
  public readonly context: Dict<any>;
  public override readonly message: string;
  public override readonly name = 'NonRetriableError' as const;

  constructor(message: string, cause: string, options?: Dict<any>);
  constructor(message: string, cause: string, statusCode: number, options?: Dict<any>);
  constructor(
    message: string,
    cause: string,
    statusCodeOrOptions?: number | Dict<any>,
    options?: Dict<any> // eslint-disable-line comma-dangle
  ) {
    super(message);

    if(typeof statusCodeOrOptions === 'object') {
      Object.assign(this, statusCodeOrOptions);
      
      this.context = statusCodeOrOptions;
    } else if(typeof statusCodeOrOptions === 'number') {
      Object.assign(this, { options, statusCode: statusCodeOrOptions });

      this.context = options ?? {};
      this.context.statusCode = statusCodeOrOptions;
    } else {
      this.context = {};
    }

    this.cause = cause;
    this.message = message;
    this.errno = errno.non_retriable;
    this.name = 'NonRetriableError' as const;
  }
}

export default NonRetriableError;
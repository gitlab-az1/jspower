import { errno } from '../_utils';
import type { Dict } from '../../types';


export class AbortedError extends Error {
  public readonly errno: number;
  public readonly reason: string;
  public readonly context: Dict<any>;
  public override readonly message: string;
  public override readonly name = 'AbortedError' as const;

  constructor(message: string, context?: Dict<any>) {
    super(message);
    Object.assign(this, context ?? {});
    
    this.reason = message;
    this.message = message;
    this.context = context ?? {};
    this.name = 'AbortedError' as const;
    this.errno = errno.operation_aborted;
  }
}

export default AbortedError;
import type { Dict } from '../../types';
import { errno } from '../_utils';


export class LockTimeoutError extends Error {
  public readonly errno: number;
  public readonly context: Dict<any>;
  public override readonly message: string;
  public override readonly name = 'LockTimeoutError' as const;

  constructor(message: string, context?: Dict<any>) {
    super(message);
    Object.assign(this, context ?? {});

    this.message = message;
    this.context = context ?? {};
    this.errno = errno.lock_timeout;
  }
}

export default LockTimeoutError;
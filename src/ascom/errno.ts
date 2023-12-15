import { errnoMessage } from './_utils';

/**
 * The error number class.
 * 
 * @class Errno
 */
export class Errno {
  public readonly code: number;
  public readonly message: string;
  public readonly location: string;

  constructor(code: number, loc: string) {
    this.code = code;
    this.location = loc;
    this.message = errnoMessage(code);
  }

  /**
   * Returns a string representation of the error number.
   * 
   * @returns {string} A string representation of the error number.
   * @memberof Errno
   */
  public toString(): string {
    return `[${this.location}] ${this.message}`;
  }

  public [Symbol.toStringTag]() {
    return '[object Errno]';
  }
}

export default Errno;
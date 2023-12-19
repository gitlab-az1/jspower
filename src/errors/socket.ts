import type { Dict } from '../types';
import { Exception } from './exception';


export class WebSocketError extends Exception {
  public override readonly name = 'WebSocketError' as const;
  public readonly origin: string;
  public readonly code: number;

  constructor(message: string, origin: string, code: number, contextObject?: Dict<any>) {
    super(message, contextObject);

    this.origin = origin;
    this.code = code;
  }
}

export default WebSocketError;
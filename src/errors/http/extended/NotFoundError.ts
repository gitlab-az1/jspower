import type { Dict } from '../../../types';

import { ExtendedSerializableError, SerializedError } from './core';


export class NotFoundError extends ExtendedSerializableError {
  public override readonly statusCode = 404 as const;
  public override readonly name = 'NotFoundError' as const;

  constructor(message: string, action?: string, location?: string, context?: Dict<any>, errors?: SerializedError[]) {
    super(message, {
      action,
      errors,
      context,
      location,
      statusCode: 404 as const,
    });
  }
}

export default NotFoundError;
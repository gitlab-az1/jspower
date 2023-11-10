import { Exception } from './exception';


export class HTTPError extends Exception {
  public override readonly message: string;
  public readonly response?: any;
  public readonly status: number;
  public readonly request?: any;
  public readonly code: number;
  public readonly config?: any;

  constructor(message: string, code: number, config?: any, request?: any, response?: any) {
    super(message);
    Error.call(this);
  
    if(Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error()).stack;
    }
  
    this.message = message;
    this.code = code;
    this.config = config;
    this.request = request;
    this.response = response;
  }
}


export class BadRequestError extends HTTPError {
  constructor(message: string, context?: any) {
    super(message, 400, context);
  }
}

export class UnauthorizedError extends HTTPError {
  constructor(message: string, context?: any) {
    super(message, 401, context);
  }
}

export class ForbiddenError extends HTTPError {
  constructor(message: string, context?: any) {
    super(message, 403, context);
  }
}

export class NotFoundError extends HTTPError {
  constructor(message: string, context?: any) {
    super(message, 404, context);
  }
}

export class MethodNotAllowedError extends HTTPError {
  constructor(message: string, context?: any) {
    super(message, 405, context);
  }
}

export class NotAcceptableError extends HTTPError {
  constructor(message: string, context?: any) {
    super(message, 406, context);
  }
}

export class RequestTimeoutError extends HTTPError {
  constructor(message: string, context?: any) {
    super(message, 408, context);
  }
}

export class ConflictError extends HTTPError {
  constructor(message: string, context?: any) {
    super(message, 409, context);
  }
}

export class InternalServerError extends HTTPError {
  constructor(message: string, context?: any) {
    super(message, 500, context);
  }
}


export class ServiceUnavaliableError extends HTTPError {
  constructor(message: string, context?: any) {
    super(message, 503, context);
  }
}


export class GatewayTimeoutError extends HTTPError {
  constructor(message: string, context?: any) {
    super(message, 504, context);
  }
}
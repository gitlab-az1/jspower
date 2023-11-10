type AlphanumericStatusCodeObject = {
  [key: number]: string;
} & {
  readonly Continue: number;
  readonly SwitchingProtocols: number;
  readonly Processing: number;
  readonly EarlyHints: number;
  readonly Ok: number;
  readonly Created: number;
  readonly Accepted: number;
  readonly NonAuthoritativeInformation: number;
  readonly NoContent: number;
  readonly ResetContent: number;
  readonly PartialContent: number;
  readonly MultiStatus: number;
  readonly AlreadyReported: number;
  readonly ImUsed: number;
  readonly MultipleChoices: number;
  readonly MovedPermanently: number;
  readonly Found: number;
  readonly SeeOther: number;
  readonly NotModified: number;
  readonly UseProxy: number;
  readonly Unused: number;
  readonly TemporaryRedirect: number;
  readonly PermanentRedirect: number;
  readonly BadRequest: number;
  readonly Unauthorized: number;
  readonly PaymentRequired: number;
  readonly Forbidden: number;
  readonly NotFound: number;
  readonly MethodNotAllowed: number;
  readonly NotAcceptable: number;
  readonly ProxyAuthenticationRequired: number;
  readonly RequestTimeout: number;
  readonly Conflict: number;
  readonly Gone: number;
  readonly LengthRequired: number;
  readonly PreconditionFailed: number;
  readonly PayloadTooLarge: number;
  readonly UriTooLong: number;
  readonly UnsupportedMediaType: number;
  readonly RangeNotSatisfiable: number;
  readonly ExpectationFailed: number;
  readonly ImATeapot: number;
  readonly MisdirectedRequest: number;
  readonly UnprocessableEntity: number;
  readonly Locked: number;
  readonly FailedDependency: number;
  readonly TooEarly: number;
  readonly UpgradeRequired: number;
  readonly PreconditionRequired: number;
  readonly TooManyRequests: number;
  readonly RequestHeaderFieldsTooLarge: number;
  readonly UnavailableForLegalReasons: number;
  readonly InternalServerError: number;
  readonly NotImplemented: number;
  readonly BadGateway: number;
  readonly ServiceUnavailable: number;
  readonly GatewayTimeout: number;
  readonly HttpVersionNotSupported: number;
  readonly VariantAlsoNegotiates: number;
  readonly InsufficientStorage: number;
  readonly LoopDetected: number;
  readonly NotExtended: number;
  readonly NetworkAuthenticationRequired: number;
}


const HttpStatusCode: AlphanumericStatusCodeObject = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
};

Object.entries(HttpStatusCode).forEach(([key, value]) => {
  HttpStatusCode[value as number] = (key as string).replace(/([A-Z])/g, w => {
    return ` ${w.toLowerCase()}`;
  }).trim();
});


export default Object.freeze(HttpStatusCode);
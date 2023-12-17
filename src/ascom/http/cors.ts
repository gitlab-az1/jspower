import {
  RequestLike,
  ResponseLike,
  type NextFunctionLike,
} from '../../http/core';


/**
 * Configuration for CORS.
 */
export type Cors = {
  origin?: string[];
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
};


/**
 * CORS middleware function.
 * @param options - Configuration options for CORS.
 */
export default (function(options?: Cors) {

  /**
   * Checks if the provided origin is allowed.
   * @param _ - Request object (not used).
   * @param origin - Origin header value.
   * @returns True if the origin is allowed, false otherwise.
   */
  async function _CheckOrigin(_: RequestLike, origin: string | null): Promise<boolean> {
    if(!origin
      || origin == null
      || origin == undefined
      || origin === 'null') return true;

    return (
      options?.origin ? 
        options?.origin?.includes(origin) :
        false
    );
  }

  /**
   * Extracts the origin from the request's headers.
   * @param request - Request object.
   * @returns Extracted origin value.
   */
  function _ExtractOrigin(request: RequestLike): string | null {
    function __getOriginHeaderFromRequestAsObject(): string | null {
      if(request.headers instanceof Headers) return null;

      let origin: string | string[] | null = (request.headers as Record<string, string | string[]>)['origin'];
      if(!origin) return null;

      if(Array.isArray(origin)) {
        if(origin.length < 1) {
          origin = null;
        } else {
          origin = origin[0];
        }
      }

      return origin;
    }

    function __getOriginHeaderFromRequestAsClass() {
      if(!(request.headers instanceof Headers)) return null;
      
      const origin = request.headers.get('origin');
      if(!origin) return null;
    
      return origin;
    }

    function __getHostHeaderFromRequestAsObject(): string | null {
      if(request.headers instanceof Headers) return null;

      let host: string | string[] | null = (request.headers as Record<string, string | string[]>)['host'];
      if(!host) return null;

      if(Array.isArray(host)) {
        if(host.length < 1) {
          host = null;
        } else {
          host = host[0];
        }
      }

      return host;
    }

    function __getHostHeaderFromRequestAsClass() {
      if(!(request.headers instanceof Headers)) return null;
      
      const host = request.headers.get('host');
      if(!host) return null;
    
      return host;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let isOriginHost = false;
  
    const origin = (function() {
      const o = (
        __getOriginHeaderFromRequestAsObject() ??
        __getOriginHeaderFromRequestAsClass()
      );

      if(o && o.trim().length > 0) return o;
      
      const h = (
        __getHostHeaderFromRequestAsObject() ??
        __getHostHeaderFromRequestAsClass()
      );

      if(!h || h.trim().length < 1) return null;

      isOriginHost = true;
      return h;
    })();

    if(!origin) return null;
    return origin;
  }

  /**
   * Dispatches a 403 Forbidden error for an invalid origin.
   * @param response - Response object.
   */
  function _DispatchInvalidOriginError(response: ResponseLike): void {
    response.status(403);
    return response.end();
  }

  /**
   * Dispatches a success response for CORS preflight options request.
   * @param response - Response object.
   */
  function _DispatchOptionsSuccess(response: ResponseLike): void {
    response.status(options?.optionsSuccessStatus ?? 204);
    return response.end();
  }

  /**
   * Actual middleware function handling CORS headers.
   * @param _request - Request object.
   * @param _response - Response object.
   * @param _next - Next function.
   */
  return async (_request: RequestLike, _response: ResponseLike, _next: NextFunctionLike) => {
    options ??= {};

    const allowAllOrigin = options.origin?.includes('*');
    const isOriginValid = await _CheckOrigin(_request, allowAllOrigin ? 'null' : _ExtractOrigin(_request));

    if(!isOriginValid) return _DispatchInvalidOriginError(_response);

    _response.setHeader('Access-Control-Allow-Origin', String(allowAllOrigin ? '*' : _ExtractOrigin(_request)));
    _response.setHeader('Access-Control-Allow-Methods', options.methods?.join(',') ?? 'GET,HEAD,PUT,PATCH,POST,DELETE');
    _response.setHeader('Access-Control-Allow-Headers', options.allowedHeaders?.join(',') ?? '*');
    _response.setHeader('Access-Control-Expose-Headers', options.exposedHeaders?.join(',') ?? '*');
    _response.setHeader('Access-Control-Allow-Credentials', String(options.credentials ?? true));
    _response.setHeader('Access-Control-Max-Age', String(options.maxAge ?? 86400));

    if(_request.method.toLowerCase().trim() === 'options') return _DispatchOptionsSuccess(_response);
    return _next();
  };
});
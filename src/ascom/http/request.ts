import { State } from '../../state';
import { Exception } from '../../errors';
import { ssrSafeWindow } from '../../ssr';
import { isBrowser } from '../../constants';
import { Headers } from '../../http/headers';
import { getPreciseTime } from '../../utils';
import { Response as HTTPResponse } from '../../http/response';
import { isPlainObject, isStream, isString } from '../../utils/is';
import { HttpHeaders, type HttpMethod, type Dict } from '../../types';


/**
 * Represents the supported HTTP request methods.
 */
export enum RequestMethod {
  GET,
  POST,
  PUT,
  DELETE,
  PATCH,
  HEAD,
  OPTIONS,
  CONNECT
}

/**
 * Represents the properties of an HTTP request.
 */
type RequestProps = {
  timeout?: number;
  url: string | URL;
  userAgent?: string;
  signal?: AbortSignal;
  maxRedirects?: number;
  headers?: HttpHeaders;
  method?: RequestMethod;
  redirect?: 'follow' | 'manual' | 'error';
  body?: XMLHttpRequestBodyInit | Dict<any> | Document | ReadableStream;
  auth?: {
    username: string;
    password: string;
  }
};


/**
 * Check if the provided string is a valid HTTP request method.
 * 
 * @param method - The HTTP request method to validate.
 * @returns True if the method is valid, false otherwise.
 */
export function validateRequestMethod(method: string): method is HttpMethod {
  if(!method) return false;

  const validMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'connect'];
  return validMethods.includes(method.toLowerCase());
}


function _methodEnumToName(method: RequestMethod): HttpMethod {
  switch(method) {
    case RequestMethod.GET:
      return 'GET';
    case RequestMethod.POST:
      return 'POST';
    case RequestMethod.PUT:
      return 'PUT';
    case RequestMethod.DELETE:
      return 'DELETE';
    case RequestMethod.PATCH:
      return 'PATCH';
    case RequestMethod.HEAD:
      return 'HEAD';
    case RequestMethod.OPTIONS:
      return 'OPTIONS';
    case RequestMethod.CONNECT:
      return 'CONNECT';
    default:
      throw new Error('Invalid request method');
  }
}

function _methodNameToEnum(method: HttpMethod): RequestMethod {
  switch(method.toLowerCase()) {
    case 'get':
      return RequestMethod.GET;
    case 'post':
      return RequestMethod.POST;
    case 'put':
      return RequestMethod.PUT;
    case 'delete':
      return RequestMethod.DELETE;
    case 'patch':
      return RequestMethod.PATCH;
    case 'head':
      return RequestMethod.HEAD;
    case 'options':
      return RequestMethod.OPTIONS;
    case 'connect':
      return RequestMethod.CONNECT;
    default:
      throw new Error('Invalid request method');
  }
}


function _dispatchRequest(_RequestProps: RequestProps): Promise<HTTPResponse> {
  function __$RequestXHR(props: RequestProps): Promise<HTTPResponse> {
    if(!ssrSafeWindow) {
      throw new Exception('XHR requests are not supported in this environment');
    }

    function __isXHRRedirect(object: XMLHttpRequest): boolean {
      if(object.readyState !== 4) return false;
      return object.status >= 300 && object.status <= 399;
    }

    function __parseXHRHeaders(object: XMLHttpRequest): Dict<string> {
      if(object.readyState !== 4) return {};

      const headers = object.getAllResponseHeaders();
      const result: Dict<string> = {};

      if(!headers) return result;

      const lines = headers.split('\r\n');
      for(const line of lines) {
        const [key, value] = line.split(': ');
        if(!key || !value) continue;

        result[key] = value;
      }

      return result;
    }

    const startTime = getPreciseTime();

    const method = _methodEnumToName(props.method ?? RequestMethod.GET);
    const headers = new Headers(props.headers);
    const abortReason = new State<string>('');

    if(!validateRequestMethod(method)) {
      throw new Exception(`[ascom/http] Invalid request method: ${method}`);
    }

    if(props.body) {
      if(typeof props.body === 'object' && isPlainObject(props.body)) {
        props.body = JSON.stringify(props.body);

        headers.set('Content-Type', 'application/json; charset=UTF-8');
        headers.set('Content-Length', props.body.length.toString());
      }
  
      if((props.body instanceof ReadableStream) || isStream(props.body)) {
        throw new Exception('[ascom/http] Streams can only be used in fetch driver');
      }
    }

    if(props.userAgent) {
      headers.set('User-Agent', props.userAgent);
    }

    const xhr = new ssrSafeWindow.XMLHttpRequest();
    xhr.open(method, props.url, true, props.auth?.username, props.auth?.password);

    xhr.responseType = 'arraybuffer';

    if(props.signal) {
      props.signal.addEventListener('abort', (reason: any) => {
        abortReason.set(isString(reason) ? reason : reason.reason || reason.message || 'Unknown abort reason');
        xhr.abort();
      });
    }

    for(const [name, value] of headers.entries()) {
      xhr.setRequestHeader(name, value);
    }

    const responsePromise = new Promise<HTTPResponse>((resolve, reject) => {
      xhr.onerror = () => {
        reject(new Exception(`[ascom/http] Request failed with status code ${xhr.status}`, {
          status: xhr.status,
          url: props.url instanceof URL ? 
            props.url.href :
            props.url,
        }));
      };

      xhr.onabort = () => {
        const hasReason = abortReason.get() && abortReason.get().trim().length > 0;
        reject(new Exception(hasReason ? `[ascom/http] Request was aborted: ${abortReason.get()}` : '[ascom/http] Request was aborted'));
      };

      xhr.onloadend = () => {
        if(xhr.readyState !== 4) return reject(new Exception('[ascom/http] Failed to load response', {
          status: xhr.status,
          responseBuffer: xhr.response,
          url: props.url instanceof URL ? 
            props.url.href :
            props.url,
        }));

        const isRedirect = __isXHRRedirect(xhr);

        if(isRedirect && props.redirect === 'error') return reject(new Exception(`[ascom/http] Request failed with status code ${xhr.status}`, {
          status: xhr.status,
          url: props.url instanceof URL ? 
            props.url.href :
            props.url,
          reason: 'One or more redirects',
        }));
  
        if(isRedirect && props.redirect === 'follow') {
          if(!props.maxRedirects) return reject(new Exception('[ascom/http] Infinite circular redirects detected'));
  
          const loc = xhr.getResponseHeader('Location') ||
              xhr.getResponseHeader('location');
  
          if(props.maxRedirects && xhr.status >= 300 && xhr.status <= 399 && loc) {
            if(props.maxRedirects <= 0) return reject(new Exception(`[ascom/http] Maximum redirects exceeded for ${props.url instanceof URL ? props.url.href : props.url}`));
  
            return resolve(_dispatchRequest({
              ...props,
              url: xhr.getResponseHeader('Location') ||
                xhr.getResponseHeader('location') as string,
              maxRedirects: props.maxRedirects - 1,
            }));
          }
        }
  
        setTimeout(() => {
          const endTime = getPreciseTime() - 250;
  
          const responseObject = new HTTPResponse(xhr.response, {
            status: xhr.status,
            headers: __parseXHRHeaders(xhr),
            responseTime: endTime - startTime,
          });
  
          return resolve(responseObject);
        }, 500);
      };
    });

    if(props.timeout && !Number.isNaN(props.timeout) && Number.isFinite(props.timeout) && props.timeout > 0) return (() => {
      xhr.send(props.body as XMLHttpRequestBodyInit | Document | undefined);

      return Promise.race([
        responsePromise,
        new Promise((_, reject) => {
          setTimeout(() => {
            abortReason.set(`Request timeout exceeded for ${props.url instanceof URL ? props.url.href : props.url} in ${props.timeout}ms`);

            xhr.abort();
            reject();
          }, props.timeout);
        }),
      ]) as Promise<HTTPResponse>;
    })();

    xhr.send(props.body as XMLHttpRequestBodyInit | Document | undefined);
    return responsePromise;
  }

  function __$RequestFetch(props: RequestProps): Promise<HTTPResponse> {
    const method = _methodEnumToName(props.method ?? RequestMethod.GET);
    const headers = new Headers(props.headers);
    const abortReason = new State<string>('');

    const startTime = getPreciseTime();
    const ac = new AbortController();
    
    if(props.signal) {
      props.signal.addEventListener('abort', (reason: any) => {
        abortReason.set(isString(reason) ? reason : reason.reason || reason.message || 'Unknown abort reason');
        ac.abort(abortReason.get());
      });
    }

    if(!validateRequestMethod(method)) {
      throw new Exception(`[ascom/http] Invalid request method: ${method}`);
    }

    if(props.body) {
      if(typeof props.body === 'object' && isPlainObject(props.body)) {
        props.body = JSON.stringify(props.body);

        headers.set('Content-Type', 'application/json; charset=UTF-8');
        headers.set('Content-Length', props.body.length.toString());
      }

      if(props.body instanceof Document) {
        throw new Exception('[ascom/http] Documents can only be used in XHR driver');
      }
  
      if((props.body instanceof ReadableStream) || isStream(props.body)) {
        headers.set('Content-Type', 'application/octet-stream');
      }
    }

    if(props.userAgent) {
      headers.set('User-Agent', props.userAgent);
    }

    if(props.auth) {
      const encoded = btoa(`${props.auth.username}:${props.auth.password}`);
      headers.set('Authorization', `Basic ${encoded}`);
    }

    const responsePromise = new Promise<HTTPResponse>((resolve, reject) => {
      fetch(props.url, {
        method,
        signal: ac.signal,
        redirect: props.redirect ?? 'follow',
        headers: headers.toObject() as Dict<string>,
        body: props.body as XMLHttpRequestBodyInit | ReadableStream | undefined,
      }).then((response: Response) => {
        const h = Object.fromEntries(response.headers.entries());

        if(props.maxRedirects && response.redirected) {
          if(props.maxRedirects <= 0) return reject(new Exception(`[ascom/http] Maximum redirects exceeded for ${props.url instanceof URL ? props.url.href : props.url}`));
    
          return resolve(_dispatchRequest({
            ...props,
            url: response.url,
            maxRedirects: props.maxRedirects - 1,
          }));
        }

        response.arrayBuffer().then(buffer => {
          const endTime = getPreciseTime();
          const responseObject = new HTTPResponse(buffer, {
            headers: h,
            status: response.status,
            responseTime: endTime - startTime,
          });

          return resolve(responseObject);
        }).catch(reject);
      }).catch(reject);
    });

    if(!props.timeout ||
      Number.isNaN(props.timeout) ||
      !Number.isFinite(props.timeout) ||
      props.timeout <= 0) return responsePromise;

    return Promise.race<HTTPResponse>([
      responsePromise,
      new Promise((_, reject) => {
        setTimeout(() => {
          abortReason.set(`Request timeout exceeded for ${props.url instanceof URL ? props.url.href : props.url} in ${props.timeout}ms`);

          ac.abort();
          reject();
        }, props.timeout);
      }),
    ]);
  }

  const driver = (
    isBrowser &&
    typeof ssrSafeWindow?.XMLHttpRequest !== 'undefined' &&
    !isPlainObject(ssrSafeWindow.XMLHttpRequest)
  ) ? __$RequestXHR : __$RequestFetch;

  return driver(_RequestProps);
}


/**
 * Represents the initialization options for an HTTP request.
 */
export type RequestInit = {
  method?: string;
  timeout?: number;
  signal?: AbortSignal;
  headers?: HttpHeaders;
  maxRedirects?: number;
  redirect?: 'follow' | 'manual' | 'error';
  body?: XMLHttpRequestBodyInit | Dict<any> | Document | ReadableStream;
}

/**
 * Represents an HTTP request with configurable properties.
 */
export class Request {
  #body?: XMLHttpRequestBodyInit | Dict<any> | Document | ReadableStream;
  #redirect?: 'follow' | 'manual' | 'error';
  #maxRedirects?: number;
  #timeout?: number;

  readonly #ac: AbortController;
  readonly #headers: Headers;
  readonly #method: string;
  readonly #url: URL;

  /**
   * Constructs an instance of the Request class.
   * @param url - The URL of the HTTP request.
   * @param options - The initialization options for the request.
   */
  constructor(url: string | URL, options?: RequestInit) {
    if(!(url instanceof URL)) {
      if(!isString(url) || url.trim().length < 1) {
        throw new Exception('[ascom/http] Invalid request URL');
      }
    }

    this.#body = options?.body;
    this.#timeout = options?.timeout;
    this.#redirect = options?.redirect;
    this.#maxRedirects = options?.maxRedirects;

    this.#ac = new AbortController();
    this.#method = options?.method ?? 'GET';
    this.#headers = new Headers(options?.headers);
    this.#url = url instanceof URL ? url : new URL(url);

    if(options?.signal) {
      options.signal.addEventListener('abort', (reason: any) => {
        this.#ac.abort(isString(reason) ? reason : reason.reason || reason.message || 'Unknown abort reason');
      });
    }
  }

  /**
   * Gets the HTTP method of the request as an HttpMethod enum value.
   * @returns The HttpMethod enum value.
   */
  public get method(): HttpMethod {
    return _methodEnumToName(_methodNameToEnum(this.#method as unknown as HttpMethod));
  }

  /**
   * Gets the URL of the HTTP request.
   * @returns The URL object.
   */
  public get url(): URL {
    return this.#url;
  }

  /**
   * The headers of the HTTP request.
   * @returns The Headers object.
   */
  public get headers(): Headers {
    return this.#headers;
  }

  /**
   * Gets the timeout value for the request in milliseconds.
   * @returns The timeout value.
   */
  public get timeout(): number {
    return this.#timeout ?? 0;
  }

  /**
   * Sets the timeout value for the request in milliseconds.
   * @param value - The timeout value to set.
   * @throws {Exception} If the provided value is invalid.
   */
  public set timeout(value: number) {
    if(typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value) || value <= 0) {
      throw new Exception(`[ascom/http] Invalid request timeout: ${value}`);
    }

    this.#timeout = value;
  }

  /**
   * Gets the redirect mode for the request ('follow', 'manual', or 'error').
   * @returns The redirect mode.
   */
  public get redirect(): 'follow' | 'manual' | 'error' {
    return this.#redirect ?? 'follow';
  }

  /**
   * Sets the redirect mode for the request ('follow', 'manual', or 'error').
   * @param value - The redirect mode to set.
   * @throws {Exception} If the provided value is invalid.
   */
  public set redirect(value: 'follow' | 'manual' | 'error') {
    if(!['follow', 'manual', 'error'].includes(value)) {
      throw new Exception(`[ascom/http] Invalid redirect mode: ${value}`);
    }
    
    this.#redirect = value;
  }

  /**
   * Gets the maximum number of allowed redirects for the request.
   * @returns The maximum number of redirects.
   */
  public get maxRedirects(): number | undefined {
    return this.#maxRedirects;
  }

  /**
   * Sets the maximum number of allowed redirects for the request.
   * @param value - The maximum number of redirects to set.
   * @throws {Exception} If the provided value is invalid.
   */
  public set maxRedirects(value: number | undefined) {
    if(typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value) || value < 0) {
      throw new Exception(`[ascom/http] Invalid maximum redirects: ${value}`);
    }
    
    this.#maxRedirects = value;
  }

  /**
   * Gets the AbortSignal object associated with the request.
   * @returns {AbortSignal} The AbortSignal object.
   */
  public get signal(): AbortSignal {
    return this.#ac.signal;
  }

  /**
   * Sets the body of the HTTP request.
   * @param value - The body content to set.
   */
  public setBody(value: XMLHttpRequestBodyInit | Dict<any> | Document | ReadableStream | undefined) {
    this.#body = value;
  }

  /**
   * Removes the body content from the HTTP request.
   */
  public removeBody() {
    this.#body = undefined;
  }

  /**
   * Dispatches the HTTP request and returns a Promise that resolves to an `Response` object.
   * @returns A Promise that resolves to an `Response`.
   */
  public dispatch(): Promise<HTTPResponse> {
    return _dispatchRequest({
      url: this.#url,
      body: this.#body,
      timeout: this.#timeout,
      signal: this.#ac.signal,
      redirect: this.#redirect,
      maxRedirects: this.#maxRedirects,
      headers: this.#headers.toObject() as Dict<string>,
      method: _methodNameToEnum(this.#method as unknown as HttpMethod),
    });
  }

  /**
   * Break the HTTP request and immediately cancels any network activity.
   * @param reason - The reason for aborting the request.
   */
  public abort(reason?: string): void {
    this.#ac.abort(reason);
  }
}

export default Request;
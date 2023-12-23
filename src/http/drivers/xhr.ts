import { BadRequestError, HTTPError, RequestTimeoutError } from '../../errors/http';
import { CommonHttpHeaders, Dict, type HttpMethod } from '../../types';
import { RequestDriver, RequestOptions } from './_types';
import { validHttpMethods, is, now } from '../../utils';
import { assertString } from '../../utils/assertions';
import { Exception } from '../../errors/exception';
import { ssrSafeDocument } from '../../ssr';
import { __parseURL } from '../helpers/url';
import { isNode } from '../../constants';
import { Comparator } from '../../math';
import { Response } from '../response';
import { Deferred } from '../../async';
import { Headers } from '../headers';



enum ReadyState {
  UNSENT,
  READY,
  HEADERS_RECEIVED,
  LOADING,
  DONE,
  ABORTED,
}


const defaults = {
  redirect: 'follow',
} satisfies Partial<RequestOptions>;


type XHRRequestContext = Partial<RequestOptions> & {
  url?: string;
  method?: HttpMethod;
  abortReason?: string;
}


class XHRDriver implements RequestDriver {
  #readyState: ReadyState;
  readonly #headers: Headers;
  readonly #xhr: XMLHttpRequest;
  readonly #o: XHRRequestContext;
  #body?: XMLHttpRequestBodyInit | Document;

  constructor(options?: RequestOptions) {
    if(isNode || !ssrSafeDocument) {
      throw new Exception('XHRDriver is not available in Node.js environments.');
    }
    
    this.#headers = new Headers();
    this.#xhr = new XMLHttpRequest();
    this.#readyState = ReadyState.UNSENT;
    this.#o = Object.assign({}, defaults, options);
  }

  public get headers(): Headers {
    return this.#headers;
  }

  public get url(): string {
    return this.#o.url ?? '';
  }

  public timeout(value: number): void {
    if(!is.isNumber(value)) return;
    this.#xhr.timeout = value;
  }

  public open(method: HttpMethod | Lowercase<HttpMethod>, url: string | URL): void {
    assertString(method);

    if(this.#readyState !== ReadyState.UNSENT) {
      throw new Exception('Cannot open request twice.');
    }

    if(!(validHttpMethods.map(item => item.toLowerCase())).includes(method.toLowerCase())) {
      throw new Exception(`Invalid HTTP method: ${method}`, { method, url });
    }

    this.#o.method = method.toUpperCase() as HttpMethod;
    this.#o.url = __parseURL(url);

    this.#xhr.open(method.toUpperCase(), this.#o.url, true);
    this.#readyState = ReadyState.READY;
  }

  public setHeader<K extends keyof CommonHttpHeaders>(name: K | Omit<string, K>, value: string): void {
    this.#headers.set<K>(name, value);
  }

  public deleteHeader<K extends keyof CommonHttpHeaders>(name: K | Omit<string, K>): void {
    this.#headers.delete<K>(name);
  }

  public abort(reason?: string): void {
    this.#readyState = ReadyState.ABORTED;
    this.#xhr.abort();
    
    this.#o.abortReason = reason;
  }

  public body(value: XMLHttpRequestBodyInit | Dict<unknown> | Document): void {
    if(this.#readyState !== ReadyState.READY) {
      throw new Exception('Cannot set body after request is dispatched.');
    }

    if(typeof value === 'object' && is.isPlainObject(value)) {
      value = JSON.stringify(value);
      this.setHeader('Content-type', 'application/json');
    }

    if(value instanceof ReadableStream) {
      throw new BadRequestError('Streams can only be used in fetch driver');
    }

    this.#body = value as XMLHttpRequestBodyInit | Document;    
  }

  public dispatch(): Promise<Response> {
    if(this.#readyState !== ReadyState.READY) {
      throw new Exception('Cannot dispatch request twice.');
    }

    this.#readyState = ReadyState.LOADING;

    if(this.#o.timeout) {
      this.#xhr.timeout = this.#o.timeout;
    }

    const startTime = now();

    const hasUserAgent = (this.#headers.has('User-Agent') ||
      this.#headers.has('User-agent') ||
      this.#headers.has('user-agent'));

    if(!hasUserAgent && ssrSafeDocument?.location.origin.startsWith('https:')) {
      this.#headers.set('User-Agent', 'jspower-http/1.0');
    }

    for(const [name, value] of this.#headers.entries()) {
      this.#xhr.setRequestHeader(name, value);
    }

    const deferred = new Deferred<Response, HTTPError | Exception>();
    this.#xhr.responseType = 'arraybuffer';

    this.#xhr.ontimeout = () => {
      this.#readyState = ReadyState.DONE;
      deferred.reject(new RequestTimeoutError(`Request timeout for \`${this.url}\` in ${this.#o.timeout}ms`));
    };

    this.#xhr.onerror = () => {
      this.#readyState = ReadyState.DONE;
      deferred.reject(new HTTPError(`Request failed with status code ${this.#xhr.status}`, this.#xhr.status, { status: this.#xhr.status, statusText: this.#xhr.statusText, url: this.url }));
    };

    this.#xhr.onabort = () => {
      this.#readyState = ReadyState.ABORTED;
      deferred.reject(new HTTPError(this.#o.abortReason ?? 'Request was aborted.', 0));
    };

    this.#xhr.onloadend = () => {
      if(this.#xhr.readyState !== XMLHttpRequest.DONE) return deferred.reject(new Exception('Request was aborted.', { status: this.#xhr.status }));

      const c = new Comparator();
      if(c.isBetween(this.#xhr.status, 300, 308, true) && this.#o.redirect === 'error') return deferred.reject(new HTTPError(`Request failed with status code ${this.#xhr.status}`, this.#xhr.status, { status: this.#xhr.status, statusText: this.#xhr.statusText, url: this.url, reason: 'One or more redirects' }));

      const headers = _parseXHRHeaders(this.#xhr);
      const hasSetCookie = headers['Set-Cookie'] || headers['set-cookie'] || headers['Set-cookie'];

      if(
        !hasSetCookie &&
        (
          this.#xhr.getResponseHeader('Set-Cookie') ||
            this.#xhr.getResponseHeader('set-cookie') ||
            this.#xhr.getResponseHeader('Set-cookie')
        )
      ) {
        headers['Set-Cookie'] = (
          this.#xhr.getResponseHeader('Set-Cookie') ||
            this.#xhr.getResponseHeader('set-cookie') ||
            this.#xhr.getResponseHeader('Set-cookie')
        )!;
      }

      const responseObject = new Response(this.#xhr.response, {
        status: this.#xhr.status,
        responseTime: now() - startTime,
        headers,
      });

      this.#readyState = ReadyState.DONE;
      deferred.resolve(responseObject);
    };


    this.#xhr.send(this.#body);
    return deferred.promise;
  }
}


function _parseXHRHeaders(i: XMLHttpRequest) {
  const headers: Dict<string> = {};
  
  for(const header of i.getAllResponseHeaders().split('\r\n')) {
    const [name, value] = header.split(': ');
    headers[String(name)] = String(value);
  }
    
  return headers;
}


export default XHRDriver;
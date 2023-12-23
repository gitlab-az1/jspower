import { CommonHttpHeaders, Dict, type HttpMethod } from '../../types';
import { HTTPError, RequestTimeoutError } from '../../errors/http';
import { RequestDriver, RequestOptions } from './_types';
import { validHttpMethods, is, now } from '../../utils';
import { assertString } from '../../utils/assertions';
import { Exception } from '../../errors/exception';
import { version } from '../../utils/_appversion';
import { __parseURL } from '../helpers/url';
import { Response } from '../response';
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


type FetchRequestContext = Partial<RequestOptions> & {
  url?: string;
  method?: HttpMethod;
  abortReason?: string;
}


class FetchDriver implements RequestDriver {
  #body?: XMLHttpRequestBodyInit | ReadableStream;
  readonly #o: FetchRequestContext;
  readonly #ac: AbortController;
  readonly #headers: Headers;
  #readyState: ReadyState;

  constructor(options?: RequestOptions) {
    this.#o = Object.assign({}, defaults, options);
    this.#readyState = ReadyState.UNSENT;
    this.#ac = new AbortController();
    this.#headers = new Headers();

    this.#o.method = 'GET';
  }

  public get headers(): Headers {
    return this.#headers;
  }

  public get url(): string {
    return this.#o.url ?? '';
  }

  public open(method: HttpMethod, url: string | URL): void {
    assertString(method);

    if(this.#readyState !== ReadyState.UNSENT) {
      throw new Exception('Cannot open request twice.');
    }

    if(!(validHttpMethods.map(item => item.toLowerCase())).includes(method.toLowerCase())) {
      throw new Exception(`Invalid HTTP method: ${method}`, { method, url });
    }

    this.#o.method = method.toUpperCase() as HttpMethod;
    this.#o.url = __parseURL(url);

    this.#readyState = ReadyState.READY;
  }

  public body(value: XMLHttpRequestBodyInit | ReadableStream | Dict<unknown>): void {
    if(this.#readyState !== ReadyState.READY) {
      throw new Exception('Cannot set body before opening request.');
    }

    if(typeof value === 'object' && is.isPlainObject(value)) {
      value = JSON.stringify(value);
      this.setHeader('Content-type', 'application/json');
    }

    if(value instanceof Document) {
      throw new HTTPError('Document can only be used in xhr requests.', 400);
    }

    this.#body = value as XMLHttpRequestBodyInit | ReadableStream;
  }

  public setHeader<K extends keyof CommonHttpHeaders>(name: K | Omit<string, K>, value: string): void {
    this.#headers.set<K>(name, value);
  }

  public deleteHeader<K extends keyof CommonHttpHeaders>(name: K | Omit<string, K>): void {
    this.#headers.delete<K>(name);
  }

  public timeout(value: number): void {
    if(!is.isNumber(value)) return;
    this.#o.timeout = value;
  }

  public dispatch(): Promise<Response> {
    if(this.#readyState !== ReadyState.READY) {
      throw new Exception('Cannot dispatch request twice');
    }

    this.#readyState = ReadyState.LOADING;
    if(!this.#o.timeout || this.#o.timeout < 1) return this.#CreateFetchPromise();

    return Promise.race([
      this.#CreateFetchPromise(),
      new Promise((_, reject) => {
        setTimeout(() => {
          this.abort(`Request timeout for \`${this.url}\` in ${this.#o.timeout}ms`);
          this.#readyState = ReadyState.DONE;
          
          return reject(new RequestTimeoutError(`Request timeout for \`${this.url}\` in ${this.#o.timeout}ms`));
        }, this.#o.timeout);
      }),
    ]) as Promise<Response>;
  }

  async #CreateFetchPromise(): Promise<Response> {
    const startTime = now();

    const hasUserAgent = (
      this.#headers.get('User-Agent') ||
      this.#headers.get('user-agent') ||
      this.#headers.get('User-agent')
    );

    if(!hasUserAgent) {
      this.#headers.set('User-Agent', `jspower-http/${version}`);
    }

    const headers: Dict<string> = {};

    for(const [name, value] of this.#headers.entries()) {
      headers[name] = value;
    }
    
    return new Promise((resolve, reject) => {
      this.#ac.signal.addEventListener('abort', reject);

      fetch(this.#o.url!, {
        signal: this.#ac.signal,
        body: this.#body,
        method: this.#o.method,
        redirect: this.#o.redirect,
        headers,
      }).then(res => {
        res.arrayBuffer().then(buffer => {
          const headers: Dict<any> = {};
  
          res.headers.forEach((value, key) => {
            headers[key] = value;
          });
  
          const responseObject = new Response(buffer, {
            headers,
            status: res.status,
            responseTime: now() - startTime,
          });
  
          this.#readyState = ReadyState.DONE;
          resolve(responseObject);
        }).catch(err => {
          this.#readyState = ReadyState.DONE;
          reject(err);
        });
      }).catch(err => {
        this.#readyState = err.name === 'AbortError' ? ReadyState.ABORTED : ReadyState.DONE;
        reject(err);
      });
    });
  }

  public abort(reason?: string): void {
    this.#ac.abort(reason);
    
    this.#o.abortReason = reason;
    this.#readyState = ReadyState.ABORTED;
  }
}

export default FetchDriver;
import { HttpHeaders } from '../../types';
import { Headers } from '../../http/headers';
import { version } from '../../utils/_appversion';
import { Request, type RequestInit } from './request';
import { Response as HTTPResponse } from '../../http/response';
import { type Cookie, type SerializedCookie, CookiesJar } from './cookies-jar';



export type HTTPClientInit = {
  userAgent?: string;
  baseURL: string | URL;
  defaultHeaders?: HttpHeaders;
};

export class HTTPClient {
  readonly #defaultHeaders: Headers;
  readonly #baseurl: string | URL;
  readonly #cookies: CookiesJar;
  readonly #ua?: string;

  constructor(props: HTTPClientInit) {
    this.#defaultHeaders = new Headers(props.defaultHeaders);
    this.#cookies = new CookiesJar();
    this.#baseurl = props.baseURL;
    this.#ua = props.userAgent;
  }

  public getCookies(): SerializedCookie[] {
    return this.#cookies.toArray();
  }

  public get cookies(): CookiesJar {
    return this.#cookies.clone();
  }

  async #send(endpoint: string, method: string, options?: Omit<RequestInit, 'method'>): Promise<HTTPResponse> {
    const req = new Request(new URL(endpoint, this.#baseurl), {
      method,
      signal: options?.signal,
      timeout: options?.timeout,
      redirect: options?.redirect,
      maxRedirects: options?.maxRedirects,
    });
    
    const headers: HttpHeaders = {
      Origin: this.#baseurl.toString(),
      Host: this.#baseurl.toString(),
      ...options?.headers,
      ...this.#defaultHeaders.toObject(),
    };

    for(const name in headers) {
      req.headers.set(name, headers[name]!);
    }

    const ua = req.headers.get('User-Agent') || req.headers.get('User-agent') || req.headers.get('user-agent');

    req.headers.delete('User-Agent');
    req.headers.delete('User-agent');
    req.headers.delete('user-agent');

    req.headers.set('User-Agent', ua ?? this.#ua ?? this._getDefaultUserAgent());

    const res = await req.dispatch();
    
    if(res.headers.has('Set-Cookie') || res.headers.has('set-cookie') || res.headers.has('Set-cookie')) {      
      for(const cookie of CookiesJar.fromHeaders(res.headers).toArray()) {
        const obj: any = { ...cookie };
        delete obj.name;
        delete obj.value;

        this.#cookies.setCookie(cookie.name, cookie.value, obj as Omit<Cookie, 'name' | 'value'>);
      }
    }

    const cookies = this.#cookies.toArray();

    if(cookies.length > 0) {
      res.headers.set('Cookie', cookies.map(cookie => `${cookie.name.trim()}=${cookie.value.trim()}`).join('; '));
    }

    return res;
  }

  public get(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<HTTPResponse> {
    return this.#send(endpoint, 'GET', options);
  }

  public post(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<HTTPResponse> {
    return this.#send(endpoint, 'POST', options);
  }

  public put(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<HTTPResponse> {
    return this.#send(endpoint, 'PUT', options);
  }

  public patch(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<HTTPResponse> {
    return this.#send(endpoint, 'PATCH', options);
  }

  public delete(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<HTTPResponse> {
    return this.#send(endpoint, 'DELETE', options);
  }

  public head(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<HTTPResponse> {
    return this.#send(endpoint, 'HEAD', options);
  }

  public options(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<HTTPResponse> {
    return this.#send(endpoint, 'OPTIONS', options);
  }

  public trace(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<HTTPResponse> {
    return this.#send(endpoint, 'TRACE', options);
  }

  public connect(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<HTTPResponse> {
    return this.#send(endpoint, 'CONNECT', options);
  }
  
  private _getDefaultUserAgent(): string {
    const a =  `ascom/${version} (${process.platform} ${process.arch}) node/${process.version} v8/${process.versions.v8} uv/${process.versions.uv} zlib/${process.versions.zlib} brotli/${process.versions.brotli} ares/${process.versions.ares} modules/${process.versions.modules} nghttp2/${process.versions.nghttp2} napi/${process.versions.napi} openssl/${process.versions.openssl} icu/${process.versions.icu} unicode/${process.versions.unicode} cldr/${process.versions.cldr} tz/${process.versions.tz})`;
    // const b = `ascom/${version}`;
    // const c = `node/${process.version}`;
    
    return a;
  }
}

export default HTTPClient;
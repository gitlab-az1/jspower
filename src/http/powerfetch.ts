import { Response } from './response';
import type { Dict } from '../types';
import { Headers } from './headers';
import { now, is } from '../utils';


type RequestOptions = {
  /** A BodyInit object or null to set request's body. */
  body?: XMLHttpRequestBodyInit | Dict<unknown> | ReadableStream;
  /** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
  headers?: Dict<string> | Headers | globalThis.Headers;
  /** A string indicating how the request will interact with the browser's cache to set request's cache. */
  cache?: RequestCache;
  /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
  credentials?: RequestCredentials;
  /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
  integrity?: string;
  /** A boolean to set request's keepalive. */
  keepalive?: boolean;
  /** A string to set request's method. */
  method?: string;
  /** A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode. */
  mode?: RequestMode;
  /** A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
  redirect?: RequestRedirect;
  /** A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer. */
  referrer?: string;
  /** A referrer policy to set request's referrerPolicy. */
  referrerPolicy?: ReferrerPolicy;
  /** An AbortSignal to set request's signal. */
  signal?: AbortSignal | null;
  /** Can only be null. Used to disassociate request from any Window. */
  window?: null;
}


export function powerfetch(url: string | URL, options?: RequestOptions): Promise<Response> {
  const headers: Dict<any> = {};

  if(options?.headers) {
    for(const [name, value] of Headers.from(options.headers).entries()) {
      headers[name] = value;
    }
  }

  if(options && options.body && is.isObject(options.body) && is.isPlainObject(options.body)) {
    options.body = JSON.stringify(options.body);
  }

  return new Promise((resolve, reject) => {
    const startTime = now();

    fetch(url, Object.assign({}, (options as RequestInit | undefined) ?? {}, { headers })).then(res => {
      res.arrayBuffer().then(buffer => {
        const headers: Dict<string> = {};

        res.headers.forEach((value, name) => {
          headers[name] = value;
        });

        const response = new Response(buffer, {
          headers,
          responseTime: now() - startTime,
          status: res.status,
        });

        resolve(response);
      }).catch(reject);
    }).catch(reject);
  });
}



type ClientOptions = {
  defaultHeaders?: Dict<string> | Headers | globalThis.Headers;
  credentials?: RequestCredentials;
}

interface Client {
  get(endpoint: string, options?: RequestOptions): Promise<Response>;
  post(endpoint: string, options?: RequestOptions): Promise<Response>;
  put(endpoint: string, options?: RequestOptions): Promise<Response>;
  patch(endpoint: string, options?: RequestOptions): Promise<Response>;
  trace(endpoint: string, options?: RequestOptions): Promise<Response>;
  delete(endpoint: string, options?: RequestOptions): Promise<Response>;
  options(endpoint: string, options?: RequestOptions): Promise<Response>;
  connect(endpoint: string, options?: RequestOptions): Promise<Response>;
  head(endpoint: string, options?: RequestOptions): Promise<Response>;
}


export function create(baseurl: string | URL, clientOptions?: ClientOptions): Client {
  const dh = clientOptions?.defaultHeaders ? Headers.from(clientOptions.defaultHeaders) : new Headers();

  function get(endpoint: string, options?: RequestOptions): Promise<Response> {
    let p = new Headers();
    if(options?.headers) {
      p = Headers.from(options.headers);
    }

    const h = p.concat(dh);
    const headers: Dict<string> = {};
    
    for(const [name, value] of h.entries()) {
      headers[name] = value;
    }

    options ??= {};
    options.method = 'GET';

    if(typeof clientOptions?.credentials !== 'undefined') {
      options.credentials ??= clientOptions.credentials;
    }

    if(Object.keys(headers).length > 0) {
      options.headers = headers;
    }

    return powerfetch(new URL(endpoint, baseurl), options);
  }

  function post(endpoint: string, options?: RequestOptions): Promise<Response> {
    let p = new Headers();
    if(options?.headers) {
      p = Headers.from(options.headers);
    }
    
    const h = p.concat(dh);
    const headers: Dict<string> = {};
        
    for(const [name, value] of h.entries()) {
      headers[name] = value;
    }
    
    options ??= {};
    options.method = 'POST';

    if(typeof clientOptions?.credentials !== 'undefined') {
      options.credentials ??= clientOptions.credentials;
    }
    
    if(Object.keys(headers).length > 0) {
      options.headers = headers;
    }
    
    return powerfetch(new URL(endpoint, baseurl), options);
  }

  function put(endpoint: string, options?: RequestOptions): Promise<Response> {
    let p = new Headers();
    if(options?.headers) {
      p = Headers.from(options.headers);
    }
        
    const h = p.concat(dh);
    const headers: Dict<string> = {};
            
    for(const [name, value] of h.entries()) {
      headers[name] = value;
    }
        
    options ??= {};
    options.method = 'PUT';

    if(typeof clientOptions?.credentials !== 'undefined') {
      options.credentials ??= clientOptions.credentials;
    }
        
    if(Object.keys(headers).length > 0) {
      options.headers = headers;
    }
        
    return powerfetch(new URL(endpoint, baseurl), options);
  }

  function patch(endpoint: string, options?: RequestOptions): Promise<Response> {
    let p = new Headers();
    if(options?.headers) {
      p = Headers.from(options.headers);
    }
                
    const h = p.concat(dh);
    const headers: Dict<string> = {};
                    
    for(const [name, value] of h.entries()) {
      headers[name] = value;
    }
                    
    options ??= {};
    options.method = 'PATCH';

    if(typeof clientOptions?.credentials !== 'undefined') {
      options.credentials ??= clientOptions.credentials;
    }
                    
    if(Object.keys(headers).length > 0) {
      options.headers = headers;
    }
                    
    return powerfetch(new URL(endpoint, baseurl), options);
  }

  function trace(endpoint: string, options?: RequestOptions): Promise<Response> {
    let p = new Headers();
    if(options?.headers) {
      p = Headers.from(options.headers);
    }
                            
    const h = p.concat(dh);
    const headers: Dict<string> = {};
                                
    for(const [name, value] of h.entries()) {
      headers[name] = value;
    }
                                
    options ??= {};
    options.method = 'TRACE';

    if(typeof clientOptions?.credentials !== 'undefined') {
      options.credentials ??= clientOptions.credentials;
    }
                                
    if(Object.keys(headers).length > 0) {
      options.headers = headers;
    }
                                
    return powerfetch(new URL(endpoint, baseurl), options);
  }

  function delete_(endpoint: string, options?: RequestOptions): Promise<Response> {
    let p = new Headers();
    if(options?.headers) {
      p = Headers.from(options.headers);
    }
                                        
    const h = p.concat(dh);
    const headers: Dict<string> = {};
                                            
    for(const [name, value] of h.entries()) {
      headers[name] = value;
    }
                                            
    options ??= {};
    options.method = 'DELETE';

    if(typeof clientOptions?.credentials !== 'undefined') {
      options.credentials ??= clientOptions.credentials;
    }
                                            
    if(Object.keys(headers).length > 0) {
      options.headers = headers;
    }
                                            
    return powerfetch(new URL(endpoint, baseurl), options);
  }

  function options_(endpoint: string, options?: RequestOptions): Promise<Response> {
    let p = new Headers();
    if(options?.headers) {
      p = Headers.from(options.headers);
    }
                                                    
    const h = p.concat(dh);
    const headers: Dict<string> = {};
                                                        
    for(const [name, value] of h.entries()) {
      headers[name] = value;
    }
                                                        
    options ??= {};
    options.method = 'OPTIONS';

    if(typeof clientOptions?.credentials !== 'undefined') {
      options.credentials ??= clientOptions.credentials;
    }
                                                        
    if(Object.keys(headers).length > 0) {
      options.headers = headers;
    }
                                                        
    return powerfetch(new URL(endpoint, baseurl), options);
  }

  function connect(endpoint: string, options?: RequestOptions): Promise<Response> {
    let p = new Headers();
    if(options?.headers) {
      p = Headers.from(options.headers);
    }
                                                                
    const h = p.concat(dh);
    const headers: Dict<string> = {};
                                                                    
    for(const [name, value] of h.entries()) {
      headers[name] = value;
    }
                                                                    
    options ??= {};
    options.method = 'CONNECT';

    if(typeof clientOptions?.credentials !== 'undefined') {
      options.credentials ??= clientOptions.credentials;
    }
                                                                    
    if(Object.keys(headers).length > 0) {
      options.headers = headers;
    }
                                                                    
    return powerfetch(new URL(endpoint, baseurl), options);
  }

  function head(endpoint: string, options?: RequestOptions): Promise<Response> {
    let p = new Headers();
    if(options?.headers) {
      p = Headers.from(options.headers);
    }
                                                                                
    const h = p.concat(dh);
    const headers: Dict<string> = {};
                                                                                    
    for(const [name, value] of h.entries()) {
      headers[name] = value;
    }
                                                                                    
    options ??= {};
    options.method = 'HEAD';

    if(typeof clientOptions?.credentials !== 'undefined') {
      options.credentials ??= clientOptions.credentials;
    }
                                                                                    
    if(Object.keys(headers).length > 0) {
      options.headers = headers;
    }
                                                                                    
    return powerfetch(new URL(endpoint, baseurl), options);
  }

  return Object.freeze({
    get,
    post,
    put,
    patch,
    trace,
    delete: delete_,
    options: options_,
    connect,
    head,
  });
}


const __powerfetch = Object.freeze({
  request: powerfetch,
  create,
});

export default __powerfetch;
import { getPreciseTime } from '../utils';
import { Response } from './response';
import type { Dict } from '../types';
import { Headers } from './headers';


export function powerfetch(url: string | URL, options?: RequestInit): Promise<Response> {
  return new Promise((resolve, reject) => {
    const startTime = getPreciseTime();

    fetch(url, options).then(res => {
      res.arrayBuffer().then(buffer => {
        const headers: Dict<string> = {};

        res.headers.forEach((value, name) => {
          headers[name] = value;
        });

        const response = new Response(buffer, {
          headers,
          responseTime: getPreciseTime() - startTime,
          status: res.status,
        });

        resolve(response);
      }).catch(reject);
    }).catch(reject);
  });
}



type ClientOptions = {
  defaultHeaders?: Dict<string> | Headers | globalThis.Headers;
}

type RequestOptions = RequestInit & {
  body?: XMLHttpRequestBodyInit | Dict<unknown> | ReadableStream;
  headers?: Dict<string> | Headers | globalThis.Headers;
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


export function create(baseurl: string | URL, options?: ClientOptions): Client {
  const dh = options?.defaultHeaders ? Headers.from(options.defaultHeaders) : new Headers();

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


export default Object.freeze({
  request: powerfetch,
  create,
});
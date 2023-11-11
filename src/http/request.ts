import { CommonHttpHeaders, type Dict, type HttpMethod } from '../types';
import { InterceptorsManager } from './interceptors';
import driver, { RequestDriver } from './drivers';
import { validHttpMethods } from '../utils';
import { Response } from './response';
import { Headers } from './headers';
import { delay } from '../async';



export class Request {
  readonly #_Driver: RequestDriver;
  readonly #props: {
    method: HttpMethod;
    url: string | URL;
    delay?: number;
  };

  public readonly interceptors: {
    readonly request: InterceptorsManager<Request>;
    readonly response: InterceptorsManager<Response>;
  };

  constructor(url: string | URL, options?: RequestInit) {
    this.interceptors = Object.freeze({
      request: new InterceptorsManager<Request>(),
      response: new InterceptorsManager<Response>(),
    });

    this.#props = {
      method: (options?.method ?? 'GET') as HttpMethod,
      delay: 0,
      url,
    };    
    
    this.#_Driver = new driver();
  }

  public get headers(): Headers {
    return this.#_Driver.headers;
  }

  public get url(): string | URL {
    return this.#props.url;
  }

  public set url(url: string | URL) {
    if(typeof url !== 'string' && !(url instanceof URL)) return;
    this.#props.url = url;
  }

  public get delay(): number | undefined {
    return this.#props.delay;
  }

  public get method(): HttpMethod {
    return this.#props.method;
  }

  public set method(method: HttpMethod) {
    if(!(validHttpMethods.map(item => item.toLowerCase())).includes(method.toLowerCase())) return;
    this.#props.method = method;
  }

  public set delay(amount: number) {
    if(typeof amount !== 'number') return;
    if(amount < 1) return;

    this.#props.delay = amount;
  }

  public setHeader<K extends keyof CommonHttpHeaders>(name: K | Omit<string, K>, value: string): void {
    this.#_Driver.setHeader<K>(name, value);
  }

  public deleteHeader<K extends keyof CommonHttpHeaders>(name: K | Omit<string, K>): void {
    this.#_Driver.deleteHeader<K>(name);
  }

  public setBody(body: XMLHttpRequestBodyInit | Dict<unknown> | Document | ReadableStream): void {
    this.#_Driver.body(body);
  }

  async #DoSendRequest(): Promise<Response> {
    try {
      for(const requestHandler of this.interceptors.request.handlers) {
        if(requestHandler && requestHandler.fulfilled) {
          await requestHandler.fulfilled(this);
        }
      }

      if(this.#props.delay && this.#props.delay > 0) {
        await delay(this.#props.delay);
      }
  
      this.#_Driver.open(this.#props.method, this.#props.url);
      const res = await this.#_Driver.dispatch();

      if(this.#props.delay && this.#props.delay > 0) {
        await delay(this.#props.delay);
      }

      let response = res;

      for(const responseHandler of this.interceptors.response.handlers) {
        if(responseHandler && responseHandler.fulfilled) {
          response = await responseHandler.fulfilled(response);
        }
      }
  
      return response;
    } catch (err: any) {
      let error = err;

      for(const responseHandler of this.interceptors.response.handlers) {
        if(responseHandler && responseHandler.rejected) {
          error = await responseHandler.rejected(error);
        }
      }

      throw error;
    }
  }

  public send(): Promise<Response> {
    return this.#DoSendRequest();
  }
}

export default Request;
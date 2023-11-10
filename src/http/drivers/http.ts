import { CommonHttpHeaders, type Dict } from '../../types';
import { RequestDriver, RequestOptions } from './_types';
import { Response } from '../response';
import { Headers } from '../headers';


class HttpDriver extends AbortController implements RequestDriver {
  readonly #headers: Headers;

  constructor(options?: RequestOptions) {
    super();
    options;
    this.#headers = new Headers();
  }

  public get headers(): Headers {
    return this.#headers;
  }

  public get url(): string {
    return '';
  }

  public open(method: string, url: string | URL): void {
    method;url;
  }

  public setHeader<K extends keyof CommonHttpHeaders>(name: string, value: string): void {
    this.#headers.set<K>(name, value);
  }

  public deleteHeader<K extends keyof CommonHttpHeaders>(name: string): void {
    this.#headers.delete<K>(name);
  }

  public body(value: XMLHttpRequestBodyInit | Dict<unknown> | Document | ReadableStream<any>): void {
    value;    
  }

  public dispatch(): Promise<Response> {
    return new Promise(() => void 0);    
  }

  public timeout(value: number): void {
    value;    
  }
}

export default HttpDriver;
import { CommonHttpHeaders, type Dict, type HttpMethod } from '../../types';
import { Response } from '../response';
import { Headers } from '../headers';


export interface RequestDriver {
  setHeader<K extends keyof CommonHttpHeaders>(name: K | Omit<string, K>, value: string): void;
  body(value: XMLHttpRequestBodyInit | Dict<unknown> | Document | ReadableStream): void;
  deleteHeader<K extends keyof CommonHttpHeaders>(name: K | Omit<string, K>): void;
  open(method: HttpMethod, url: string | URL): void;
  dispatch(): Promise<Response>;
  timeout(value: number): void;
  abort(reason?: string): void;

  readonly headers: Headers;
  readonly url: string;
}


export interface RequestOptions {
  timeout?: number;
  redirect?: 'follow' | 'manual' | 'error';
}
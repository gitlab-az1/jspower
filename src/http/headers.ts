import { CommonHttpHeaders, type Dict, HttpHeaders } from '../types';
import { isArray, isPlainObject, typeofTest } from '../utils/is';
import { assertString } from '../utils/assertions';


/**
 * Check if the given string is a valid header name
 * @param {string} str The header name to test
 * @returns {boolean} True if `str` is a valid header name, otherwise false
 * 
 * @copyright axios
 * @license MIT
 * @see https://axios-http.com/
 * @see https://github.com/axios/axios/blob/v1.x/lib/core/AxiosHeaders.js
 */
export const isValidHeaderName = (str: string): boolean => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());


/**
 * 
 * @param header 
 * @returns 
 * 
 * @copyright axios
 * @license MIT
 * @see https://axios-http.com/
 * @see https://github.com/axios/axios/blob/v1.x/lib/core/AxiosHeaders.js
 */
export function normalizeHeader(header: any): string | undefined {
  if(!header) return;
  return String(header).trim().toLowerCase();
}


/**
 * 
 * @param header 
 * @returns 
 * 
 * @copyright axios
 * @license MIT
 * @see https://axios-http.com/
 * @see https://github.com/axios/axios/blob/v1.x/lib/core/AxiosHeaders.js
 */
export function formatHeader(header: string): string {
  return header.trim()
    .toLowerCase().replace(/([a-z\d])(\w*)/g, (_, char, str) => {
      return char.toUpperCase() + str;
    });
}


export class Headers {
  [key: string]: any;

  public readonly accept?: string | undefined;
  public readonly 'accept-language'?: string | undefined;
  public readonly 'accept-patch'?: string | undefined;
  public readonly 'accept-ranges'?: string | undefined;
  public readonly 'access-control-allow-credentials'?: string | undefined;
  public readonly 'access-control-allow-headers'?: string | undefined;
  public readonly 'access-control-allow-methods'?: string | undefined;
  public readonly 'access-control-allow-origin'?: string | undefined;
  public readonly 'access-control-expose-headers'?: string | undefined;
  public readonly 'access-control-max-age'?: string | undefined;
  public readonly 'access-control-request-headers'?: string | undefined;
  public readonly 'access-control-request-method'?: string | undefined;
  public readonly age?: string | undefined;
  public readonly allow?: string | undefined;
  public readonly 'alt-svc'?: string | undefined;
  public readonly authorization?: string | undefined;
  public readonly 'cache-control'?: string | undefined;
  public readonly connection?: string | undefined;
  public readonly 'content-disposition'?: string | undefined;
  public readonly 'content-encoding'?: string | undefined;
  public readonly 'content-language'?: string | undefined;
  public readonly 'content-length'?: string | undefined;
  public readonly 'content-location'?: string | undefined;
  public readonly 'content-range'?: string | undefined;
  public readonly 'content-type'?: string | undefined;
  public readonly cookie?: string | undefined;
  public readonly date?: string | undefined;
  public readonly etag?: string | undefined;
  public readonly expect?: string | undefined;
  public readonly expires?: string | undefined;
  public readonly forwarded?: string | undefined;
  public readonly from?: string | undefined;
  public readonly host?: string | undefined;
  public readonly 'if-match'?: string | undefined;
  public readonly 'if-modified-since'?: string | undefined;
  public readonly 'if-none-match'?: string | undefined;
  public readonly 'if-unmodified-since'?: string | undefined;
  public readonly 'last-modified'?: string | undefined;
  public readonly location?: string | undefined;
  public readonly origin?: string | undefined;
  public readonly pragma?: string | undefined;
  public readonly 'proxy-authenticate'?: string | undefined;
  public readonly 'proxy-authorization'?: string | undefined;
  public readonly 'public-key-pins'?: string | undefined;
  public readonly range?: string | undefined;
  public readonly referer?: string | undefined;
  public readonly 'retry-after'?: string | undefined;
  public readonly 'sec-websocket-accept'?: string | undefined;
  public readonly 'sec-websocket-extensions'?: string | undefined;
  public readonly 'sec-websocket-key'?: string | undefined;
  public readonly 'sec-websocket-protocol'?: string | undefined;
  public readonly 'sec-websocket-version'?: string | undefined;
  public readonly 'set-cookie'?: string | undefined;
  public readonly 'strict-transport-security'?: string | undefined;
  public readonly tk?: string | undefined;
  public readonly trailer?: string | undefined;
  public readonly 'transfer-encoding'?: string | undefined;
  public readonly upgrade?: string | undefined;
  public readonly 'user-agent'?: string | undefined;
  public readonly vary?: string | undefined;
  public readonly via?: string | undefined;
  public readonly warning?: string | undefined;
  public readonly 'www-authenticate'?: string | undefined;

  #headers: HttpHeaders;

  public static from(thing: Headers | globalThis.Headers | IterableIterator<[string, string]> | [string, string][] | Dict<string>): Headers {
    if(thing instanceof Headers) return thing;
    const headers = new Headers();

    if(thing instanceof globalThis.Headers) {
      for(const [name, value] of thing.entries()) {
        headers.set(name, value);
      }
    } else if(Array.isArray(thing)) {
      for(const [name, value] of thing) {
        headers.set(name, value);
      }
    } else if(typeofTest('object')(thing) && isPlainObject(thing)) {
      for(const name in thing) {
        headers.set(name, (thing as Dict<string>)[name]);
      }
    } 

    return headers;
  }

  constructor(initialValues?: HttpHeaders) {
    this.#headers = {};

    if(initialValues && isPlainObject(initialValues)) {
      for(const key in initialValues) {
        this.set(key, initialValues[key]!);
      }
    }
  }

  /**
   * Set a header in the headers map
   * 
   * @param {string} name The name of the header to set
   * @param {string} value The value of the header to set
   * @param {boolean} override Whether to override an existing header with the same name
   */
  public set<K extends keyof CommonHttpHeaders>(name: K | Omit<string, K>, value: string, override: boolean = true): void {
    assertString(name);
    assertString(value);

    if(!isValidHeaderName(name)) {
      throw new TypeError(`Invalid header name: ${name}`);
    }

    if(name.trim().length < 1 || value.trim().length < 1) return;
    if(typeof this.#headers[name] !== 'undefined' && override !== true) return;
    
    this.#headers[name] = value;
  }

  /**
   * Get the value of a header
   * 
   * @param {string} name The name of the header to get
   * @returns {string|null} The serializable value of the header, or null if the header does not exist
   */
  public get<K extends keyof CommonHttpHeaders>(name: K | Omit<string, K>): string | null {
    assertString(name);

    if(!isValidHeaderName(name)) {
      throw new TypeError(`Invalid header name: ${name}`);
    }

    return this.#headers[name] ?? null;
  }

  /**
   * Delete a header from the headers map
   * 
   * @param {string} name The name of the header to delete
   */
  public delete<K extends keyof CommonHttpHeaders>(name: K | Omit<string, K>): void {
    assertString(name);

    if(!isValidHeaderName(name)) {
      throw new TypeError(`Invalid header name: ${name}`);
    }

    delete this.#headers[name];
  }

  /**
   * Check if a header exists in the headers map
   * 
   * @param {string} name The name of the header to check 
   * @returns {boolean} True if the header exists, otherwise false
   */
  public has<K extends keyof CommonHttpHeaders>(name: K | Omit<string, K>): boolean {
    assertString(name);
    if(!isValidHeaderName(name)) return false;

    return (typeof this.#headers[name] !== 'undefined' &&
      typeofTest('string')(this.#headers[name])
    );
  }

  /**
   * Clear all headers from the headers map
   */
  public clear(): void {
    this.#headers = {};
  }

  /**
   * Returns an array of key/values of the enumerable properties of an object
   * @returns {[string, string][]} An array of header name and value pairs
   */
  public entries(): [name: string, value: string][] {
    return Object.entries(this.#headers) as [name: string, value: string][];
  }

  /**
   * Returns an array of the header names
   * 
   * @returns {string[]} The header names
   */
  public keys(): string[] {
    return Object.keys(this.#headers);
  }

  /**
   * Returns an array of the header values
   * 
   * @returns {string[]} The header values 
   */
  public values(): string[] {
    const result: string[] = [];

    for(const value of Object.values(this.#headers)) {
      if(!value) continue;
      result.push(value);
    }

    return result;
  }

  /**
   * Enumerate the headers returning an array of [index, name, value] tuples
   * 
   * @returns {[number, string, string][]} [index, name, value] 
   */
  public enum(): [index: number, name: string, value: string][] {
    const result: [number, string, string][] = [];
    let index = 0;

    for(const [name, value] of this.entries()) {
      result.push([index++, name, value]);
    }

    return result;
  }

  /**
   * Enumerate the headers returning an iterable of [index, name, value] tuples
   * 
   * @returns {IterableIterator<[number, string, string]>} [index, name, value] 
   */
  public enumerateIterable(): IterableIterator<[index: number, name: string, value: string]> {
    let index = 0;

    return (function* (headers: Headers) {
      for(const [name, value] of headers.entries()) {
        yield [index++, name, value];
      }
    })(this);
  }

  /**
   * Performs the specified action for each header
   * 
   * @param {Function} callback Function to execute for each element, taking three arguments:
   * - `name`: The name of the header
   * - `value`: The value of the header
   * - `index`: The index of the header in the headers map
   * - `entries`: The entries of the headers map
   * 
   * @returns {Promise<void>} A Promise that resolves when all headers have been processed
   */
  public async forEach(callback: (<K extends keyof CommonHttpHeaders>(name: K | Omit<string, K>, value: string, index: number, entries: Array<[string, string]>) => void | Promise<void>)): Promise<void> {
    const entries = [ ...this.entries() ];
    
    for(let i = 0; i < entries.length; i++) {
      await callback(entries[i][0], entries[i][1], i, entries);
    }
  }

  /**
   * Concatenate the headers with the given headers
   * 
   * @param {Headers[]} targets The headers to concatenate 
   * @returns {Header} The concatenated headers
   */
  public concat(...targets: Headers[]): Headers {
    const result = new Headers(this.#headers);

    for(const target of targets) {
      if(!(target instanceof Headers)) continue;

      for(const [name, value] of target.entries()) {
        result.set(name, value);
      }
    }

    return result;
  }

  /**
   * Convert the headers to an object
   * 
   * @returns {HttpHeaders} 
   */
  public toObject(): HttpHeaders {
    const obj = Object.create(null);

    this.forEach((value, header) => {
      if(!value) return;
      obj[header] = isArray(value) ? value.join(', ') : value;
    });

    return obj;
  }

  /**
   * Convert the headers to a JSON string
   * 
   * @returns {string} 
   */
  public toJSON(): string {
    return JSON.stringify(this.toObject());
  }

  /**
   * Convert the headers to a string
   * 
   * @returns {string}
   */
  public toString(): string {
    return this.entries().map(([name, value]) => `${name}: ${value}`).join('\n');
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    return Object.entries(this.toObject() as unknown as Dict<string>)[Symbol.iterator]();
  }

  get [Symbol.toStringTag](): string {
    return 'Headers';
  }
}

export default Headers;
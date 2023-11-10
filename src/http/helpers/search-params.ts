import { assertString } from '../../utils/assertions';
import type { Dict } from '../../types';


/**
 * It encodes a string by replacing all characters that are not in the unreserved set with
 * their percent-encoded equivalents
 * 
 * @see https://github.com/axios/axios/blob/v1.x/lib/helpers/AxiosURLSearchParams.js
 *
 * @param {string} str - The string to encode.
 *
 * @returns {string} The encoded string.
 */
function encode(str: string): string {
  const charMap: Dict<string> = {
    '!': '%21',
    '\'': '%27',
    '(': '%28',
    ')': '%29',
    '~': '%7E',
    '%20': '+',
    '%00': '\x00',
  };

  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, match => {
    return charMap[match];
  });
}



type StringEncoder = ((value: string, encoder: ((value: string) => string)) => string);


export class SearchParams {
  #pairs: [string, string][] = [];

  public get size(): number {
    return this.#pairs.length;
  }

  public append(key: string, value: string): void {
    assertString(key);
    assertString(value);

    this.#pairs.push([key, value]);
  }

  public delete(key: string): void {
    assertString(key);
    this.#pairs = this.#pairs.filter(pair => pair[0] !== key);
  }

  public toString(encoder?: StringEncoder): string {
    const _encode = encoder ? function(value: string) {
      return encoder.call(undefined, value, encode);
    } : encode;
  
    return this.#pairs.map(pair => {
      return _encode(pair[0]) + '=' + _encode(pair[1]);
    }, '').join('&');
  }
}
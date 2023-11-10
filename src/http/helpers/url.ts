'use strict';

import { assertString } from '../../utils/assertions';
import { SearchParams } from './search-params';


/**
 * Creates a new URL by combining the specified URLs
 * 
 * @license MIT
 * @copyright axios
 * @see https://github.com/axios/axios/blob/v1.x/lib/helpers/combineURLs.js
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 *
 * @returns {string} The combined URL
 */
export function combineURLs(baseURL: string, relativeURL?: string | undefined): string {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
}


/**
 * Determines whether the specified URL is absolute
 * 
 * @license MIT
 * @copyright axios
 * @see https://github.com/axios/axios/blob/v1.x/lib/helpers/combineURLs.js
 *
 * @param {string} url The URL to test
 *
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
export function isAbsoluteURL(url: string): boolean {
  assertString(url);


  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}


/**
 * Extract the protocol from a url
 * 
 * @license MIT
 * @copyright axios
 * @see https://github.com/axios/axios/blob/v1.x/lib/helpers/combineURLs.js
 * 
 * @param {string} url The URL 
 * @returns {string} The protocol of the specified URL
 */
export function parseProtocol(url: string): string {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || '';
}


export function __parseURL(url: URL | string): string {
  if(typeof url === 'string') {
    url = new URL(url);
  }

  const searchParams = new SearchParams();

  if(url.search && url.search.trim().length > 0) {
    for(const item of (url.search.charAt(0) === '?' ? url.search.substring(1) : url.search).split('&')) {
      const [key, value] = item.split('=').map(x => x.trim());
      searchParams.append(key, value);
    }
  }

  let urlStr = '';
  
  if(url.username) {
    urlStr += url.username;

    if(url.password) {
      urlStr += `:${url.password}`;
    }
    
    urlStr += '@';
  }

  urlStr += (url.origin + url.pathname);

  if(searchParams.size > 0) {
    urlStr += `?${searchParams.toString()}`;
  }

  return urlStr + url.hash;
}
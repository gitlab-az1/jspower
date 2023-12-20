'use strict';

import { ssrSafeDocument } from './ssr';
import { Exception } from './errors';
import { is } from './utils';
import math from './math';



export type CookieOptions = {
  expires?: string | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None' | boolean;
  maxAge?: number;
  httpOnly?: boolean;
  priority?: 'High' | 'Low' | 'Medium';
  partitioned?: boolean;
}

export interface Cookies {
  setCookie(name: string, value: string, options?: CookieOptions): void;
  readCookie(name: string): string | null;
  deleteCookie(name: string, options?: CookieOptions): void;
}


class Noop implements Cookies {
  setCookie(name: string, value: string, options?: CookieOptions | undefined): void {
    name;value;options;
    return;
  }

  readCookie(name: string): string | null {
    name;
    return null;
  }

  deleteCookie(name: string): void {
    name;
    return;
  }
}



export default (function(): Cookies {
  if(!ssrSafeDocument) return new Noop();

  function _set(name: string, value: string, options: CookieOptions = {}): void {
    const parts = [ `${name}=${encodeURIComponent(value)}` ];

    if(options.maxAge) {
      const age = options.maxAge - 0;

      if(Number.isNaN(age) || !Number.isFinite(age)) {
        throw new Exception('Cookie maxAge must be a finite number');
      }

      parts.push(`; Max-Age=${math.floor(age)}`);
    }

    if(options.domain) {
      parts.push(`; Domain=${options.domain}`);
    }

    if(options.path) {
      parts.push(`; Path=${options.path}`);
    }

    if(options.expires) {
      const d = options.expires instanceof Date ? options.expires : __parseExpiresFromString(options.expires);
      parts.push(`; Expires=${d.toUTCString()}`);
    }

    if(options.httpOnly) {
      parts.push('; HttpOnly');
    }

    if(options.secure) {
      parts.push('; Secure');
    }

    if(options.partitioned) {
      parts.push('; Partitioned=true');
    }

    if(options.priority) {
      let priority = '';

      switch(String(options.priority).toLowerCase()) {
        case 'low':
          priority = 'Low';
          break;
        case 'medium':
          priority = 'Medium';
          break;
        case 'high':
          priority = 'High';
          break;
        default: 
          throw new Exception('Cookie priority must be one of: Low, Medium, High');
      }

      parts.push(`; Priority=${priority}`);
    }

    if(options.sameSite) {
      let mode = '';

      if(is.isBoolean(options.sameSite) && options.sameSite === true) {
        mode = 'Strict';
      } else {
        switch(String(options.sameSite).toLowerCase()) {
          case 'lax':
            mode = 'Lax';
            break;
          case 'none':
            mode = 'None';
            break;
          case 'strict':
            mode = 'Strict';
            break;
          default:
            throw new Exception('Cookie sameSite must be one of: Strict, Lax, None');
        }
      }

      parts.push(`; SameSite=${mode}`);
    }

    document.cookie = parts.join('');
  }

  function _read(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return (match ? decodeURIComponent(match[3]) : null);
  }

  function _delete(name: string, options?: CookieOptions): void {
    const parts = [`${name}=;expires=-1`];

    if(options?.path) {
      parts.push(`; Path=${options.path}`);
    }

    if(options?.domain) {
      parts.push(`; Domain=${options.domain}`);
    }

    document.cookie = parts.join('');
  }

  function __parseExpiresFromString(expires: string): Date {
    const date = new Date();

    if (expires.endsWith('d')) {
      date.setTime(date.getTime() + parseInt(expires) * 24 * 60 * 60 * 1000);
    } else if (expires.endsWith('h')) {
      date.setTime(date.getTime() + parseInt(expires) * 60 * 60 * 1000);
    } else if (expires.endsWith('m')) {
      date.setTime(date.getTime() + parseInt(expires) * 60 * 1000);
    }

    return date;
  }


  return Object.freeze({
    get setCookie() {
      return _set;
    },

    get readCookie() {
      return _read;
    },

    get deleteCookie() {
      return _delete;
    },
  });
});
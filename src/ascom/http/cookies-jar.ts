import List, { ReadonlyStorageBlock } from '../../list';


/**
 * Represents a cookie with various optional attributes.
 */
export type Cookie = {
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None' | boolean;
  maxAge?: number;
  httpOnly?: boolean;
  priority?: 'High' | 'Low' | 'Medium';
  partitioned?: boolean;
  name: string;
  value: string;
};


/**
 * Represents a serialized version of a cookie with read-only attributes.
 */
export type SerializedCookie = {
  readonly name: string;
  readonly value: string;
  readonly expires: string | null;
  readonly maxAge: number | null;
  readonly domain: string | null;
  readonly path: string | null;
  readonly secure: boolean | null;
  readonly httpOnly: boolean | null;
  readonly sameSite: 'Strict' | 'Lax' | 'None' | boolean | null;
  readonly priority: 'High' | 'Low' | 'Medium' | null;
  readonly partitioned: boolean | null;
};


/**
 * Manages a collection of cookies, providing methods for adding, retrieving, and deleting cookies.
 */
export class CookiesJar {
  #cookies: Cookie[] = [];

  /**
   * Adds or updates a cookie with the specified name and value.
   * @param name - The name of the cookie.
   * @param value - The value of the cookie.
   * @param options - Additional options for the cookie.
   */
  public setCookie(name: string, value: string, options?: Omit<Cookie, 'name' | 'value'>): void {
    const index = this.#cookies.findIndex(item => item.name === name);

    if(index > -1) {
      this.#cookies[index] = {
        ...this.#cookies[index],
        ...options,
        name,
        value,
      };
    } else {
      this.#cookies.push({
        ...options,
        name,
        value,
      });
    }
  }

  /**
   * Retrieves a cookie by its name.
   * @param name - The name of the cookie to retrieve.
   * @returns The cookie if found, or null if not found.
   */
  public getCookie(name: string): Cookie | null {
    const index = this.#cookies.findIndex(item => item.name === name);
    
    if(index > -1) return this.#cookies[index];    
    return null;
  }

  /**
   * Deletes a cookie by its name.
   * @param name - The name of the cookie to delete.
   */
  public deleteCookie(name: string): void {
    const index = this.#cookies.findIndex(item => item.name === name);
    
    if(index < 0) return;
    this.#cookies.splice(index, 1);
  }

  /**
   * Returns the number of cookies in the jar.
   * @returns The number of cookies.
   */
  public size(): number {
    return this.#cookies.length;
  }

  /**
   * Converts the cookies in the jar to an array of serialized cookies.
   * @returns An array of serialized cookies.
   */
  public toArray(): SerializedCookie[] {
    return this.#cookies.map(item => ({
      name: item.name,
      value: encodeURIComponent(item.value),
      expires: item.expires?.toISOString() ?? null,
      maxAge: item.maxAge ?? null,
      domain: item.domain ?? null,
      path: item.path ?? null,
      secure: item.secure ?? null,
      httpOnly: item.httpOnly ?? null,
      sameSite: item.sameSite ?? null,
      priority: item.priority ?? null,
      partitioned: item.partitioned ?? null,
    }));
  }

  /**
   * Serializes the cookies in the jar into a string suitable for use in the 'Cookie' HTTP header.
   * @returns The serialized cookies as a string.
   */
  public serialize(): string {
    const cookies = new List<string>();

    this.toArray().forEach(cookie => {
      cookies.push(`${cookie.name}=${cookie.value}`);
    });

    return cookies.toArray().join('; ').trim();
  }

  /**
   * Converts the cookies in the jar to a hierarchical tree structure.
   * 
   * @returns {ReadonlyStorageBlock<SerializedCookie|null>} A tree structure of serialized cookies. 
   */
  public tree(): ReadonlyStorageBlock<SerializedCookie | null> {
    const list = new List<SerializedCookie>();

    for(const cookie of this.toArray().sort((a, b) => a.name.localeCompare(b.name))) {
      list.push(cookie);
    }

    return list.tree();
  }

  /**
   * Serializes a single cookie into a string suitable for use in the 'Cookie' HTTP header.
   * @param cookie - The cookie to serialize.
   * @returns The serialized cookie as a string.
   */
  public static serializeCookie(cookie: Cookie): string {
    let c = `${cookie.name}=${encodeURIComponent(cookie.value)}`;

    if(cookie.expires) {
      c += `; Expires=${cookie.expires.toUTCString()}`;
    }

    if(cookie.path) {
      c += `; Path=${cookie.path}`;
    }

    if(cookie.domain) {
      c += `; Domain=${cookie.domain}`;
    }

    if(cookie.secure) {
      c += '; Secure';
    }

    if(cookie.sameSite) {
      c += `; SameSite=${cookie.sameSite}`;
    }

    if(cookie.maxAge !== undefined) {
      c += `; Max-Age=${cookie.maxAge}`;
    }

    if(cookie.httpOnly) {
      c += '; HttpOnly';
    }

    if(cookie.priority) {
      c += `; Priority=${cookie.priority}`;
    }

    if(cookie.partitioned) {
      c += '; Partitioned';
    }

    return c;
  }

  /**
   * Parses a cookie string and returns a corresponding Cookie object.
   * @param cookie - The cookie string to parse.
   * @returns The parsed Cookie object.
   */
  public static parseCookie(cookie: string): Cookie {
    const [name, value] = cookie.split(';')[0].split('=');

    const cookieObject: Cookie = {
      name: name.trim(),
      value: decodeURIComponent(value.trim()),
    };

    const attributes = cookie.split(';').slice(1);

    for(const attribute of attributes) {
      const [attrName, attrValue] = attribute.trim().split('=');
      const trimmedAttrName = attrName.trim().toLowerCase();

      switch(trimmedAttrName) {
        case 'expires':
          cookieObject.expires = new Date(attrValue);
          break;
        case 'path':
          cookieObject.path = attrValue;
          break;
        case 'domain':
          cookieObject.domain = attrValue;
          break;
        case 'secure':
          cookieObject.secure = true;
          break;
        case 'samesite':
          cookieObject.sameSite = (attrValue[0].toUpperCase() + attrValue.slice(1)) as 'Strict' | 'Lax' | 'None';
          break;
        case 'max-age':
          cookieObject.maxAge = parseInt(attrValue, 10);
          break;
        case 'httponly':
          cookieObject.httpOnly = true;
          break;
        case 'priority':
          cookieObject.priority = (attrValue[0].toUpperCase() + attrValue.slice(1)) as 'High' | 'Low' | 'Medium';
          break;
        case 'partitioned':
          cookieObject.partitioned = true;
          break;
      }
    }

    return cookieObject;
  }

  public [Symbol.toStringTag]() {
    return '[object CookiesJar]';
  }

  public [Symbol.iterator]() {
    return this.toArray()[Symbol.iterator]();
  }
}

export default CookiesJar;
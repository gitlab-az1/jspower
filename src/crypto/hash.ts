import CryptoJS from 'crypto-js';
import { isNode } from '../constants';


export class Hash {

  public static get promises(): AsyncHash {
    return new AsyncHash();
  }

  /**
   * Simple synchronous sha256 hash
   * 
   * @param {string} data The data to hash 
   * @returns {string} The hash
   */
  public static sha256(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  /**
   * Simple synchronous sha512 hash
   * 
   * @param {string} data The data to hash 
   * @returns {string} The hash
   */
  public static sha512(data: string): string {
    return CryptoJS.SHA512(data).toString(CryptoJS.enc.Hex);
  }

  /**
   * Deep compare two hashes
   * 
   * @param src 
   * @param target 
   * @returns 
   */
  public static equals(src: string, target: string): boolean {
    return src.toLowerCase() === target.toLowerCase();
  }
}


export class AsyncHash {

  /**
   * Hashes the given data with sha256 algorithm
   * 
   * @param {string} data The data to hash 
   * @returns {string} The hash
   */
  public async sha256(data: string): Promise<string> {
    if(!isNode) return Promise.resolve<string>(CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex));

    const __crypt = await import('crypto');
    const hash = __crypt.createHash('sha256');
    hash.update(data);

    return hash.digest('hex');
  }

  /**
   * Hashes the given data with sha512 algorithm
   * 
   * @param {string} data The data to hash 
   * @returns {string} The hash
   */
  public async sha512(data: string): Promise<string> {
    if(!isNode) return Promise.resolve<string>(CryptoJS.SHA512(data).toString(CryptoJS.enc.Hex));

    const __crypt = await import('crypto');
    const hash = __crypt.createHash('sha512');
    hash.update(data);

    return hash.digest('hex');
  }
}


export default Hash;
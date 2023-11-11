import { ssrSafeWindow } from '../ssr';


export class Crypto {

  /**
   * Generate a random nonce
   * 
   * @param {number} [byteLength= 32] 
   * @returns {Promise<string>}
   */
  public static async nonce(byteLength: number = 32): Promise<string> {
    let arr: Uint8Array;

    if(ssrSafeWindow) {
      arr = ssrSafeWindow.crypto.getRandomValues(new Uint8Array(byteLength));
    } else {
      const __crypto = await import('node:crypto');
      arr = new Uint8Array(__crypto.randomBytes(byteLength));
    }

    return Array.prototype.map.call(arr, function(byte) {
      return ('0' + byte.toString(16)).slice(-2);
    }).join('');
  }

  /**
   * Returns an Uint8Array filled with random bytes
   * 
   * @param {number} [length] 
   * @returns {Promise<Uint8Array>}
   */
  public static async randomBytes(length: number): Promise<Uint8Array> {
    if(ssrSafeWindow) return ssrSafeWindow.crypto.getRandomValues(new Uint8Array(length));

    const __crypto = await import('node:crypto');
    return new Uint8Array(__crypto.randomBytes(length));
  }

  /**
   * Generate a random UUID
   * 
   * @returns {string}
   */
  public static uuid(): string {
    let d = new Date().getTime();

    if(typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now(); // use high-precision timer if available
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}
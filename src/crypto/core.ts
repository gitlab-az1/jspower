import { ssrSafeWindow } from '../ssr';


export class Crypto {
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

  public static async randomBytes(length: number): Promise<Uint8Array> {
    if(ssrSafeWindow) return ssrSafeWindow.crypto.getRandomValues(new Uint8Array(length));

    const __crypto = await import('node:crypto');
    return new Uint8Array(__crypto.randomBytes(length));
  }
}
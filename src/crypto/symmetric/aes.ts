import { assertString } from '../../utils/assertions';
import { BrowserCryptoKey } from '../browser/key';
import { getPreciseTime } from '../../utils';
import { Exception } from '../../errors';
import { CryptoKey } from '../key';
import { Crypto } from '../core';
import CryptoJS from 'crypto-js';


export interface Decrypted<T> {
  readonly payload: T;
  readonly age: number;
  readonly signature: string;
  readonly currentTimestamp: number;
  readonly encryptionTimestamp: number;
}

export class AES {
  static readonly #CONTENT_SEPARATOR = '$:-strcontentseparator-:$';
  readonly #key: CryptoKey | BrowserCryptoKey;

  constructor(key: CryptoKey | BrowserCryptoKey) {
    if(
      !(key instanceof CryptoKey) &&
      !(key instanceof BrowserCryptoKey)
    ) {
      throw new Exception('Invalid crypto key');
    }

    key.assertValidity();
    this.#key = key;

    if((key.algorithm.name as string).toLowerCase().indexOf('aes') < 0) {
      console.warn(`${new Date().getTime()} | [AES warn]: The provided encryption key is declared as ${key.algorithm.name} but it is not an AES key. This may cause unexpected results.`);
    }
  }

  public async encrypt(data: any): Promise<string> {
    try {
      data = JSON.stringify(data);
    } catch {
      throw new Exception('Not serializable data');
    }

    const iv = this.#key.generateInitializationVector();
    const text = Array.prototype.map.call(iv, function(byte) {
      return ('0' + byte.toString(16)).slice(-2);
    }).join('');

    const signature = await Crypto.pbkdf2(data, text);
    const h = JSON.stringify({
      ts: new Date().getTime(),
      now: getPreciseTime(),
      length: data.length,
      signature,
    });

    return CryptoJS.AES.encrypt(`${h}${AES.#CONTENT_SEPARATOR}${data}`, this.#key.valueOf()).toString();
  }

  public async decrypt<T>(payload: string): Promise<Decrypted<T>> {
    assertString(payload);

    const iv = this.#key.generateInitializationVector();
    const text = Array.prototype.map.call(iv, function(byte) {
      return ('0' + byte.toString(16)).slice(-2);
    }).join('');
    
    const [hRaw, cRaw] = CryptoJS.AES.decrypt(payload, this.#key.valueOf()).toString(CryptoJS.enc.Utf8).split(AES.#CONTENT_SEPARATOR);

    const headers = JSON.parse(hRaw);
    const hash = await Crypto.pbkdf2(cRaw, text);

    if(headers.signature !== hash) {
      throw new Exception('Invalid payload signature', {
        expected: headers.signature,
        received: hash,
      });
    }

    return Object.freeze({
      payload: JSON.parse(cRaw) as T,
      age: getPreciseTime() - headers.now,
      signature: headers.signature,
      currentTimestamp: new Date().getTime(),
      encryptionTimestamp: headers.ts,
    }) as Decrypted<T>;
  }
}

export default AES;
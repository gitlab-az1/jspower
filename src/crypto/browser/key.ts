import { Exception } from '../../errors';
import type { Dict } from '../../types';
import { Crypto } from '../core';
import { is } from '../../utils';
import math from '../../math';


export type KeyAlgorithm = {
  name: string;
  length?: number;
} | Dict<{
  name: string;
  length?: number;
}>;


export type CryptoKeyOptions = {
  algorithm?: KeyAlgorithm;
  extractable?: boolean;
  type?: KeyType;
  usages?: KeyUsage[];
}

export type AsymmetricSupportedAlgorithms = 'rsa' | 'ec';


const keyUsages = ['decrypt', 'deriveBits', 'deriveKey', 'encrypt', 'sign', 'unwrapKey', 'verify', 'wrapKey'];
const keyTypes = ['private', 'public', 'secret'];


export class BrowserCryptoKey {
  static async #DoGenerateSymmetricKey(len: number, options?: Omit<CryptoKeyOptions, 'extractable'>): Promise<BrowserCryptoKey> {
    if(len < 1 || len % 2 !== 0) {
      throw new Exception('Invalid key length. Please provide a positive even number.');
    }

    const n = math.roundToPowerOfTwo(len);
    const uint8Array = await Crypto.randomBytes(n);

    return new BrowserCryptoKey(uint8Array, options);
  }

  /**
   * Generates a symmetric key.
   * 
   * @param {number} length 
   * @returns {Promise<CryptoKey>}
   */
  public static generateSymmetricKey(length: number, options?: Omit<CryptoKeyOptions, 'extractable'>): Promise<BrowserCryptoKey> {
    return BrowserCryptoKey.#DoGenerateSymmetricKey(length, options);
  }


  readonly #key: Uint8Array;

  readonly #algorithm: KeyAlgorithm;
  readonly #extractable: boolean;
  readonly #type: KeyType;
  readonly #usages: KeyUsage[];
  readonly #length: number;
  #isValid: boolean;

  constructor(__key: string | Uint8Array, options?: CryptoKeyOptions) {
    if(is.isString(__key)) {
      __key = new TextEncoder().encode(__key as string);
    }

    if(!(__key instanceof Uint8Array)) {
      throw new Exception('CryptoKey must be a string or Uint8Array');
    }

    if(options?.algorithm) {
      _validateKeyAlgorithm(options.algorithm);
    }

    this.#key = __key;
    this.#length = __key.byteLength;
    this.#algorithm = options?.algorithm ?? { name: '' };

    this.#extractable = options?.extractable && is.isBoolean(options.extractable) ?
      options.extractable :
      false;

    this.#type = options?.type && is.isString(options.type) && keyTypes.includes(options.type) ?
      options.type :
      'secret';

    if(options?.usages) {
      _validateKeyUsages(options.usages);
    }

    this.#usages = options?.usages ?? [];
    this.#isValid = false;

    this.#DoValidationAssertion();
  }

  #DoValidationAssertion(): void {
    try {
      _validateKeyAlgorithm(this.#algorithm);
      _validateKeyUsages(this.#usages);

      if(!is.isString(this.#type) || !keyTypes.includes(this.#type)) {
        throw new Exception();
      }

      if(this.#key.byteLength !== this.#length) {
        throw new Exception();
      }

      this.#isValid = true;
    } catch (err: any) {
      console.warn(`${new Date().getTime()} | [BrowserCryptoKey warn]: ${err.message || err}`);
      this.#isValid = false;
    }
  }

  #DoIVGeneration(): Uint8Array {
    const reverseKey = () => {
      const key = this.#key;
      const keyLength = this.#key.length;
      const keyHalfLength = math.floor(keyLength / 2);
    
      for(let i = 0; i < keyHalfLength; i++) {
        const j = keyLength - i - 1;
        const tmp = key[i];
        
        key[i] = key[j];
        key[j] = tmp;
      }
    
      return Array.prototype.map.call(key, function(byte) {
        return ('0' + byte.toString(16)).slice(-2);
      }).join('');
    };

    const key = reverseKey();
    const middleIndex = math.floor(key.length / 2);
    const center = key.slice(middleIndex - 8, middleIndex + 8);
    const end = key.slice(key.length - 16, key.length);

    const uint8Array = new TextEncoder().encode(`${end}${center}`);
    return uint8Array;
  }

  /**
   * Ensure the key is valid.
   */
  public assertValidity(): void {
    return this.#DoValidationAssertion();
  }

  /**
   * Generates a initialization vector based in the provided key.
   */
  public generateInitializationVector(): Uint8Array {
    return this.#DoIVGeneration();
  }

  public get length(): number {
    return this.#length;
  }

  public get algorithm(): KeyAlgorithm {
    return this.#algorithm;
  }

  public get type(): KeyType {
    return this.#type;
  }

  public get extractable(): boolean {
    return this.#extractable;
  }

  public get usages(): KeyUsage[] {
    return this.#usages;
  }

  public [Symbol.iterator]() {
    return this.#usages[Symbol.iterator]();
  }

  public get [Symbol.toStringTag](): string {
    return '[object BrowserCryptoKey]';
  }

  public valueOf(): string {
    if(!this.#isValid) {
      throw new Exception('Invalid key');
    }

    if(!(this.#key instanceof Uint8Array)) {
      throw new Exception('Something went wrong with the key, it is not a Uint8Array');
    }

    return Array.prototype.map.call(this.#key, function(byte) {
      return ('0' + byte.toString(16)).slice(-2);
    }).join('');
  }
}


function _validateKeyAlgorithm(alg: any): asserts alg is KeyAlgorithm {
  if(!is.isObject(alg)) {
    throw new Exception('KeyAlgorithm must be an object');
  }

  if(!alg.name || !is.isString(alg.name)) {
    throw new Exception('KeyAlgorithm.name is required');
  }

  if(alg.length && !is.isNumber(alg.length)) {
    throw new Exception('KeyAlgorithm.length must be a number');
  }

  for(const prop in alg) {
    if(prop === 'name') continue;
    if(prop === 'length') continue;

    if(!is.isObject(alg[prop])) {
      throw new Exception(`KeyAlgorithm.${prop} must be an object`);
    }

    if(!alg[prop].name || !is.isString(alg[prop].name)) {
      throw new Exception(`KeyAlgorithm.${prop}.name is required`);
    }

    if(alg[prop].length && !is.isNumber(alg[prop].length)) {
      throw new Exception(`KeyAlgorithm.${prop}.length must be a number`);
    }
  }
}


function _validateKeyUsages(value: unknown): asserts value is KeyUsage[] {
  if(!is.isArray(value)) {
    throw new Exception('KeyAlgorithm must be an array');
  }
    
  for(const usage of value) {
    if(!keyUsages.includes(usage)) {
      throw new Exception(`KeyAlgorithm.usages must be one of ${keyUsages.join(', ')}`);
    }
  }
}
import { ssrSafeWindow } from '../ssr';

if(ssrSafeWindow) {
  throw new Error('CryptoKey is not available in browser environment');
}

import crypto from 'node:crypto';

import { Exception } from '../errors';
import type { Dict } from '../types';
import { Crypto } from './core';
import { is } from '../utils';
import math from '../math';


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


export class CryptoKey {
  static async #DoGenerateAsymmetricKeyPair(
    algorithmType: AsymmetricSupportedAlgorithms,
    length: number = 2048,
    keyOptions?: {
      publicKey?: Omit<CryptoKeyOptions, 'extractable' | 'type'>;
      privateKey?: Omit<CryptoKeyOptions, 'extractable' | 'type'>;
    }, curveName: string = 'secp256k1'): Promise<[CryptoKey, CryptoKey]> {

    length = math.clamp(length, 1024, 4096);
    keyOptions ??= {};

    if(!keyOptions.publicKey?.algorithm) {
      keyOptions.publicKey = {
        ...keyOptions.publicKey,
        algorithm: {
          name: algorithmType,
          length,
        },
      };
    }

    if(!keyOptions.privateKey?.algorithm) {
      keyOptions.privateKey = {
        ...keyOptions.privateKey,
        algorithm: {
          name: algorithmType,
          length,
        },
      };
    }

    if(algorithmType === 'rsa') return new Promise((resolve, reject) => {
      crypto.generateKeyPair('rsa', {
        modulusLength: length,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      }, (err, publicKey, privateKey) => {
        if(err) return reject(err);

        const publicCryptoKey = new CryptoKey(publicKey, {
          ...keyOptions?.publicKey,
          type: 'public',
        });

        const privateCryptoKey = new CryptoKey(privateKey, {
          ...keyOptions?.privateKey,
          type: 'private',
        });

        resolve([publicCryptoKey, privateCryptoKey]);
      });
    });

    if(algorithmType === 'ec') return new Promise((resolve, reject) => {
      crypto.generateKeyPair('ec', {
        namedCurve: curveName,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      }, (err, publicKey, privateKey) => {
        if(err) return reject(err);

        const publicCryptoKey = new CryptoKey(publicKey, {
          ...keyOptions?.publicKey,
          type: 'public',
        });

        const privateCryptoKey = new CryptoKey(privateKey, {
          ...keyOptions?.privateKey,
          type: 'private',
        });

        resolve([publicCryptoKey, privateCryptoKey]);
      
      });
    });

    throw new Exception('Unsupported algorithm type');
  }

  /**
   * Generates an asymmetric key pair.
   * 
   * @returns {Promise<[CryptoKey, CryptoKey]>}
   */
  public static generateAsymmetricKeyPair(algorithmType: AsymmetricSupportedAlgorithms,
    length: number = 2048,
    keyOptions?: {
      publicKey?: Omit<CryptoKeyOptions, 'extractable' | 'type'>;
      privateKey?: Omit<CryptoKeyOptions, 'extractable' | 'type'>;
    }, cruveName: string = 'secp256k1'): Promise<[CryptoKey, CryptoKey]> {
      
    return CryptoKey.#DoGenerateAsymmetricKeyPair(
      algorithmType,
      length,
      keyOptions,
      cruveName // eslint-disable-line comma-dangle
    );
  }


  static async #DoGenerateSymmetricKey(len: number, options?: Omit<CryptoKeyOptions, 'extractable'>): Promise<CryptoKey> {
    if(len < 1 || len % 2 !== 0) {
      throw new Exception('Invalid key length. Please provide a positive even number.');
    }

    const n = math.roundToPowerOfTwo(len);
    const uint8Array = await Crypto.randomBytes(n);
    const keyBuffer = Buffer.from(uint8Array);

    return new CryptoKey(keyBuffer, options);
  }

  /**
   * Generates a symmetric key.
   * 
   * @param {number} length 
   * @returns {Promise<CryptoKey>}
   */
  public static generateSymmetricKey(length: number, options?: Omit<CryptoKeyOptions, 'extractable'>): Promise<CryptoKey> {
    return CryptoKey.#DoGenerateSymmetricKey(length, options);
  }

  readonly #key: Buffer;

  readonly #algorithm: KeyAlgorithm;
  readonly #extractable: boolean;
  readonly #type: KeyType;
  readonly #usages: KeyUsage[];
  readonly #length: number;
  #isValid: boolean;

  constructor(__key: string | Buffer | Uint8Array, options?: CryptoKeyOptions) {
    if(options?.algorithm) {
      _validateKeyAlgorithm(options.algorithm);
    }

    if(is.isString(__key)) {
      __key = Buffer.from(__key);
    } else if (__key instanceof Uint8Array) {
      __key = Buffer.from(__key);
    }

    if(!Buffer.isBuffer(__key)) {
      throw new Exception('CryptoKey must be a string, Buffer, or Uint8Array');
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
        throw new Exception('KeyAlgorithm.type must be one of ' + keyTypes.join(', '));
      }

      if(this.#key.byteLength !== this.#length) {
        throw new Exception('KeyAlgorithm.length must be equal to the key length');
      }

      this.#isValid = true;
    } catch (err: any) {
      console.warn(`${new Date().getTime()} | [CryptoKey warn]: ${err.message || err}`);
      this.#isValid = false;
    }
  }

  #DoIVGeneration(): Buffer {
    const reverseKey = () => {
      const key = Buffer.from(this.#key);
      const keyLength = key.length;
      const keyHalfLength = math.floor(keyLength / 2);
    
      for(let i = 0; i < keyHalfLength; i++) {
        const j = keyLength - i - 1;
        const tmp = key[i];
        
        key[i] = key[j];
        key[j] = tmp;
      }
    
      return key.toString('hex');
    };

    const key = reverseKey();
    const middleIndex = math.floor(key.length / 2);
    const center = key.slice(middleIndex - 8, middleIndex + 8);
    const end = key.slice(key.length - 16, key.length);

    return Buffer.from(`${end}${center}`, 'hex');
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
  public generateInitializationVector(): Buffer {
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
    return 'CryptoKey';
  }

  public valueOf(): string {
    if(!this.#isValid) {
      throw new Exception();
    }
    
    if(!Buffer.isBuffer(this.#key)) {
      throw new Exception('Something went wrong with the key, it is not a Buffer');
    }
    
    return this.#key.toString('utf-8');
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
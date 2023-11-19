import math from '../math';
import { isNode } from '../constants';
import { Exception } from '../errors';
import { AESCypher } from './symmetric';
import { BrowserCryptoKey } from './browser';
import { CryptoKey, CryptoKeyOptions } from './key';
import { Crypto, Cypher, CypherAlgorithm } from './core';


export const MIN_ENC_LAYERS = 2;
export const MAX_ENC_LAYERS = 8;


export interface Decrypted<T> {
  readonly payload: T;
  readonly signature: string;
}

export type LayeredEncryptionProps = {
  key: string | CryptoKey | BrowserCryptoKey | Buffer | Uint8Array;
  algorithm?: CypherAlgorithm;
  layers?: number;
}

type OuterLayer = {
  readonly signature: string;
  readonly final: string;
}


export class LayeredEncryption {
  static readonly #ASYMMETRIC_CYPHER_NAMES = ['secp521r1', 'secp512k1'];

  readonly #key: string;
  readonly #layers: number;
  readonly #algorithm: CypherAlgorithm;
  readonly #initKey: CryptoKey | BrowserCryptoKey;

  constructor(props: LayeredEncryptionProps) {
    if(!props.key) {
      throw new Exception('Key is required');
    }

    this.#layers = math.clamp(props.layers ?? 3, MIN_ENC_LAYERS, MAX_ENC_LAYERS);
    let enc: CryptoKey | BrowserCryptoKey;

    if(isNode && Buffer.isBuffer(props.key)) {
      enc = new CryptoKey(props.key, {
        algorithm: {
          name: props.algorithm ?? 'aes-256-cbc',
        },
        usages: ['encrypt', 'decrypt'],
      });
    } else if(props.key instanceof Uint8Array || typeof props.key === 'string') {
      const p: CryptoKeyOptions = {
        algorithm: {
          name: props.algorithm ?? 'aes-256-cbc',
        },
        usages: ['encrypt', 'decrypt'],
      };

      enc = isNode ? new CryptoKey(props.key, p) : new BrowserCryptoKey(props.key, p);
    } else if(props.key instanceof CryptoKey || props.key instanceof BrowserCryptoKey) {
      enc = props.key;
    } else {
      throw new Exception('Invalid key type');
    }

    enc.assertValidity();

    this.#algorithm = props.algorithm ?? 'aes-256-cbc';
    this.#key = enc.valueOf();
    this.#initKey = enc;
  }

  /**
   * Gets the encryption algorithm used by the instance.
   * @returns The encryption algorithm.
   */
  public get algorithm(): CypherAlgorithm {
    return this.#algorithm;
  }

  /**
   * Gets the cypher wrapper with the initial encryption key used by the instance.
   * @returns The cypher wrapper.
   */
  public get cypher(): Cypher {
    return this.#getCypher(this.#initKey);
  }

  /**
   * Gets the initial encryption key used by the instance.
   * @returns The initial encryption key.
   */
  public get initKey(): CryptoKey | BrowserCryptoKey {
    return this.#initKey;
  }

  /**
   * Gets the number of encryption layers used by the instance.
   * @returns The number of encryption layers.
   */
  public get layers(): number {
    return this.#layers;
  }

  #keyMutation(factor: number): string {
    if(LayeredEncryption.#ASYMMETRIC_CYPHER_NAMES.includes(this.#algorithm)) return this.#asymmetricKeyMutation();
    const result: Array<string> = [];

    for(let i = 0; i < this.#key.length; i++) {
      const char = this.#key.charCodeAt(i);
      const mutated = char + 2 * (factor > 0 ? factor : 1);
      result.push(String.fromCharCode(math.round(mutated)));
    }

    return result.reverse().join('');
  }

  #asymmetricKeyMutation(): string {
    throw new Error('asymmetric key mutation is not implemented yet');
  }

  #getIVFromInitKey(): string {
    if(this.#initKey instanceof CryptoKey) return this.#initKey.generateInitializationVector().toString('hex');
    return Array.prototype.map.call(this.#initKey.generateInitializationVector(), function(byte) {
      return ('0' + byte.toString(16)).slice(-2);
    }).join('');
  }

  #getCryptoKey(value: string): CryptoKey | BrowserCryptoKey {
    if(isNode) return new CryptoKey(value, {
      algorithm: {
        name: this.#algorithm,
      },
      usages: ['encrypt', 'decrypt'],
    });

    return new BrowserCryptoKey(value, {
      algorithm: {
        name: this.#algorithm,
      },
      usages: ['encrypt', 'decrypt'],
    });
  }

  #getCypher(key: CryptoKey | BrowserCryptoKey): Cypher {
    if(this.#algorithm === 'aes-256-cbc') return new AESCypher(key);
    throw new Error('Asymmetric cypher is not implemented yet');
  }


  async #EncryptData(data: any): Promise<string> {
    try {
      data = JSON.stringify(data);
    } catch {
      throw new Exception('Data is not serializable');
    }

    const signature = await Crypto.hmac512(data, this.#getIVFromInitKey());

    for(let i = 0; i <= this.#layers - 1; i++) {
      const k = this.#keyMutation(i);
      const key = this.#getCryptoKey(k);
      const cypher = this.#getCypher(key);

      data = await cypher.encrypt(data);
    }

    const k = this.#keyMutation(this.#layers);
    const key = this.#getCryptoKey(k);
    const cypher = this.#getCypher(key);

    return cypher.encrypt(JSON.stringify({
      signature,
      final: data,
    }));
  }

  /**
   * Encrypts the provided data using layered encryption.
   * @param data - The data to encrypt.
   * @returns A Promise that resolves to the encrypted data.
   * @private
   */
  public encrypt(data: any): Promise<string> {
    return this.#EncryptData(data);
  }


  async #DecryptData<T>(encryptedData: string): Promise<Decrypted<T>> {
    const i = this.#keyMutation(this.#layers);
    const key = this.#getCryptoKey(i);
    const cypher = this.#getCypher(key);

    const decryptedOuterLayer = await cypher.decrypt<string>(encryptedData);

    let parsedData;

    try {
      parsedData = JSON.parse(decryptedOuterLayer) as OuterLayer;
    } catch {
      throw new Exception('Invalid encrypted data format');
    }

    const { final, signature } = parsedData;
    let decryptedData = final;

    for(let i = this.#layers - 1; i >= 0; i--) {
      const k = this.#keyMutation(i);
      const key = this.#getCryptoKey(k);
      const cypher = this.#getCypher(key);
    
      decryptedData = await cypher.decrypt<string>(decryptedData);
    }

    const calculatedSignature = await Crypto.hmac512(decryptedData, this.#getIVFromInitKey());

    if(calculatedSignature !== signature) {
      throw new Exception('Invalid signature. Data may have been tampered with.');
    }

    try {
      const payload = JSON.parse(decryptedData);
      return Object.freeze({
        payload,
        signature,
      });
    } catch {
      throw new Exception('Invalid decrypted data format');
    }
  }

  /**
   * Decrypts the provided encrypted data.
   * @param encryptedData - The encrypted data to decrypt.
   * @returns A Promise that resolves to the decrypted data and signature.
   * @private
   */
  public decrypt<T>(encryptedData: string): Promise<Decrypted<T>> {
    return this.#DecryptData<T>(encryptedData);
  }
}

export default LayeredEncryption;
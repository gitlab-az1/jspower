import { CryptoKey } from './key';
import { BrowserCryptoKey } from './browser/key';


describe('crypto/crypto-key', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('Node.JS CryptoKey should be instance of CryptoKey', () => {
    const cryptoKey = new CryptoKey(Buffer.from('test'), {
      algorithm: {
        name: 'test',
      },
    });

    expect(cryptoKey).toBeInstanceOf(CryptoKey);
  });

  test('BrowserCryptoKey should be instance of BrowserCryptoKey', () => {
    const cryptoKey = new BrowserCryptoKey('test', {
      algorithm: {
        name: 'test',
      },
    });

    expect(cryptoKey).toBeInstanceOf(BrowserCryptoKey);
  });

  test('Node.JS CryptoKey should return correct key type', () => {
    const cryptoKey = new CryptoKey(Buffer.from('test'), {
      algorithm: {
        name: 'test',
      },
    });

    expect(cryptoKey.type).toBe('secret');
  });

  test('BrowserCryptoKey should return correct key type', () => {
    const cryptoKey = new BrowserCryptoKey('test', {
      algorithm: {
        name: 'test',
      },
    });

    expect(cryptoKey.type).toBe('secret');
  });

  test('Node.JS CryptoKey should return correct key length', () => {
    const cryptoKey = new CryptoKey(Buffer.from('test'), {
      algorithm: {
        name: 'test',
      },
    });

    expect(cryptoKey.length).toBe(4);
  });

  test('BrowserCryptoKey should return correct key length', () => {
    const cryptoKey = new BrowserCryptoKey('test', {
      algorithm: {
        name: 'test',
      },
    });

    expect(cryptoKey.length).toBe(4);
  });

  test('Node.JS CryptoKey should return correct key value', () => {
    const cryptoKey = new CryptoKey(Buffer.from('test'), {
      algorithm: {
        name: 'test',
      },
    });

    cryptoKey.assertValidity();
    expect(cryptoKey.valueOf()).toBe('test');
  });

  test('BrowserCryptoKey should return correct key value', () => {
    const cryptoKey = new BrowserCryptoKey('test', {
      algorithm: {
        name: 'test',
      },
    });

    cryptoKey.assertValidity();
    expect(cryptoKey.valueOf()).toBe('test');
  });

  test('Node.JS CryptoKey should return correct key algorithm', () => {
    const cryptoKey = new CryptoKey(Buffer.from('test'), {
      algorithm: {
        name: 'test',
      },
    });

    expect(cryptoKey.algorithm).toEqual({ name: 'test' });
  });

  test('BrowserCryptoKey should return correct key algorithm', () => {
    const browserKey = new BrowserCryptoKey('test', {
      algorithm: {
        name: 'test',
      },
    });

    expect(browserKey.algorithm).toEqual({ name: 'test' });
  });

  test('Node.JS CryptoKey should return correct key usages', () => {
    const cryptoKey = new CryptoKey(Buffer.from('test'), {
      algorithm: {
        name: 'test',
      },
      usages: ['encrypt', 'decrypt'],
    });

    expect(cryptoKey.usages).toEqual(['encrypt', 'decrypt']);
  });

  test('BrowserCryptoKey should return correct key usages', () => {
    const browserKey = new BrowserCryptoKey('test', {
      algorithm: {
        name: 'test',
      },
      usages: ['encrypt', 'decrypt'],
    });

    expect(browserKey.usages).toEqual(['encrypt', 'decrypt']);
  });

  test('Node.JS CryptoKey should return correct key usages iterator', () => {
    const cryptoKey = new CryptoKey(Buffer.from('test'), {
      algorithm: {
        name: 'test',
      },
      usages: ['encrypt', 'decrypt'],
    });

    expect([...cryptoKey]).toEqual(['encrypt', 'decrypt']);
  });

  test('BrowserCryptoKey should return correct key usages iterator', () => {
    const browserKey = new BrowserCryptoKey('test', {
      algorithm: {
        name: 'test',
      },
      usages: ['encrypt', 'decrypt'],
    });

    expect([...browserKey]).toEqual(['encrypt', 'decrypt']);
  });

  test('Node.JS CryptoKey should return correct key extractable', () => {
    const cryptoKey = new CryptoKey(Buffer.from('test'), {
      algorithm: {
        name: 'test',
      },
      extractable: true,
    });

    expect(cryptoKey.extractable).toBe(true);
  });

  test('BrowserCryptoKey should return correct key extractable', () => {
    const browserKey = new BrowserCryptoKey('test', {
      algorithm: {
        name: 'test',
      },
      extractable: true,
    });

    expect(browserKey.extractable).toBe(true);
  });

  test('Node.JS CryptoKey should return an initialization vector', () => {
    const cryptoKey = new CryptoKey(Buffer.from('test'), {
      algorithm: {
        name: 'test',
      },
    });

    expect(cryptoKey.generateInitializationVector()).toBeInstanceOf(Buffer);
  });

  test('BrowserCryptoKey should return an initialization vector', () => {
    const browserKey = new BrowserCryptoKey('test', {
      algorithm: {
        name: 'test',
      },
    });

    expect(browserKey.generateInitializationVector()).toBeInstanceOf(Uint8Array);
  });

  test('Node.JS and BrowserCryptoKey should return the same initialization vector if both was the same key', () => {
    const cryptoKey = new CryptoKey(Buffer.from('test'), {
      algorithm: {
        name: 'test',
      },
    });

    const cryptoKey2 = new CryptoKey(Buffer.from('test21'), {
      algorithm: {
        name: 'test',
      },
    });

    const browserKey = new BrowserCryptoKey('test', {
      algorithm: {
        name: 'test',
      },
    });

    const browserKey2 = new BrowserCryptoKey('test21', {
      algorithm: {
        name: 'test',
      },
    });

    expect(cryptoKey.generateInitializationVector().toString('hex')).toEqual(new TextDecoder().decode(browserKey.generateInitializationVector()));
    expect(cryptoKey2.generateInitializationVector().toString('hex')).toEqual(new TextDecoder().decode(browserKey2.generateInitializationVector()));
    expect(cryptoKey2.generateInitializationVector().toString('hex')).not.toEqual(new TextDecoder().decode(browserKey.generateInitializationVector()));
    expect(cryptoKey.generateInitializationVector().toString('hex')).not.toEqual(new TextDecoder().decode(browserKey2.generateInitializationVector()));
  });

  test('Node.JS CryptoKey should throw an error if the key is invalid', () => {
    expect(() => new CryptoKey([0x1, 0xf], {
      algorithm: {
        name: 'test',
      },
    })).toThrow();
  });

  test('BrowserCryptoKey should throw an error if the key is invalid', () => {
    expect(() => new BrowserCryptoKey([0x1, 0xf], {
      algorithm: {
        name: 'test',
      },
    })).toThrow();
  });

  test('Node.JS CryptoKey should use correctly the `Symbol.toStringTag`', () => {
    const cryptoKey = new CryptoKey(Buffer.from('test'), {
      algorithm: {
        name: 'test',
      },
    });

    expect(cryptoKey[Symbol.toStringTag]).toBe('CryptoKey');
  });

  test('BrowserCryptoKey should use correctly the `Symbol.toStringTag`', () => {
    const browserKey = new BrowserCryptoKey('test', {
      algorithm: {
        name: 'test',
      },
    });

    expect(browserKey[Symbol.toStringTag]).toBe('BrowserCryptoKey');
  });
});
import { CryptoKey } from '../key';
import { AES } from './aes';


describe('crypto/symmetric/aes', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  const cryptoKey = new CryptoKey('supersecurekey', {
    algorithm: {
      name: 'aes-256-cbc',
    },
  });

  test('it should encrypt and decrypt with Node.JS key', async () => {
    const aes = new AES(cryptoKey);
    const data = { foo: 'bar' };
    const encrypted = await aes.encrypt(data);
    const decrypted = await aes.decrypt<Record<any, any>>(encrypted);

    expect(decrypted.payload).toEqual(data);
    expect(decrypted.payload.foo).toBe('bar');
  });
});
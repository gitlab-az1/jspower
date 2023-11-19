import { LayeredEncryption } from './layered-encryption';


describe('crypto/layered-encryption', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  const encKey = '12345678901234567890123456789012';

  test('it should encrypt and decrypt', async () => {
    const enc = new LayeredEncryption({
      key: encKey,
      algorithm: 'aes-256-cbc',
      layers: 4,
    });

    const data = {
      foo: 'bar',
      baz: 123,
    };

    const encrypted = await enc.encrypt(data);
    const decrypted = await enc.decrypt<Record<string, any>>(encrypted);
    
    expect(decrypted.payload).toEqual(data);
    expect(decrypted.payload.foo).toEqual('bar');
    expect(decrypted.payload.baz).toEqual(123);
    expect(decrypted.signature).toEqual(expect.any(String));
  });
});
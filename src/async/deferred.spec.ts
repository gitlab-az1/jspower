import { Deferred } from './deferred';


describe('async/deferred', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('Deferred must create a promise', () => {
    const deferred = new Deferred();
    expect(deferred.promise).toBeInstanceOf(Promise);
  });

  test('Deferred must resolve', async () => {
    const deferred = new Deferred();
    deferred.resolve(null);

    await expect(deferred.promise).resolves.toBeNull();
  });

  test('Deferred must reject', async () => {
    const deferred = new Deferred();
    deferred.reject(null);
    
    await expect(deferred.promise).rejects.toBeNull();
  });
});
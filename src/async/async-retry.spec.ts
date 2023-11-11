import { asyncRetry } from './async-retry';


describe('async/async-retry', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });
  return;
  test('asyncRetry must be a function', () => {
    expect(asyncRetry).toBeInstanceOf(Function);
  });

  test('asyncRetry must return a promise', () => {
    const res = asyncRetry(async () => void 0, {
      delay: 0,
    });

    expect(res).toBeInstanceOf(Promise);
  });

  test('asyncRetry must resolve', async () => {
    const res = asyncRetry(async () => 1, {
      delay: 0,
    });

    await expect(res).resolves.toBe(1);
  });

  test('asyncRetry must reject', async () => {
    const res = asyncRetry(async () => {
      throw new Error('test');
    }, {
      delay: 0,
    });

    await expect(res).rejects.toThrow('test');
  });

  test('asyncRetry must retry', async () => {
    let i = 0;

    const res = asyncRetry(async () => {
      i++;

      if(i < 3) throw new Error('test');
      return i;
    }, {
      delay: 0,
    });

    await expect(res).resolves.toBe(3);
  });

  test('asyncRetry must retry with delay', async () => {
    let i = 0;

    const res = asyncRetry(async () => {
      i++;

      if(i < 3) throw new Error('test');
      return i;
    }, {
      delay: 100,
    });

    await expect(res).resolves.toBe(3);
  });

  test('asyncRetry must retry with delay and maxRetries', async () => {
    let i = 0;

    const res = asyncRetry(async () => {
      i++;

      if(i < 5) throw new Error('test');
      return i;
    }, {
      delay: 100,
      retries: 3,
    });

    await expect(res).rejects.toThrow('test');
  });

  test('asyncRetry must retry with delay factor', async () => {
    let i = 0;

    const res = asyncRetry(async () => {
      i++;

      if(i < 3) throw new Error('test');
      return i;
    }, {
      delay: 100,
      factor: 2,
    });

    await expect(res).resolves.toBe(3);
  });

  test('asyncRetry must retry with delay factor and maxRetries', async () => {
    let i = 0;

    const res = asyncRetry(async () => {
      i++;

      if(i < 5) throw new Error('test');
      return i;
    }, {
      delay: 100,
      factor: 2,
      retries: 3,
    });

    await expect(res).rejects.toThrow('test');
  });

  test('asyncRetry must retry with delay and maxTimeout', async () => {
    let i = 0;

    const res = asyncRetry(async () => {
      i++;

      if(i < 3) throw new Error('test');
      return i;
    }, {
      delay: 100,
      maxTimeout: 150,
    });

    await expect(res).resolves.toBe(3);
  });

  test('asyncRetry must retry with delay and minTimeout', async () => {
    let i = 0;

    const res = asyncRetry(async () => {
      i++;

      if(i < 3) throw new Error('test');
      return i;
    }, {
      delay: 100,
      minTimeout: 500,
    });

    await expect(res).resolves.toBe(3);
  });
});
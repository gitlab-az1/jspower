import delay from './delay';


describe('async/delay', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('delay must return a promise', () => {
    expect(delay(1000)).toBeInstanceOf(Promise);
  });

  test('delay 1 second must wait 1 second', async () => {
    const start = Date.now();
    await delay(1000);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(987);
  });
});
import { EventEmitter } from './ee';


describe('ascom/acp/broadcaster.EventEmitter', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should subscribe an event and return the listener object', async () => {
    const ee = new EventEmitter();
    const listener = await ee.subscribe('test', () => {});
    
    expect(listener).toHaveProperty('type');
    expect(listener.type).toBe('on');
    expect(listener).toHaveProperty('createdAt');
    expect(listener).toHaveProperty('calls');
    expect(listener.calls).toBe(0);
    expect(listener).toHaveProperty('callback');
    expect(listener).toHaveProperty('unsubscribe');
    expect(listener).toHaveProperty('callbackSignature');
    expect(listener).toHaveProperty('listenerId');
    expect(listener).toHaveProperty('channel');
  });

  test('should emit an event and return the result', async () => {
    const ee = new EventEmitter();
    await ee.subscribe('test', () => 'test' as const);
    
    const result = await ee.emit<'test'>('test');
    
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('result');
    expect(result[0]!.result).toBe('test');
  });

  test('should unsubscribe an event', async () => {
    const ee = new EventEmitter();

    const listener = await ee.subscribe('test', () => 'something');
    const [result1] = await ee.emit('test');

    await listener.unsubscribe();
    const [result2] = await ee.emit<string>('test');

    expect(result1).toHaveProperty('result');
    expect(result1!.result).not.toBeUndefined();
    expect(result1!.result).toBe('something');
    expect(result2).toBeUndefined();
  });

  test('should subscribe an event once and return the listener object', async () => {
    const ee = new EventEmitter();
    const listener = await ee.subscribe('test', () => 'test-string' as const, {
      once: true,
    });

    expect(listener).toHaveProperty('type');
    expect(listener.type).toBe('once');
    expect(listener).toHaveProperty('createdAt');
    expect(listener).toHaveProperty('calls');
    expect(listener.calls).toBe(0);
    expect(listener).toHaveProperty('callback');
    expect(listener).toHaveProperty('unsubscribe');
    expect(listener).toHaveProperty('callbackSignature');
    expect(listener).toHaveProperty('listenerId');
    expect(listener).toHaveProperty('channel');
  });

  test('should emit an event once and return the result', async () => {
    const ee = new EventEmitter();
    await ee.subscribe('test', () => 'test-string' as const, {
      once: true,
    });

    const result1 = await ee.emit<'test'>('test');

    expect(result1).toHaveLength(1);
    expect(result1[0]).toHaveProperty('result');
    expect(result1[0]!.result).toBe('test-string');

    const result2 = await ee.emit<'test'>('test');

    expect(result2).toHaveLength(1);
    expect(result2[0]).toBeNull();
  });

  test('should serialize the current state of the EventEmitter', async () => {
    const ee = new EventEmitter();
    await ee.subscribe('test', () => 'test-string' as const, {
      once: true,
    });

    const result = ee.serialize();
    expect(typeof result).toBe('string');

    const parsed = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toHaveProperty('channel');
    expect(typeof parsed[0].channel).toBe('string');
    expect(parsed[0]).toHaveProperty('listener');
    expect(parsed[0].listener).toHaveProperty('callbackSignature');
    expect(parsed[0].listener).toHaveProperty('callbackFn');
    expect(parsed[0].listener).toHaveProperty('listenerId');
    expect(parsed[0].listener).toHaveProperty('createdAt');
    expect(parsed[0].listener).toHaveProperty('calls');
    expect(parsed[0].listener).toHaveProperty('type');
    expect(parsed[0].listener.type).toBe('once');
  });

  test('should iterate over the listeners wirh spread operator', async () => {
    const ee = new EventEmitter();
    await ee.subscribe('test', () => 'test-string' as const, {
      once: true,
    });

    const arr = [...ee];

    expect(arr).toHaveLength(1);
    expect(arr[0][0]).toBe(0);
    expect(arr[0][1]).toHaveProperty('channel');
    expect(arr[0][1]).toHaveProperty('listener');
    expect(arr[0][1].listener).toHaveProperty('callbackSignature');
    expect(arr[0][1].listener).toHaveProperty('callbackFn');
    expect(arr[0][1].listener).toHaveProperty('listenerId');
    expect(arr[0][1].listener).toHaveProperty('createdAt');
    expect(arr[0][1].listener).toHaveProperty('calls');
    expect(arr[0][1].listener).toHaveProperty('type');
    expect(arr[0][1].listener.type).toBe('once');
  });

  test('should iterate over the listeners with for-of loop', async () => {
    const ee = new EventEmitter();
    await ee.subscribe('test', () => 'test-string' as const, {
      once: true,
    });

    for(const [index, listener] of ee) {
      expect(index).toBe(0);
      expect(listener).toHaveProperty('channel');
      expect(listener).toHaveProperty('listener');
      expect(listener.listener).toHaveProperty('callbackSignature');
      expect(listener.listener).toHaveProperty('callbackFn');
      expect(listener.listener).toHaveProperty('listenerId');
      expect(listener.listener).toHaveProperty('createdAt');
      expect(listener.listener).toHaveProperty('calls');
      expect(listener.listener).toHaveProperty('type');
      expect(listener.listener.type).toBe('once');
    }
  });

  test('should iterate over the listeners with for-await-of loop', async () => {
    const ee = new EventEmitter();
    await ee.subscribe('test', () => 'test-string' as const, {
      once: true,
    });
    
    for await(const [index, listener] of ee) {
      expect(index).toBe(0);
      expect(listener).toHaveProperty('channel');
      expect(listener).toHaveProperty('listener');
      expect(listener.listener).toHaveProperty('callbackSignature');
      expect(listener.listener).toHaveProperty('callbackFn');
      expect(listener.listener).toHaveProperty('listenerId');
      expect(listener.listener).toHaveProperty('createdAt');
      expect(listener.listener).toHaveProperty('calls');
      expect(listener.listener).toHaveProperty('type');
      expect(listener.listener.type).toBe('once');
    }
  });

  test('should not serialize a unsubscribed listener', async () => {
    const ee = new EventEmitter();
    const listener = await ee.subscribe('test', () => 'test-string' as const, {
      once: true,
    });

    await listener.unsubscribe();

    const result = ee.serialize();
    expect(typeof result).toBe('string');

    const parsed = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(0);
  });
});
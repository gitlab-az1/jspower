import { EventEmitter } from './event-emitter';


describe('events/event-emitter', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('EventEmitter must be a class', () => {
    expect(EventEmitter).toBeInstanceOf(Function);
  });

  test('EventEmitter must create an instance', () => {
    const emitter = new EventEmitter();
    expect(emitter).toBeInstanceOf(EventEmitter);
  });

  test('EventEmitter must emit an event', () => {
    const emitter = new EventEmitter();
    const spy = jest.fn();

    emitter.subscribe('test', spy);
    emitter.emit('test');

    expect(spy).toHaveBeenCalled();
  });

  test('EventEmitter must emit an event with data', () => {
    const emitter = new EventEmitter();
    const spy = jest.fn();

    emitter.subscribe('test', spy);
    emitter.emit('test', 'test');

    expect(spy).toHaveBeenCalledWith('test');
  });

  test('EventEmitter must emit an event with multiple data', () => {
    const emitter = new EventEmitter();
    const spy = jest.fn();

    emitter.subscribe('test', spy);
    emitter.emit('test', 'test', 'test');

    expect(spy).toHaveBeenCalledWith('test', 'test');
  });

  test('EventEmitter events must be unsubscribed', () => {
    const emitter = new EventEmitter();
    const spy = jest.fn();

    const subscription = emitter.subscribe('test', spy);
    subscription.unsubscribe();
    emitter.emit('test');

    expect(spy).not.toHaveBeenCalled();
  });
});
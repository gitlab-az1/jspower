import Interceptors from './interceptors';


describe('http/interceptors', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('interceptors should be instantiated', () => {
    const interceptors = new Interceptors();
    expect(interceptors).toBeInstanceOf(Interceptors);
  });

  test('interceptors should set an interceptor', () => {
    const interceptors = new Interceptors<any>();
    const id = interceptors.use(data => data);
    
    expect(id).toBe(0);
    expect(interceptors.handlers.length).toBe(1);
    expect(interceptors.handlers[id]).toHaveProperty('index', 0);
    expect(interceptors.handlers[id]).toHaveProperty('rejected');
    expect(interceptors.handlers[id]).toHaveProperty('fulfilled');
    expect(interceptors.handlers[id]).toHaveProperty('synchronous', false);
  });

  test('interceptors should set many interceptors', () => {
    const interceptors = new Interceptors<any>();
    const id1 = interceptors.use(data => data);
    const id2 = interceptors.use(data => data);
    const id3 = interceptors.use(data => data);
    
    expect(id1).toBe(0);
    expect(id2).toBe(1);
    expect(id3).toBe(2);
    expect(interceptors.handlers.length).toBe(3);
    expect(interceptors.handlers[id1]).toHaveProperty('index', 0);
    expect(interceptors.handlers[id2]).toHaveProperty('index', 1);
    expect(interceptors.handlers[id3]).toHaveProperty('index', 2);
    expect(interceptors.handlers[id1]).toHaveProperty('rejected');
    expect(interceptors.handlers[id2]).toHaveProperty('rejected');
    expect(interceptors.handlers[id3]).toHaveProperty('rejected');
    expect(interceptors.handlers[id1]).toHaveProperty('fulfilled');
    expect(interceptors.handlers[id2]).toHaveProperty('fulfilled');
    expect(interceptors.handlers[id3]).toHaveProperty('fulfilled');
    expect(interceptors.handlers[id1]).toHaveProperty('synchronous', false);
    expect(interceptors.handlers[id2]).toHaveProperty('synchronous', false);
    expect(interceptors.handlers[id3]).toHaveProperty('synchronous', false);
  });

  test('interceptors should eject one interceptor', () => {
    const interceptors = new Interceptors<any>();
    const id1 = interceptors.use(data => data);
    const id2 = interceptors.use(data => data);
    const id3 = interceptors.use(data => data);
    
    expect(id1).toBe(0);
    expect(id2).toBe(1);
    expect(id3).toBe(2);
    expect(interceptors.handlers.length).toBe(3);
    expect(interceptors.handlers[id1]).toHaveProperty('index', 0);
    expect(interceptors.handlers[id2]).toHaveProperty('index', 1);
    expect(interceptors.handlers[id3]).toHaveProperty('index', 2);
    expect(interceptors.handlers[id1]).toHaveProperty('rejected');
    expect(interceptors.handlers[id2]).toHaveProperty('rejected');
    expect(interceptors.handlers[id3]).toHaveProperty('rejected');
    expect(interceptors.handlers[id1]).toHaveProperty('fulfilled');
    expect(interceptors.handlers[id2]).toHaveProperty('fulfilled');
    expect(interceptors.handlers[id3]).toHaveProperty('fulfilled');
    expect(interceptors.handlers[id1]).toHaveProperty('synchronous', false);
    expect(interceptors.handlers[id2]).toHaveProperty('synchronous', false);
    expect(interceptors.handlers[id3]).toHaveProperty('synchronous', false);

    interceptors.eject(id2);
    expect(interceptors.handlers.length).toBe(2);
  });

  test('interceptors should clear all interceptors', () => {
    const interceptors = new Interceptors<any>();
    const id1 = interceptors.use(data => data);
    const id2 = interceptors.use(data => data);
    const id3 = interceptors.use(data => data);
    
    expect(id1).toBe(0);
    expect(id2).toBe(1);
    expect(id3).toBe(2);
    expect(interceptors.handlers.length).toBe(3);
    expect(interceptors.handlers[id1]).toHaveProperty('index', 0);
    expect(interceptors.handlers[id2]).toHaveProperty('index', 1);
    expect(interceptors.handlers[id3]).toHaveProperty('index', 2);
    expect(interceptors.handlers[id1]).toHaveProperty('rejected');
    expect(interceptors.handlers[id2]).toHaveProperty('rejected');
    expect(interceptors.handlers[id3]).toHaveProperty('rejected');
    expect(interceptors.handlers[id1]).toHaveProperty('fulfilled');
    expect(interceptors.handlers[id2]).toHaveProperty('fulfilled');
    expect(interceptors.handlers[id3]).toHaveProperty('fulfilled');
    expect(interceptors.handlers[id1]).toHaveProperty('synchronous', false);
    expect(interceptors.handlers[id2]).toHaveProperty('synchronous', false);
    expect(interceptors.handlers[id3]).toHaveProperty('synchronous', false);

    interceptors.clear();
    expect(interceptors.handlers.length).toBe(0);
  });
});
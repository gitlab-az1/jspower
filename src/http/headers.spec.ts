import Headers from './headers';


describe('http/headers', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('Headers class should be instantiable', () => {
    expect(new Headers()).toBeInstanceOf(Headers);
  });

  test('Headers class should have a set method', () => {
    expect(new Headers().set).toBeInstanceOf(Function);
  });

  test('Headers class should have a get method', () => {
    expect(new Headers().get).toBeInstanceOf(Function);
  });

  test('Headers class should be initialized with static method `from` with an iterable', () => {
    expect(Headers.from).toBeInstanceOf(Function);
    expect(Headers.from([])).toBeInstanceOf(Headers);
  });

  test('Headers class should be initialized with static method `from` with an iterable and headers shoud be setted', () => {
    const iterableHeaders: [string, string][] = [
      ['Content-Type', 'application/json'],
      ['Content-Length', '1024'],
    ];

    const headers = Headers.from(iterableHeaders);

    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('Content-Length')).toBe('1024');
  });
});
import { Exception } from './exception';


describe('/errors Exception', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('it should create an exception', () => {
    const exception = new Exception('message');
    expect(exception).toBeDefined();
    expect(exception.message).toBe('message');
  });

  test('it should create an exception with custom message and data', () => {
    const exception = new Exception('message', { data: 'data' });
    expect(exception).toBeDefined();
    expect(exception.message).toBe('message');
    expect(exception.data).toBe('data');
  });

  test('it should capture the stack trace', () => {
    const exception = new Exception('message');
    expect(exception).toBeDefined();
    expect(exception.stack).toBeDefined();
    expect(exception.stack).toContain('Exception');
    expect(exception.stack).toContain('exception.spec.ts');
    expect(exception.stack).toContain('src/errors/exception.spec.ts');
  });
});
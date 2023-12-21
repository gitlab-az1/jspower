import {
  jsonSafeParser,
  jsonSafeStringify,
} from './safe-json';


describe('safe-json', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should stringify and parse', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const str = jsonSafeStringify(obj);
    const parsed = jsonSafeParser(str!);
    expect(parsed).toEqual(obj);
  });

  test('should not stringify a circular object', () => {
    const obj: any = { a: 1, b: 2, c: 3 };
    obj.c = obj;

    const str = jsonSafeStringify(obj);
    expect(jsonSafeParser<any>(str!)?.c).toBe('[Circular *1]');
  });

  test('should stringify a instance of some class', () => {
    class Test {
      #x = 1 as const;
      z() {
        return this.#x;
      }
    }

    const obj = new Test();
    const str = jsonSafeStringify({obj});
    
    expect(jsonSafeParser<any>(str!)?.obj).toBe('<InstanceRef *1> (Test)');
  });
});
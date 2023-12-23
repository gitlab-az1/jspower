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
    if(!str) return expect(str).not.toBe(null);

    const parsed = jsonSafeParser(str);
    if(parsed.isLeft()) return expect(parsed.isLeft()).toBe(false);

    expect(parsed.value).toEqual(obj);
  });

  test('should not stringify a circular object', () => {
    const obj: any = { a: 1, b: 2, c: 3 };
    obj.c = obj;

    const str = jsonSafeStringify(obj);
    if(!str) return expect(str).not.toBe(null);

    const parsed = jsonSafeParser<{ a: number; b: number; c: number | object }>(str);
    if(parsed.isLeft()) return expect(parsed.isLeft()).toBe(false);

    expect(parsed.value.c).toBe('[Circular *1]');
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

    if(!str) return expect(str).not.toBe(null);

    const parsed = jsonSafeParser<{obj: Test}>(str);

    if(parsed.isLeft()) return expect(parsed.isLeft()).toBe(false);
    
    expect(parsed.value.obj).toBe('<InstanceRef *1> (Test)');
  });

  test('should stringify a instance of some class with Symbol.toStringTag', () => {
    class Test {
      #x = 1 as const;
      z() {
        return this.#x;
      }
      [Symbol.toStringTag] = 'Test';
    }

    const obj = new Test();
    const str = jsonSafeStringify({obj});
    if(!str) return expect(str).not.toBe(null);

    const parsed = jsonSafeParser<{obj: Test}>(str);
    if(parsed.isLeft()) return expect(parsed.isLeft()).toBe(false);
    
    expect(parsed.value.obj).toBe('Test');
  });

  test('should stringify a instance of some class with Symbol.toStringTag as function', () => {
    class Test {
      #x = 1 as const;
      z() {
        return this.#x;
      }
      [Symbol.toStringTag] = () => 'Test';
    }

    const obj = new Test();
    const str = jsonSafeStringify({obj});
    if(!str) return expect(str).not.toBe(null);

    const parsed = jsonSafeParser<{obj: Test}>(str);
    if(parsed.isLeft()) return expect(parsed.isLeft()).toBe(false);
    
    expect(parsed.value.obj).toBe('Test');
  });

  test('should stringify a plain object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const str = jsonSafeStringify({obj});
    if(!str) return expect(str).not.toBe(null);
    
    const parsed = jsonSafeParser<{obj: Record<string, number>}>(str);
    if(parsed.isLeft()) return expect(parsed.isLeft()).toBe(false);
        
    expect(parsed.value.obj).toEqual(obj);
  });
});
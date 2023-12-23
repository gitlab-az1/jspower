import * as object from './object';

describe('utils/object', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should return an array of a given object\'s own enumerable property names', () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    } as const;

    expect(object.objectKeys(obj)).toEqual(['a', 'b', 'c']);
  });

  test('should convert an enum to an object', () => {
    enum TestEnum {
      a = 'a',
      b = 'b',
      c = 'c',
    }

    expect(object.enumToObject(TestEnum)).toEqual({
      a: 'a',
      b: 'b',
      c: 'c',
    });
  });
});
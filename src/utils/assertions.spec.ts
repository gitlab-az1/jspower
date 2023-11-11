import {
  assertArray,
  assertBoolean,
  assertDate,
  assertDict,
  assertFloat,
  assertFunction,
  assertInteger,
  assertNumber,
  assertObject,
  assertString,
  assertJSON,
} from './assertions';


describe('utils/assertions', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('it should assert strings', () => {
    expect(() => assertString('')).not.toThrow();
    expect(() => assertString('foo')).not.toThrow();
    expect(() => assertString(123)).toThrow();
    expect(() => assertString(true)).toThrow();
    expect(() => assertString({})).toThrow();
    expect(() => assertString([])).toThrow();
    expect(() => assertString(() => {})).toThrow();
  });

  test('it should assert numbers', () => {
    expect(() => assertNumber(0)).not.toThrow();
    expect(() => assertNumber(123)).not.toThrow();
    expect(() => assertNumber(1.23)).not.toThrow();
    expect(() => assertNumber('foo')).toThrow();
    expect(() => assertNumber(true)).toThrow();
    expect(() => assertNumber({})).toThrow();
    expect(() => assertNumber([])).toThrow();
    expect(() => assertNumber(() => {})).toThrow();
  });

  test('it should assert integers', () => {
    expect(() => assertInteger(0)).not.toThrow();
    expect(() => assertInteger(123)).not.toThrow();
    expect(() => assertInteger(1.23)).toThrow();
    expect(() => assertInteger('foo')).toThrow();
    expect(() => assertInteger(true)).toThrow();
    expect(() => assertInteger({})).toThrow();
    expect(() => assertInteger([])).toThrow();
    expect(() => assertInteger(() => {})).toThrow();
  });

  test('it should assert floats', () => {
    expect(() => assertFloat(0)).toThrow();
    expect(() => assertFloat(0.0)).toThrow();
    expect(() => assertFloat(123)).toThrow();
    expect(() => assertFloat(1.23)).not.toThrow();
    expect(() => assertFloat('foo')).toThrow();
    expect(() => assertFloat(true)).toThrow();
    expect(() => assertFloat({})).toThrow();
    expect(() => assertFloat([])).toThrow();
    expect(() => assertFloat(() => {})).toThrow();
  });

  test('it should assert objects', () => {
    expect(() => assertObject({})).not.toThrow();
    expect(() => assertObject({ foo: 'bar' })).not.toThrow();
    expect(() => assertObject([])).toThrow();
    expect(() => assertObject(123)).toThrow();
    expect(() => assertObject('foo')).toThrow();
    expect(() => assertObject(true)).toThrow();
    expect(() => assertObject(() => {})).toThrow();
  });

  test('it should assert dictionaries', () => {
    expect(() => assertDict({})).not.toThrow();
    expect(() => assertDict({ foo: 'bar' })).not.toThrow();
    // expect(() => assertDict({ [0xF]: 'bar' })).toThrow();
    expect(() => assertDict([])).toThrow();
    expect(() => assertDict(123)).toThrow();
    expect(() => assertDict('foo')).toThrow();
    expect(() => assertDict(true)).toThrow();
    expect(() => assertDict(() => {})).toThrow();
  });

  test('it should assert arrays', () => {
    expect(() => assertArray([])).not.toThrow();
    expect(() => assertArray([1, 2, 3])).not.toThrow();
    expect(() => assertArray({})).toThrow();
    expect(() => assertArray(123)).toThrow();
    expect(() => assertArray('foo')).toThrow();
    expect(() => assertArray(true)).toThrow();
    expect(() => assertArray(() => {})).toThrow();
  });

  test('it should assert functions', () => {
    expect(() => assertFunction(() => {})).not.toThrow();
    expect(() => assertFunction(function() {})).not.toThrow();
    expect(() => assertFunction(() => 123)).not.toThrow();
    expect(() => assertFunction({})).toThrow();
    expect(() => assertFunction(123)).toThrow();
    expect(() => assertFunction('foo')).toThrow();
    expect(() => assertFunction(true)).toThrow();
    expect(() => assertFunction([])).toThrow();
  });

  test('it should assert booleans', () => {
    expect(() => assertBoolean(true)).not.toThrow();
    expect(() => assertBoolean(false)).not.toThrow();
    expect(() => assertBoolean(123)).toThrow();
    expect(() => assertBoolean('foo')).toThrow();
    expect(() => assertBoolean({})).toThrow();
    expect(() => assertBoolean([])).toThrow();
    expect(() => assertBoolean(() => {})).toThrow();
  });

  test('it should assert dates', () => {
    expect(() => assertDate(new Date())).not.toThrow();
    expect(() => assertDate(new Date('foo'))).not.toThrow();
    expect(() => assertDate(123)).toThrow();
    expect(() => assertDate('foo')).toThrow();
    expect(() => assertDate({})).toThrow();
    expect(() => assertDate([])).toThrow();
    expect(() => assertDate(() => {})).toThrow();
  });

  test('it should assert JSON', () => {
    expect(() => assertJSON('{}')).not.toThrow();
    expect(() => assertJSON('{"foo":"bar"}')).not.toThrow();
    expect(() => assertJSON(123)).toThrow();
    expect(() => assertJSON('foo')).toThrow();
    expect(() => assertJSON({})).toThrow();
    expect(() => assertJSON([])).toThrow();
    expect(() => assertJSON(() => {})).toThrow();
  });
});
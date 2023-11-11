import ReadableStream from 'node:stream';

import {
  isArray,
  isArrayBufferView,
  isBlob,
  isBoolean,
  isBuffer,
  isDate,
  isFile,
  isFileList,
  isFormData,
  isFunction,
  isNumber,
  isObject,
  isPlainObject,
  isStream,
  isString,
  isURLSearchParams,
  isUndefined,
  kindOfTest,
  typeofTest,
} from './is';


describe('utils/is', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('it should test typeof', () => {
    expect(typeofTest('string')('')).toBe(true);
    expect(typeofTest('string')('foo')).toBe(true);
    expect(typeofTest('string')(123)).toBe(false);
    expect(typeofTest('string')(true)).toBe(false);
    expect(typeofTest('string')({})).toBe(false);
    expect(typeofTest('string')([])).toBe(false);
    expect(typeofTest('string')(() => {})).toBe(false);
  });

  test('it should test kindof', () => {
    expect(kindOfTest('Date')(new Date())).toBe(true);
    expect(kindOfTest('Date')('foo')).toBe(false);
    expect(kindOfTest('Date')(123)).toBe(false);
    expect(kindOfTest('Date')(true)).toBe(false);
    expect(kindOfTest('Date')({})).toBe(false);
    expect(kindOfTest('Date')([])).toBe(false);
    expect(kindOfTest('Date')(() => {})).toBe(false);
  });

  test('it should test isString', () => {
    expect(isString('')).toBe(true);
    expect(isString('foo')).toBe(true);
    expect(isString(123)).toBe(false);
    expect(isString(true)).toBe(false);
    expect(isString({})).toBe(false);
    expect(isString([])).toBe(false);
    expect(isString(() => {})).toBe(false);
  });

  test('it should test isFunction', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction('')).toBe(false);
    expect(isFunction('foo')).toBe(false);
    expect(isFunction(123)).toBe(false);
    expect(isFunction(true)).toBe(false);
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
  });

  test('it should test isNumber', () => {
    expect(isNumber(0)).toBe(true);
    expect(isNumber(123)).toBe(true);
    expect(isNumber(1.23)).toBe(true);
    expect(isNumber('foo')).toBe(false);
    expect(isNumber(true)).toBe(false);
    expect(isNumber({})).toBe(false);
    expect(isNumber([])).toBe(false);
    expect(isNumber(() => {})).toBe(false);
  });

  test('it should test isObject', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ foo: 'bar' })).toBe(true);
    expect(isObject([])).toBe(true);
    expect(isObject(123)).toBe(false);
    expect(isObject('foo')).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(() => {})).toBe(false);
  });

  test('it should test isBoolean', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(123)).toBe(false);
    expect(isBoolean('foo')).toBe(false);
    expect(isBoolean({})).toBe(false);
    expect(isBoolean([])).toBe(false);
    expect(isBoolean(() => {})).toBe(false);
  });

  test('it should test isDate', () => {
    expect(isDate(new Date())).toBe(true);
    expect(isDate('foo')).toBe(false);
    expect(isDate(123)).toBe(false);
    expect(isDate(true)).toBe(false);
    expect(isDate({})).toBe(false);
    expect(isDate([])).toBe(false);
    expect(isDate(() => {})).toBe(false);
  });

  test('it should test isPlainObject', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ foo: 'bar' })).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(123)).toBe(false);
    expect(isPlainObject('foo')).toBe(false);
    expect(isPlainObject(true)).toBe(false);
    expect(isPlainObject(() => {})).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
  });

  test('it should test isBuffer', () => {
    expect(isBuffer(Buffer.from('foo'))).toBe(true);
    expect(isBuffer('foo')).toBe(false);
    expect(isBuffer(123)).toBe(false);
    expect(isBuffer(true)).toBe(false);
    expect(isBuffer({})).toBe(false);
    expect(isBuffer([])).toBe(false);
    expect(isBuffer(() => {})).toBe(false);
    expect(isBuffer(new Uint8Array())).toBe(false);
  });

  test('it should test isStream', () => {
    expect(isStream({})).toBe(false);
    expect(isStream([])).toBe(false);
    expect(isStream(() => {})).toBe(false);
    expect(isStream(new ReadableStream())).toBe(true);
  });

  test('it should test isFile', () => {
    expect(isFile({})).toBe(false);
    expect(isFile([])).toBe(false);
    expect(isFile(() => {})).toBe(false);
  });

  test('it should test isBlob', () => {
    expect(isBlob({})).toBe(false);
    expect(isBlob([])).toBe(false);
    expect(isBlob(() => {})).toBe(false);
    expect(isBlob(new Blob())).toBe(true);
  });

  test('it should test isFileList', () => {
    expect(isFileList({})).toBe(false);
    expect(isFileList([])).toBe(false);
    expect(isFileList(() => {})).toBe(false);
  });

  test('it should test isFormData', () => {
    expect(isFormData({})).toBe(false);
    expect(isFormData([])).toBe(false);
    expect(isFormData(() => {})).toBe(false);
  });

  test('it should test isURLSearchParams', () => {
    expect(isURLSearchParams({})).toBe(false);
    expect(isURLSearchParams([])).toBe(false);
    expect(isURLSearchParams(() => {})).toBe(false);
    expect(isURLSearchParams(new URLSearchParams())).toBe(true);
  });

  test('it should test isArray', () => {
    expect(isArray({})).toBe(false);
    expect(isArray([])).toBe(true);
    expect(isArray(() => {})).toBe(false);
  });

  test('it should test isArrayBufferView', () => {
    expect(isArrayBufferView({})).toBe(false);
    expect(isArrayBufferView([])).toBe(false);
    expect(isArrayBufferView(() => {})).toBe(false);
    expect(isArrayBufferView(new Uint8Array())).toBe(true);
  });

  test('it should test isUndefined', () => {
    expect(isUndefined({})).toBe(false);
    expect(isUndefined([])).toBe(false);
    expect(isUndefined(() => {})).toBe(false);
    expect(isUndefined(undefined)).toBe(true);
  });
});
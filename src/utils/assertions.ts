import { isIterableIterator } from '../iterator';
import type { GenericFunction } from '../types';
import { is } from './index';


export function assertString(value: unknown): asserts value is string {
  if(!is.isString(value)) {
    throw new TypeError(`Expected string, got ${typeof value}`);
  }
}


export function assertNumber(value: unknown): asserts value is number {
  if(!is.isNumber(value)) {
    throw new TypeError(`Expected number, got ${typeof value}`);
  }
}


export function assertInteger(value: unknown): asserts value is number {
  if(!is.isNumber(value) || !Number.isInteger(value)) {
    throw new TypeError(`Expected integer, got ${typeof value}`);
  }
}


export function assertFloat(value: unknown): asserts value is number {
  if(!is.isNumber(value) || Number.isInteger(value)) {
    throw new TypeError(`Expected float, got ${typeof value}`);
  }
}


export function assertObject(value: unknown): asserts value is object {
  if(!is.isObject(value)) {
    throw new TypeError(`Expected object, got ${typeof value}`);
  }

  if(Array.isArray(value)) {
    throw new TypeError('Expected object, got array');
  }
}

export function assertDict(value: unknown): asserts value is { [key: string]: any } {
  if(value == null || value == undefined) {
    throw new TypeError('Expected object, got null');
  }

  assertObject(value);

  for(const prop of Object.keys(value)) {
    if(typeof prop !== 'string') {
      throw new TypeError('Expected object, got non-string key');
    }
  }
}


export function assertArray(value: unknown): asserts value is any[] {
  if(!is.isArray(value)) {
    throw new TypeError(`Expected array, got ${typeof value}`);
  }
}


export function assertFunction(value: unknown): asserts value is GenericFunction {
  if(!is.isFunction(value)) {
    throw new TypeError(`Expected function, got ${typeof value}`);
  }
}


export function assertBoolean(value: unknown): asserts value is boolean {
  if(!is.isBoolean(value)) {
    throw new TypeError(`Expected boolean, got ${typeof value}`);
  }
}


export function assertDate(value: unknown): asserts value is Date {
  if(!is.isDate(value)) {
    throw new TypeError(`Expected date, got ${typeof value}`);
  }
}

export function assertJSON(value: unknown): asserts value is string {
  assertString(value);

  try {
    JSON.parse(value);
  } catch {
    throw new TypeError(`Expected JSON string, got ${typeof value}`);
  }
}


export function assertIterableIterator<T>(value: unknown): asserts value is IterableIterator<T> {
  if(!isIterableIterator(value)) {
    throw new TypeError(`Expected iterable iterator, got ${typeof value}`);
  }
}
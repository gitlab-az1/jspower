import { isString } from './is';

export function assertString(value: unknown): asserts value is string {
  if(!isString(value)) {
    throw new TypeError(`Expected string, got ${typeof value}`);
  }
}

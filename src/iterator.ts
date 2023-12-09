export function isIterableIterator<T>(value: any): value is IterableIterator<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value[Symbol.iterator] === 'function' &&
    typeof value.next === 'function'
  );
}


/*
export class RangeIterator {
  private _start: number;
  private _end: number;
  private _current: number;

  constructor(start: number, end: number) {
    this._start = start;
    this._end = end;
    this._current = start;
  }

  public [Symbol.iterator](): Iterator<number> {
    return {
      next: () => {
        if(this._current <= this._end) return { value: this._current++, done: false };
        return { done: true };
      },
    } as any;
  }
}
*/
export type GenericFunction<R = unknown, P = any> = ((...args: P[]) => R);


export type DataType =
  | 'bigint'
  | 'boolean'
  | 'function'
  | 'number'
  | 'object'
  | 'string'
  | 'symbol'
  | 'undefined';


export type Writable<T> = {
  -readonly [K in keyof T]: T[K];
}

export type Dict<T> = {
  [key: string]: T;
}

export type ReadonlyDict<T> = {
  readonly [key: string]: T;
}

export type Required<T> = {
  [K in keyof T]-?: T[K];
}


export type ErrorLocation = {
  file: string;
  line: number;
  callable_expression: string;
  type: 'synchronous' | 'asynchronous';
  fn: {
    return_type: string;
    params: string[];
  };
}

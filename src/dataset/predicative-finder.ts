import type { Dict } from '../types';
import { Exception } from '../errors';


/**
 * Predicate function
 */
export type Predicate<T> = ((data: T) => boolean);

/**
 * Reducer function
 */
export type Reducer<T> = (<R>(accumulator: R, data: T) => R);


export interface PredicativeFinderOptions {

  /**
   * Limit the length of the input data
   */
  inputLimit?: number;

  /**
   * Limit the length of the output data
   */
  outputLimit?: number;

  /**
   * Offset of the input data
   */
  outputOffset?: number;
}

type IDatasetLoc<T> = [string | number, T][] | Dict<T> | T[] | T;


export class PredicativeFinder<DataT> {
  readonly #predicate: Predicate<DataT>;
  readonly #reducer?: Reducer<DataT>;
  #props: PredicativeFinderOptions;

  constructor(
    predicate: Predicate<DataT>,
    reducer?: Reducer<DataT> | PredicativeFinderOptions,
    options?: PredicativeFinderOptions // eslint-disable-line comma-dangle
  ) {
    if(typeof predicate !== 'function') {
      throw new Exception('Predicate must be a function');
    }

    this.#predicate = predicate;
    options ??= {};

    if(typeof reducer === 'object') {
      options = reducer;
    }

    this.#props = options;

    if(reducer && typeof reducer === 'function') {
      this.#reducer = reducer;
    }
  }

  public bind(dataset: IDatasetLoc<DataT>): void {
    //
  }
}

export default PredicativeFinder;
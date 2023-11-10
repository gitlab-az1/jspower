export type PairValidator<F, S> = ((first: F, second: S) => boolean | Promise<boolean>);


export class Pair<F = unknown, S = unknown> {
  #first: F;
  #second: S;
  #validator: PairValidator<F, S>;

  constructor(first: F, second: S, validator?: PairValidator<F, S>) {
    this.#first = first;
    this.#second = second;

    this.#validator = validator && typeof validator === 'function' ?
      validator :
      () => true;
  }

  public get first(): F {
    if(!this.#validator(this.#first, this.#second)) {
      throw new Error('Pair is not valid');
    }

    return this.#first;
  }

  public get second(): S {
    if(!this.#validator(this.#first, this.#second)) {
      throw new Error('Pair is not valid');
    }

    return this.#second;
  }

  public setFirst(value: F): Pair<F, S> {
    if(!this.#validator(value, this.#second)) {
      throw new Error('Pair is not valid');
    }

    this.#first = value;
    return this;
  }

  public setSecond(value: S): Pair<F, S> {
    if(!this.#validator(this.#first, value)) {
      throw new Error('Pair is not valid');
    }

    this.#second = value;
    return this;
  }

  public set validator(value: PairValidator<F, S>) {
    if(typeof value !== 'function') {
      throw new Error('Validator must be a function');
    }

    this.#validator = value;
  }
}

export default Pair;
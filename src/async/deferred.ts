export class Deferred<T, E = unknown> {
  readonly #successHandlers: ((value: T | PromiseLike<T>) => void)[] = [];
  readonly #rejectedHandlers: ((reason?: E) => void)[] = [];
  readonly #finallyHandlers: (() => void)[] = [];

  public resolve: ((value: T | PromiseLike<T>) => void) = () => void 0;
  public reject: ((reason?: E) => void) = () => void 0;
  public readonly promise: Promise<T>;

  constructor() {
    this.promise = new Promise((resolve, reject) => [this.resolve, this.reject] = [resolve, reject]);
  }

  public onfulfilled(handler: (value: T | PromiseLike<T>) => void) {
    if(typeof handler !== 'function') return;
    this.#successHandlers.push(handler);
  }

  public onrejected(handler: (reason?: E) => void) {
    if(typeof handler !== 'function') return;
    this.#rejectedHandlers.push(handler);
  }

  public onfinally(handler: () => void) {
    if(typeof handler !== 'function') return;
    this.#finallyHandlers.push(handler);
  }

  public then(onfulfilled?: ((value: T | PromiseLike<T>) => void) | null, onrejected?: ((reason?: E) => void) | null): Promise<T> {
    this.#successHandlers.push(onfulfilled ?? (() => void 0));
    this.#rejectedHandlers.push(onrejected ?? (() => void 0));

    return this.promise.then(
      async (__value_t) => {
        return await Promise.all(
          this.#successHandlers.map(async handler => {
            try {
              const res = await handler(__value_t);
              return res;
            } catch (err) {
              return err;
            }
          }) // eslint-disable-line comma-dangle
        );
      },
      async () => {
        return await Promise.all(
          this.#rejectedHandlers.map(async handler => {
            try {
              const res = await handler();
              return res;
            } catch (err) {
              return err;
            }
          }) // eslint-disable-line comma-dangle
        );
      } // eslint-disable-line comma-dangle
    ) as unknown as Promise<T>;
  }

  public catch(onrejected?: ((reason?: E) => void) | null): Promise<T> {
    this.#rejectedHandlers.push(onrejected ?? (() => void 0));

    return this.promise.catch(async () => {
      return await Promise.all(
        this.#rejectedHandlers.map(async handler => {
          try {
            const res = await handler();
            return res;
          } catch (err) {
            return err;
          }
        }) // eslint-disable-line comma-dangle
      );
    }) as unknown as Promise<T>;
  }

  public finally(onfinally?: (() => void) | null): Promise<T> {
    this.#finallyHandlers.push(onfinally ?? (() => void 0));
    
    this.promise.finally(async () => {
      return await Promise.all(
        this.#finallyHandlers.map(async handler => {
          try {
            const res = await handler();
            return res;
          } catch (err) {
            return err;
          }
        }) // eslint-disable-line comma-dangle
      );
    });
    return this.promise;
  }
}

export default Deferred;
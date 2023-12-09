import type { RequestHandler } from './_types';
import Stack, { Order as StackOrder } from '../../stack';


/**
 * Middleware manager for Next.js applications.
 */
export class Middlewares {
  readonly #stack: Stack<RequestHandler>;

  /**
   * Creates a new instance of the Middlewares class.
   * Initializes the internal stack with the specified order.
   */
  constructor() {
    this.#stack = new Stack<RequestHandler>({ order: StackOrder.FIFO });
  }

  /**
   * Adds one or more middleware handlers to the end of the stack.
   * @param handlers - Middleware handler functions to be added.
   */
  public use(...handlers: RequestHandler[]): void {
    for(const handle of handlers) {
      if(typeof handle !== 'function') continue;
      this.#stack.push(handle);
    }
  }

  /**
   * Returns a composed middleware function that executes all middleware handlers in the stack.
   * @returns Composed middleware function.
   */
  public process(): RequestHandler {
    return async (request, response) => {
      for(const [, handle] of this.#stack.enumerate()) {
        await handle(request, response);
      }
    };
  }

  /**
   * Gets the number of middleware handlers in the stack.
   * @returns The number of middleware handlers.
   */
  public get length(): number {
    return this.#stack.size();
  }

  /**
   * Clears all middleware handlers from the stack.
   */
  public empty(): void {
    this.#stack.clear();
  }
}
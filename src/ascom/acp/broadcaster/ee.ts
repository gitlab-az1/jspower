import { Stack } from '../../../stack';
import { Crypto, Hash } from '../../../crypto';
import type { Dict, GenericFunction } from '../../../types';
import { Enumerable, enumerateIterableIterator } from '../../../enumerator';
import { Broadcaster, EmitResponse, IBroadcastChannel, Listener } from '../_abstract';


/**
 * Definition of the EventEmitter serialized context
 */
export type EventEmitterSerializedContext = {
  readonly channel: string | object;
  readonly listener: {
    readonly callbackSignature: string;
    readonly type: 'once' | 'on';
    readonly listenerId: string;
    readonly callbackFn: string;
    readonly createdAt: number;
    readonly calls: number;
  };
}

export type EventEmitterSubscribeOptions = {
  once?: boolean;
}

export class EventEmitter<EMap extends Dict<GenericFunction<any>> = Dict<GenericFunction<any>>> implements Broadcaster {
  readonly #listeners: Stack<[string | IBroadcastChannel, Listener<GenericFunction<any>>]> = new Stack<[string | IBroadcastChannel, Listener<GenericFunction<any>>]>({ order: 'fifo' });
  readonly #eventsMap: Map<string, GenericFunction[]> = new Map<string, GenericFunction[]>();

  /**
   * Subscribe to a channel and register a callback.
   * 
   * @param channel - The channel to subscribe to.
   * @param callback - The callback function to be invoked when the event is emitted.
   * @returns A promise that resolves to a listener object with an unsubscribe method.
   */
  public subscribe<K extends keyof EMap, C extends GenericFunction<any>>(channel: K | Omit<string, K> | IBroadcastChannel, callback: C, options?: EventEmitterSubscribeOptions): Promise<Listener<C>> {
    const eventKey = typeof channel === 'string' ? channel : (channel as IBroadcastChannel)._key;

    if(!this.#eventsMap.has(eventKey)) {
      this.#eventsMap.set(eventKey, []);
    }

    const listeners = this.#eventsMap.get(eventKey) ?? [];
    listeners?.push(callback);

    // this.#map.set(event, listeners);

    const unsubscribe = () => {
      const index = listeners.indexOf(callback);

      if(index > -1) {
        listeners.splice(index, 1);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const contextIndex = this.#listeners.findIndex(([_, listener]) => listener.callbackSignature === Hash.sha256(callback.toString()));
      
      if(contextIndex > -1) {
        this.#listeners.deleteByIndex(contextIndex);
      }
    };

    const callbackSignature = Hash.sha256(callback.toString());

    const listenerObject = {
      calls: 0,
      callback,
      unsubscribe,
      callbackSignature,
      createdAt: Date.now(),
      listenerId: Crypto.uuid().replace(/-/g, ''),
      type: options?.once === true ? 'once' : 'on',
      channel: channel as string | IBroadcastChannel,
    } satisfies Listener<C>;

    this.#listeners.push([channel as string | IBroadcastChannel, listenerObject]);
    return Promise.resolve<Listener<C>>(listenerObject);
  }

  /**
   * Emit an event on a channel with provided data.
   * 
   * @param channel - The channel to emit the event on.
   * @param args - Data to be passed to the event listeners.
   * @returns A promise that resolves to an array of EmitResponse objects.
   */
  public emit<TResult = any, K extends keyof EMap = '', TData = any>(channel: K | Omit<string, K> | IBroadcastChannel, ...args: TData[]): Promise<(EmitResponse<TResult> | null)[]> {
    const eventKey = typeof channel === 'string' ? channel : (channel as IBroadcastChannel)._key;

    if(!this.#eventsMap.has(eventKey)) return Promise.resolve([]);

    const results = this.#eventsMap.get(eventKey)?.map(callback => {
      const sign = Hash.sha256(callback.toString());

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const listenerIndex = this.#listeners.findIndex(([_, listener]) => listener.callbackSignature === sign);
      const listener = this.#listeners.getByIndex(listenerIndex);

      if(listener && listener[1].type === 'once' && listener[1].calls > 0) return (() => {
        listener[1].unsubscribe();
        return null;
      })();

      if(listenerIndex > -1) {
        this.#listeners.deleteByIndex(listenerIndex);

        this.#listeners.push([listener![0], {
          ...listener![1],
          calls: listener![1].calls + 1,
        }]);
      }
      
      const result = callback(...args) as unknown as TResult;
      if(!listener) return { result } as unknown as EmitResponse<TResult>;

      return {
        result,
        type: listener[1].type,
        calls: listener[1].calls + 1,
        channel: listener[1].channel,
        createdAt: listener[1].createdAt,
        listenerId: listener[1].listenerId,
        unsubscribe: listener[1].unsubscribe,
        callbackSignature: listener[1].callbackSignature,
      } satisfies EmitResponse<TResult>;
    });

    return Promise.resolve(results ?? []);
  }

  /**
   * Get an enumerated collection of listeners.
   */
  public get listeners(): Enumerable<[channel: string | IBroadcastChannel, listener: Listener<GenericFunction<any>>]> {
    return enumerateIterableIterator(this.#listeners.toArray());
  }

  /**
   * Serialize the current state of the EventEmitter.
   * 
   * @returns A JSON string representing the serialized context of listeners.
   */
  public serialize(): string {
    const arr = this.#listeners.toArray().map(([channel, listener]) => {
      return {
        channel: typeof channel === 'string' ? channel : channel.serialize(),
        listener: {
          callbackSignature: listener.callbackSignature,
          callbackFn: listener.callback.toString(),
          listenerId: listener.listenerId,
          createdAt: listener.createdAt,
          calls: listener.calls,
          type: listener.type,
        },
      } satisfies EventEmitterSerializedContext;
    });

    return JSON.stringify(arr);
  }

  /**
   * Iterator method for iterating over the serialized context.
   * 
   * @returns An iterable iterator for the serialized context.
   */
  public [Symbol.iterator](): IterableIterator<Enumerable<EventEmitterSerializedContext>[number]> {
    const arr = this.#listeners.toArray().map(([channel, listener]) => {
      return {
        channel: typeof channel === 'string' ? channel : channel.serialize(),
        listener: {
          callbackSignature: listener.callbackSignature,
          callbackFn: listener.callback.toString(),
          listenerId: listener.listenerId,
          createdAt: listener.createdAt,
          calls: listener.calls,
          type: listener.type,
        },
      } satisfies EventEmitterSerializedContext;
    });

    return enumerateIterableIterator(arr)[Symbol.iterator]();
  }

  /**
   * Symbol.toStringTag implementation for better object representation.
   * 
   * @returns A string representing the object's tag.
   */
  public [Symbol.toStringTag]() {
    return '[object EventEmitter]';
  }
}

export default EventEmitter;
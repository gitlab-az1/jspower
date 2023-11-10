import type { Dict } from '../types';


type EventEmitterCallback = ((...args: any[]) => any);

export interface EventEmitterSubscription {
  unsubscribe: (() => void);
}

export class EventEmitter {
  #map: Map<string, Array<EventEmitterCallback>>;

  constructor() {
    this.#map = new Map<string, Array<EventEmitterCallback>>();
  }

  public list(): Dict<EventEmitterCallback[]> {
    const result: { [key: string]: EventEmitterCallback[] } = {};

    this.#map.forEach((callbacks, event) => {
      result[event] = callbacks;
    });

    return result;
  }

  public enum(): [number, string, EventEmitterCallback[]][] {
    const result: [number, string, EventEmitterCallback[]][] = [];

    let i = 0;
    this.#map.forEach((callbacks, event) => {
      result.push([i++, event, callbacks]);
    });

    return result;
  }

  public subscribe(event: string, callback: EventEmitterCallback): EventEmitterSubscription {
    if(!this.#map.has(event)) {
      this.#map.set(event, []);
    }

    const listeners = this.#map.get(event) ?? [];
    listeners?.push(callback);

    // this.#map.set(event, listeners);

    return {
      unsubscribe: () => {
        const index = listeners.indexOf(callback);

        if (index > -1) {
          listeners.splice(index, 1);
        }
      },
    };
  }

  public emit(event: string, ...args: any[]) {
    if (!args) {
      args = [];
    }

    if (!this.#map.has(event)) return [];
    return this.#map.get(event)?.map(callback => callback(...args));
  }
}

export default EventEmitter;
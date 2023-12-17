import { Hash } from './crypto/hash';
import { EventEmitter, Event as BaseEvent, EventEmitterSubscription } from './events';


/* events */
interface ChangeEventParams<T> {
  readonly _state: State<T>;
  readonly previous: T;
  readonly current: T;
}

class ChangeEvent<T> extends BaseEvent<ChangeEventParams<T>> {
  constructor(params: ChangeEventParams<T>) {
    super('change', {
      target: params,
      cancelable: false,
    });
  }
}


interface StateEventsMap<T = unknown> {
  change: ChangeEvent<T>;
}

/* self */
type EventSubscription = {
  readonly signature: string;
  unsubscribe: () => void;
  readonly event: string;
  readonly id: number;
}
/* self */
/* events */


export class State<T> {
  #events: EventSubscription[];
  readonly #e: EventEmitter;
  #value: T;

  constructor(initialValue?: T) {
    if(initialValue) {
      this.#value = initialValue;
    }

    this.#e = new EventEmitter();
  }

  public set(value: T) {
    const previous = this.#value;

    this.#e.emit('change', new ChangeEvent(Object.freeze({
      previous,
      _state: this,
      current: value,
    })));

    this.#value = value;
  }

  public get(): T {
    return this.#value;
  }

  public addEventListener<K extends keyof StateEventsMap<T>>(event: K, listener: ((event: StateEventsMap<T>[K]) => void)): EventEmitterSubscription {
    const subscription = this.#e.subscribe(event, listener);
    const signature = Hash.sha256(listener.toString());
    const id = 1 + this.#events.length;

    this.#events.push({
      ...subscription,
      signature,
      event,
      id,
    });

    return subscription;
  }

  public removeEventListener<K extends keyof StateEventsMap<T>>(event: K, listener: ((event: StateEventsMap<T>[K]) => void)): void {
    const signature = Hash.sha256(listener.toString());
    const index = this.#events.findIndex(item => item.event === event && item.signature === signature);

    if(index < 0) return;
    this.#events[index].unsubscribe();
    this.#events.splice(index, 1);
  }

  public removeManyEventListeners<K extends keyof StateEventsMap<T>>(event: K): void {
    const events = this.#events.filter(item => item.event === event);
    events.forEach(item => item.unsubscribe());

    this.#events = this.#events.filter(item => item.event !== event);
  }

  public removeAllEventListeners(): void {
    for(const event of this.#events) {
      event.unsubscribe();
    }

    this.#events = [];
  }
}

export default State;
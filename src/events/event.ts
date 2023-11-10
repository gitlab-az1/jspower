export type EventOptions<T> = {
  target: T;
  cancelable?: boolean;
}

export class Event<T> {
  public readonly target: T;
  public readonly event: string;
  public readonly timestamp: number;
  public readonly cancelable: boolean;

  constructor(name: string, options: EventOptions<T>) {
    this.event = name;
    this.target = options.target;
    this.timestamp = new Date().getTime();
    
    this.cancelable = (typeof options.cancelable === 'boolean' ?
      options.cancelable :
      false);
  }
}
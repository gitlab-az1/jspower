import type { GenericFunction } from '../../types';
import { type Enumerable } from '../../enumerator';


export interface IBroadcastChannel {
  readonly _key: string;
  serialize(): object;
}

export interface Listener<TC extends ((...args: any) => any)> {
  callback: ((...args: Parameters<TC>) => ReturnType<TC> | Promise<ReturnType<TC>>);
  unsubscribe(): void;
  readonly channel: string | IBroadcastChannel;
  readonly callbackSignature: string;
  readonly type: 'once' | 'on';
  readonly listenerId: string;
  readonly createdAt: number;
  readonly calls: number;
}

export interface EmitResponse<T = any> extends Omit<Listener<GenericFunction>, 'callback'> {
  readonly result: T;
}

export interface ClientState {
  [key: string]: string | number | boolean | null;
  readonly status: 'connected' | 'disconnected' | 'error';
}

export interface HostConfig {}

export interface RestartPolicy {
  readonly policy: 'always' | 'on-failure' | 'never';
  readonly maximumRetryCount: number;
  readonly aliasName?: string;
  readonly attempts: number;
  readonly delay: number;
}

export interface SecurityOptions {}

export interface ClientNetwork {}

export interface Client {
  readonly type: 'local' | 'ws';
  readonly arguments: string[];
  readonly createdAt: Date;
  readonly state: ClientState;
  readonly id: string;
  readonly restartCount: number;
  readonly host: HostConfig;
  readonly restartPolicy: RestartPolicy;
  readonly security: SecurityOptions;
  readonly tty: boolean;
  readonly environment: string[];
  readonly network: ClientNetwork;
}


export interface Broadcaster {
  subscribe<Ch extends string, Cb extends ((...args: any[]) => any)>(channel: Ch | IBroadcastChannel, callback: Cb): Promise<Listener<Cb>>;
  emit<TResult = any, Ch extends string = '', TData = any>(channel: Ch | IBroadcastChannel, ...args: TData[]): Promise<(EmitResponse<TResult> | null)[]>;
  readonly listeners: Enumerable<[channel: string | IBroadcastChannel, listener: Listener<GenericFunction<any>>]>;
}
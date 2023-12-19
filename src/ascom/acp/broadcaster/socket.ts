import * as http from 'http';
import * as http2 from 'http2';
import clientio from 'socket.io-client';
import { Server as WebSocketServer } from 'socket.io';

import { Stack } from '../../../stack';
import { Crypto, Hash } from '../../../crypto';
import { isPlainObject } from '../../../utils/is';
import { WebSocketError } from '../../../errors/socket';
import type { Dict, GenericFunction } from '../../../types';
import { Enumerable, enumerateIterableIterator } from '../../../enumerator';
import { Broadcaster, EmitResponse, IBroadcastChannel, Listener } from '../_abstract';


export enum ExitCode {
  Normal = 1000,
  GoingAway = 1001,
  ProtocolError = 1002,
  UnsupportedData = 1003,
  NoStatusReceived = 1005,
  AbnormalClosure = 1006,
  InvalidFramePayloadData = 1007,
  PolicyViolation = 1008,
  MessageTooBig = 1009,
  MissingExtension = 1010,
  InternalError = 1011,
  ServiceRestart = 1012,
  TryAgainLater = 1013,
  BadGateway = 1014,
  TLSHandshake = 1015,
  InitializationFail = 1016,
  InvalidPortRange = 1017,
  HttpsRequired = 1018,
  HttpsTimeout = 1019,
  HttpsInvalidCert = 1020,
  HttpsInvalidCA = 1021,
  HttpTimeout = 1022,
}


export enum ReadyState {
  Uninitialized,
  Connecting,
  Open,
  Closing,
  Closed,
  Reconnecting,
  Error
}



/**
 * Definition of the EventEmitter serialized context
 */
export type WSSerializedContext = {
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

/**
 * Options for events subscriber 
 */
export type WSSubscribeOptions = {
  once?: boolean;
}


export interface WebsocketBroadcaster {
  readonly isRootNote: boolean;
}


export type WSSLOptions = {
  rejectUnauthorized?: boolean;
  cert?: string | Buffer | Array<string | Buffer>;
  ca?: string | Buffer | Array<string | Buffer>;
}

export type WebSocketBroadcasterInit = {
  port: number;
  secure?: boolean;
  ssl?: WSSLOptions;
  reconnect?: boolean;
  maximumRetryCount?: number;
  delay?: number;
}




export class WebSocketBroadcasterRootNode<EMap extends Dict<GenericFunction<any>> = Dict<GenericFunction<any>>> implements Broadcaster, WebsocketBroadcaster {
  #wss: WebSocketServer | null = null;
  readonly #o: WebSocketBroadcasterInit;
  #h: http.Server | http2.Http2SecureServer | null = null;
  readonly #listeners: Stack<[string | IBroadcastChannel, Listener<GenericFunction<any>>]> = new Stack<[string | IBroadcastChannel, Listener<GenericFunction<any>>]>({ order: 'fifo' });

  #rs: ReadyState = ReadyState.Uninitialized;

  constructor(options: WebSocketBroadcasterInit);
  constructor(port: number, options?: Omit<WebSocketBroadcasterInit, 'port'>);
  constructor(portOrOptions: number | WebSocketBroadcasterInit, options?: Omit<WebSocketBroadcasterInit, 'port'>) {
    let port: number = -1;

    if(typeof portOrOptions !== 'number' && isPlainObject(portOrOptions)) {
      options = portOrOptions;
      port = portOrOptions.port;
    } else if(typeof portOrOptions === 'string') {
      port = portOrOptions;
      options ??= {};
    } else {
      throw new WebSocketError('Invalid initialization parameters', `::${port}`, ExitCode.InitializationFail, { portOrOptions, options });
    }

    if(port < 100) {
      throw new WebSocketError('Invalid port number', `::${port}`, ExitCode.InvalidPortRange, { port });
    }

    if(port > 50000) {
      throw new WebSocketError('Invalid port number', `::${port}`, ExitCode.InvalidPortRange, { port });
    }

    this.#o = {
      ...options,
      port,
    };
  }

  public get isRootNote(): boolean {
    return true;
  }

  public createServer(): Promise<void> {
    this.#rs = ReadyState.Connecting;

    return Promise.race<void>([
      new Promise<void>((resolve, reject) => {
        if(this.#o?.secure === true) {
          this.#h = http2.createSecureServer({
            ca: this.#o?.ssl?.ca,
            cert: this.#o?.ssl?.cert,
            rejectUnauthorized: this.#o?.ssl?.rejectUnauthorized,
          });

          this.#h.listen(this.#o.port, () => {
            this.#wss = new WebSocketServer({
              cors: {
                origin: '*',
              },
            });

            this.#wss.listen(this.#h as http2.Http2SecureServer);
            this.#rs = ReadyState.Open;
            resolve();
          });

          this.#h.on('error', err => {
            this.#rs = ReadyState.Error;
            reject(new WebSocketError(err.message, `::${this.#o.port}`, ExitCode.InitializationFail, { localStack: err.stack ?? new Error().stack }));
          });
        } else {
          this.#h = http.createServer();

          this.#h.listen(this.#o.port, () => {
            this.#wss = new WebSocketServer({
              cors: {
                origin: '*',
              },
            });

            this.#wss.listen(this.#h as http.Server);
            this.#rs = ReadyState.Open;
            resolve();
          });

          this.#h.on('error', err => {
            this.#rs = ReadyState.Error;
            reject(new WebSocketError(err.message, `::${this.#o.port}`, ExitCode.InitializationFail, { localStack: err.stack ?? new Error().stack }));
          });
        }
      }),
      new Promise<void>((_, reject) => {
        setTimeout(() => {
          this.#wss?.close();
          this.#h?.close();
          
          this.#rs = ReadyState.Error;
          reject(new WebSocketError('Connection timeout', `::${this.#o.port}`, this.#o.secure === true ? ExitCode.HttpsTimeout : ExitCode.HttpTimeout));
        }, 5000);
      }),
    ]);
  }

  /**
   * Subscribe to a channel and register a callback.
   * 
   * @param channel - The channel to subscribe to.
   * @param callback - The callback function to be invoked when the event is emitted.
   * @returns A promise that resolves to a listener object with an unsubscribe method.
   */
  public subscribe<K extends keyof EMap, C extends GenericFunction<any>>(channel: K | Omit<string, K> | IBroadcastChannel, callback: C, options?: WSSubscribeOptions): Promise<Listener<C>> {
    if(this.#rs !== ReadyState.Open) {
      throw new WebSocketError('Socket connection is not open', `::${this.#o.port}`, ExitCode.InternalError);
    }

    const eventKey = typeof channel === 'string' ? channel : (channel as IBroadcastChannel)._key;
    const callbackSignature = Hash.sha256(callback.toString());

    const unsubscribe = () => {
      this.#wss!.removeListener(eventKey, callback);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const contextIndex = this.#listeners.findIndex(([_, listener]) => listener.callbackSignature === Hash.sha256(callback.toString()));
      
      if(contextIndex > -1) {
        this.#listeners.deleteByIndex(contextIndex);
      }
    };

    const listenerObject = {
      channel: channel as string | IBroadcastChannel,
      type: options?.once === true ? 'once' : 'on',
      listenerId: Crypto.uuid().replace(/-/g, ''),
      createdAt: Date.now(),
      callbackSignature,
      unsubscribe,
      callback,
      calls: 0,
    } satisfies Listener<C>;

    this.#wss![listenerObject.type](eventKey, callback);
    this.#listeners.push([channel as string | IBroadcastChannel, listenerObject]);

    return Promise.resolve(listenerObject);
  }

  /**
   * Emit an event on a channel with provided data.
   * 
   * @param channel - The channel to emit the event on.
   * @param args - Data to be passed to the event listeners.
   * @returns A promise that resolves to an array of EmitResponse objects.
   */
  public emit<TResult = true, K extends keyof EMap = '', TData = any>(channel: K | Omit<string, K> | IBroadcastChannel, ...args: TData[]): Promise<(EmitResponse<TResult> | null)[]> {
    if(this.#rs !== ReadyState.Open) {
      throw new WebSocketError('Socket connection is not open', `::${this.#o.port}`, ExitCode.InternalError);
    }

    const eventKey = typeof channel === 'string' ? channel : (channel as IBroadcastChannel)._key;
    const listeners = this.#listeners.findMany(item => {
      const ek = typeof item[0] === 'string' ? item[0] : item[0]._key;
      return ek === eventKey;
    });

    const success = this.#wss!.emit(eventKey, ...args);
    const results: EmitResponse<TResult>[] = [];

    for(const listener of listeners) {
      if(listener[1].type === 'once' && listener[1].calls > 0) {
        listener[1].unsubscribe();
        continue;
      } else {
        const idx = this.#listeners.findIndex(item => {
          return item[1].callbackSignature === listener[1].callbackSignature;
        });

        if(idx > -1) {
          this.#listeners.deleteByIndex(idx);
          this.#listeners.push([
            listener[0],
            {
              ...listener[1],
              calls: listener[1].calls + 1,
            },
          ]);
        }
      }

      results.push({
        callbackSignature: listener[1].callbackSignature,
        result: success as unknown as TResult,
        unsubscribe: listener[1].unsubscribe,
        listenerId: listener[1].listenerId,
        createdAt: listener[1].createdAt,
        channel: listener[1].channel,
        calls: listener[1].calls + 1,
        type: listener[1].type,
      });
    }

    if(!success) return Promise.reject();
    return Promise.resolve<EmitResponse<TResult>[]>(results);
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
      } satisfies WSSerializedContext;
    });

    return JSON.stringify(arr);
  }

  /**
   * Iterator method for iterating over the serialized context.
   * 
   * @returns An iterable iterator for the serialized context.
   */
  public [Symbol.iterator](): IterableIterator<Enumerable<WSSerializedContext>[number]> {
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
      } satisfies WSSerializedContext;
    });

    return enumerateIterableIterator(arr)[Symbol.iterator]();
  }

  /**
   * Symbol.toStringTag implementation for better object representation.
   * 
   * @returns A string representing the object's tag.
   */
  public [Symbol.toStringTag]() {
    return '[object WebSocketBroadcasterRootNode]';
  }
}


export class WebSocketBroadcasterClientNode<EMap extends Dict<GenericFunction<any>> = Dict<GenericFunction<any>>> implements Broadcaster, WebsocketBroadcaster {
  #socket: ReturnType<typeof clientio> | null = null;
  readonly #o: Omit<WebSocketBroadcasterInit, 'port'> & { url: string };
  readonly #listeners: Stack<[string | IBroadcastChannel, Listener<GenericFunction<any>>]> = new Stack<[string | IBroadcastChannel, Listener<GenericFunction<any>>]>({ order: 'fifo' });

  #rs: ReadyState = ReadyState.Uninitialized;

  constructor(url: string, options?: Omit<WebSocketBroadcasterInit, 'port'>);
  constructor(options: Omit<WebSocketBroadcasterInit, 'port'> & { url: string });
  constructor(urlOrOptions: string | (Omit<WebSocketBroadcasterInit, 'port'> & { url: string }), options?: Omit<WebSocketBroadcasterInit, 'port'>) {
    let url: string = '';

    if(typeof urlOrOptions !== 'string' && isPlainObject(urlOrOptions)) {
      options = urlOrOptions;
      url = urlOrOptions.url;
    } else if(typeof urlOrOptions === 'string') {
      url = urlOrOptions;
      options ??= {};
    } else {
      throw new WebSocketError('Invalid initialization parameters', url, ExitCode.InitializationFail, { urlOrOptions, options });
    }

    this.#o = {
      ...options,
      url,
    };
  }

  public get isRootNote(): boolean {
    return false;
  }

  public connect(): Promise<void> {
    this.#rs = ReadyState.Connecting;

    this.#socket = clientio(this.#o.url, {
      reconnection: this.#o.reconnect ?? true,
      reconnectionDelay: this.#o.delay ?? 1000,
      reconnectionAttempts: this.#o.maximumRetryCount ?? 3,
    });

    return Promise.race<void>([
      new Promise((resolve, reject) => {
        if(!this.#socket) {
          this.#rs = ReadyState.Error;
          return reject(new WebSocketError('Socket connection failed', this.#o.url, ExitCode.InternalError));
        }
  
        this.#socket.on('connect', () => {
          this.#rs = ReadyState.Open;
          resolve();
        });
    
        this.#socket.on('disconnect', () => {
          this.#rs = ReadyState.Closed;
        });
    
        this.#socket.on('error', (err) => {
          this.#rs = ReadyState.Error;
          reject(err);
        });
      }),
      new Promise((_, reject) => {
        setTimeout(() => {
          this.#socket?.disconnect();
          this.#rs = ReadyState.Error;
          reject(new WebSocketError('Connection timeout', this.#o.url, ExitCode.HttpTimeout));
        }, 5000);
      }),
    ]);
  }

  /**
   * Subscribe to a channel and register a callback.
   * 
   * @param channel - The channel to subscribe to.
   * @param callback - The callback function to be invoked when the event is emitted.
   * @returns A promise that resolves to a listener object with an unsubscribe method.
   */
  public subscribe<K extends keyof EMap, C extends GenericFunction<any>>(channel: K | Omit<string, K> | IBroadcastChannel, callback: C, options?: WSSubscribeOptions): Promise<Listener<C>> {
    if(this.#rs !== ReadyState.Open) {
      throw new WebSocketError('Socket connection is not open', this.#o.url, ExitCode.InternalError);
    }

    const eventKey = typeof channel === 'string' ? channel : (channel as IBroadcastChannel)._key;
    const callbackSignature = Hash.sha256(callback.toString());
    
    const unsubscribe = () => {
      this.#socket?.off(eventKey, callback);
    
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const contextIndex = this.#listeners.findIndex(([_, listener]) => listener.callbackSignature === Hash.sha256(callback.toString()));
            
      if(contextIndex > -1) {
        this.#listeners.deleteByIndex(contextIndex);
      }
    };
    
    const listenerObject = {
      channel: channel as string | IBroadcastChannel,
      type: options?.once === true ? 'once' : 'on',
      listenerId: Crypto.uuid().replace(/-/g, ''),
      createdAt: Date.now(),
      callbackSignature,
      unsubscribe,
      callback,
      calls: 0,
    } satisfies Listener<C>;
    
    this.#socket?.[listenerObject.type](eventKey, callback);
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
  public emit<TResult = void, K extends keyof EMap = '', TData = any>(channel: K | Omit<string, K> | IBroadcastChannel, ...args: TData[]): Promise<(EmitResponse<TResult> | null)[]> {
    if(this.#rs !== ReadyState.Open) {
      throw new WebSocketError('Socket connection is not open', this.#o.url, ExitCode.InternalError);
    }

    const eventKey = typeof channel === 'string' ? channel : (channel as IBroadcastChannel)._key;
    const listeners = this.#listeners.findMany(item => {
      const ek = typeof item[0] === 'string' ? item[0] : item[0]._key;
      return ek === eventKey;
    });
    
    this.#socket?.emit(eventKey, ...args);
    const results: EmitResponse<TResult>[] = [];
    
    for(const listener of listeners) {
      if(listener[1].type === 'once' && listener[1].calls > 0) {
        listener[1].unsubscribe();
        continue;
      } else {
        const idx = this.#listeners.findIndex(item => {
          return item[1].callbackSignature === listener[1].callbackSignature;
        });
    
        if(idx > -1) {
          this.#listeners.deleteByIndex(idx);
          this.#listeners.push([
            listener[0],
            {
              ...listener[1],
              calls: listener[1].calls + 1,
            },
          ]);
        }
      }
    
      results.push({
        callbackSignature: listener[1].callbackSignature,
        unsubscribe: listener[1].unsubscribe,
        result: void 0 as unknown as TResult,
        listenerId: listener[1].listenerId,
        createdAt: listener[1].createdAt,
        channel: listener[1].channel,
        calls: listener[1].calls + 1,
        type: listener[1].type,
      });
    }
    
    return Promise.resolve<EmitResponse<TResult>[]>(results);
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
      } satisfies WSSerializedContext;
    });
    
    return JSON.stringify(arr);
  }

  /**
   * Iterator method for iterating over the serialized context.
   * 
   * @returns An iterable iterator for the serialized context.
   */
  public [Symbol.iterator](): IterableIterator<Enumerable<WSSerializedContext>[number]> {
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
      } satisfies WSSerializedContext;
    });
        
    return enumerateIterableIterator(arr)[Symbol.iterator]();
  }

  /**
   * Symbol.toStringTag implementation for better object representation.
   * 
   * @returns A string representing the object's tag.
   */
  public [Symbol.toStringTag]() {
    return '[object WebSocketBroadcasterClientNode]';
  }
}

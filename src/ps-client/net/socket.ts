// import * as tls from 'node:tls';
// import * as http from 'node:http';
// import * as https from 'node:https';
// import * as http2 from 'node:http2';

// import { Server, Socket } from 'socket.io';
// import type { CorsOptions, CorsOptionsDelegate } from 'cors';
// import clientio, { type ManagerOptions, type SocketOptions } from 'socket.io-client';

// import { errno } from '../_utils';
// import { Hash } from '../../crypto';
// import { Throwable } from '../errors';
// import { EachTopic, Topic } from '../broker/core';
// import type { Dict, MaybePromise } from '../../types';
// import { assertString } from '../../utils/assertions';
// import { EventEmitter, Event as BaseEvent } from '../../events';
// import { GatewayTimeoutError } from '../../errors/http/extended';


// const $clientUri = Symbol('Socket::$CLIENT_URI');


// /* EVENTS */
// class ReadyStateChangeEvent extends BaseEvent<WebSocketServer> {
//   constructor(target: WebSocketServer) {
//     super('readystatechange', {
//       target,
//       cancelable: false,
//     });
//   }
// }
// /* END EVENTS */


// type TopicListener = {
//   listener: ((event: EachTopic) => MaybePromise<void>);
//   unsubscribe(): void;
//   readonly topic: string;
//   readonly subscriptionId: string;
// }

// export type Subscription = {
//   unsubscribe(): void;
//   readonly event: string;
//   readonly subscriptionId: string;
//   readonly listener: (...args: any[]) => void;
// }

// export type EmitOptions = {
//   slice?: boolean;
//   blocksSize?: number;
//   headers?: Dict<string | readonly string[]>;
// }

// export interface Node<E extends Record<string, unknown> = Record<string, any>> {
//   subscribe<K extends keyof E>(event: K | Omit<string, K>, listener: ((event: E[K] | any) => void)): TopicListener;
//   emit<K extends keyof E>(event: K | Omit<string, K>, data: { key: string, value: string | Buffer }[], options?: EmitOptions): boolean;
//   disconnect(clientId?: string): void;
//   close(): void;
// }

// export type WSSInit = {
//   attach?: http.Server | http2.Http2SecureServer;
//   port?: number;
//   secure?: boolean;
//   ssl?: tls.SecureContextOptions & tls.TlsOptions;
//   cors?: CorsOptions | CorsOptionsDelegate;
//   listentingTimeout?: number;
// };

// export async function createSocketServer(options: WSSInit): Promise<Server> {
//   let srv: {
//     secure: true;
//     server: https.Server;
//   } | {
//     secure: false;
//     server: http.Server;
//   };

//   if(!options.attach && !options.port) {
//     throw new Error('Either attach or port must be specified');
//   }

//   if(options.attach) {
//     if(!options.attach.listening) {
//       throw new Error('The attached server is not listening for connections');
//     }

//     srv = {
//       secure: options.attach instanceof https.Server,
//       server: options.attach as https.Server,
//     } as unknown as any;
//   } else {
//     srv = {
//       secure: !!options.secure,
//       server: options.secure ? https.createServer({ ...options.ssl }) : http.createServer(),
//     } as unknown as any;
    
//     await (options.listentingTimeout ? Promise.race([
//       new Promise<void>(resolve => srv.server.listen(options.port, resolve)),
//       new Promise((_, reject) => {
//         setTimeout(() => {
//           srv?.server.close();
//           reject(new GatewayTimeoutError('The server took too long to start', undefined, undefined, {
//             errno: errno.gateway_timeout,
//           }));
//         }, options.listentingTimeout);
//       }),
//     ]) : new Promise<void>(resolve => srv.server.listen(options.port, resolve)));
//   }

//   const wss = new Server({
//     cors: options.cors ?? {
//       origin: '*',
//     },
//   });

//   wss.listen(srv.server);
//   return wss;
// }


// export type ClientInit = Partial<ManagerOptions & SocketOptions> & {
//   [$clientUri]: string;
// };


// export enum ReadyState {
//   Connecting,
//   Connected,
//   Closing,
//   Closed
// }

// export class WebSocketServer<
//   EventsMap extends Record<string, BaseEvent<unknown>> = Record<string, BaseEvent<any>>,
//   TopicsMap extends Record<string, unknown> = Record<string, Topic>
// > implements Node<TopicsMap> {
//   #s: Server | null;
//   readonly #o: WSSInit;
//   readonly #e: EventEmitter;
//   readonly #sockets: Map<string, Socket>;
//   readonly #events: Map<string, Subscription>;
//   readonly #topics: Map<string, TopicListener>;
//   #readyState: ReadyState = ReadyState.Connecting;

//   constructor(options: WSSInit) {
//     this.#s = null;
//     this.#o = options;
//     this.#e = new EventEmitter();
//     this.#events = new Map<string, Subscription>();
//     this.#topics = new Map<string, TopicListener>();

//     this.#init();
//   }

//   async #init(): Promise<void> {
//     if(this.#readyState !== ReadyState.Connecting) {
//       throw new Throwable('The server is not in connecting state. It\'s already connected or an occurred at some point', {
//         errno: errno.invalid_ready_state,
//       });
//     }

//     try {
//       this.#s = await createSocketServer(this.#o);

//       this.#readyState = ReadyState.Connected;
//       this.#e.emit('readystatechange', new ReadyStateChangeEvent(this));

//       this.#s.on('connection', socket => {
//         this.#sockets.set(socket.id, socket);
//       });
//     } catch (err) {
//       this.#readyState = ReadyState.Closed;
//       this.#e.emit('readystatechange', new ReadyStateChangeEvent(this));

//       throw err;
//     }
//   }

//   public get readystate(): number {
//     return this.#readyState;
//   }

//   public addEventListener<K extends keyof EventsMap>(event: K | Omit<string, K>, listener: ((event: EventsMap[K] | any) => void)): Subscription {
//     assertString(event);

//     const subscriptionId = Hash.sha256(listener.toString());
//     const subscription = this.#e.subscribe(event, listener);

//     const o = {
//       ...subscription,
//       subscriptionId,
//       listener,
//       event,
//     };

//     this.#events.set(subscriptionId, o);
//     return o;
//   }

//   public removeEventListener<K extends keyof EventsMap>(event: K | Omit<string, K>, listener: ((event: EventsMap[K] | any) => void)): void {
//     assertString(event);

//     const subscriptionId = Hash.sha256(listener.toString());
//     const subscription = this.#events.get(subscriptionId);

//     if(subscription && subscription.event === event) {
//       subscription.unsubscribe();
//       this.#events.delete(subscriptionId);
//     }
//   }

//   public removeManyEventListeners<K extends keyof EventsMap>(event: K | Omit<string, K>): void {
//     assertString(event);

//     for(const [subscriptionId, subscription] of this.#events.entries()) {
//       if(subscription.event === event) {
//         subscription.unsubscribe();
//         this.#events.delete(subscriptionId);
//       }
//     }
//   }

//   public removeAllEventListeners(): void {
//     for(const subscription of this.#events.values()) {
//       subscription.unsubscribe();
//     }

//     this.#events.clear();
//   }

//   public subscribe<K extends keyof TopicsMap>(topic: K | Omit<string, K>, listener: ((event: EachTopic) => void)): TopicListener {
//     if(this.#readyState !== ReadyState.Connected) {
//       throw new Throwable('The server is not in connected', {
//         errno: errno.invalid_ready_state,
//       });
//     }

//     assertString(topic);

//     for(const socket of this.#sockets.values()) {
//       socket.on(topic, listener);
//     }

//     const subscriptionId = Hash.sha256(listener.toString());
//     const subscription = {
//       unsubscribe: () => {
//         for(const socket of this.#sockets.values()) {
//           socket.off(topic, listener);
//         }
//       },
//       topic,
//       subscriptionId,
//       listener,
//     };

//     this.#topics.set(subscriptionId, subscription);
//     return subscription;
//   }

//   public emit<K extends keyof TopicsMap>(topic: K | Omit<string, K>,
//     data: { key: string, value: string | Buffer }[],
//     options?: EmitOptions): boolean {
//     if(this.#readyState !== ReadyState.Connected) {
//       throw new Throwable('The server is not in connected', {
//         errno: errno.invalid_ready_state,
//       });
//     }

//     assertString(topic);

//     for(const socket of this.#sockets.values()) {
//       socket.emit(topic, this.#createEachTopic(topic, data, options));
//     }

//     return true;
//   }

//   #createEachTopic(topic: string, data: { key: string, value: string | Buffer }[], options?: EmitOptions): EachTopic {
//     const headers = options?.headers ? Object.entries(options.headers).map(([key, value]) => {
//       return `${key}: ${Array.isArray(value) ? value.join('; ') : value}`;
//     }) : [];

//     const partitioned = typeof options?.slice === 'boolean' ? options.slice : false;

//     const $this = {
//       topic,
//       headers,
//       partitioned,
//     };

//     // TODO: Implement partitioned
//   }

//   public unsubscribe<K extends keyof TopicsMap>(topic: K | Omit<string, K>, listener: ((event: EachTopic) => void)): void {
//     assertString(topic);

//     for(const socket of this.#sockets.values()) {
//       socket.off(topic, listener);
//     }
//   }

//   public disconnect(socketId: string): void {
//     const socket = this.#sockets.get(socketId);

//     if(socket) {
//       socket.disconnect(true);
//       this.#sockets.delete(socketId);
//     }
//   }

//   public disconnectAll(): void {
//     for(const socket of this.#sockets.values()) {
//       socket.disconnect(true);
//     }

//     this.#sockets.clear();
//   }

//   public close(): void {
//     if(this.#readyState === ReadyState.Closed) return;
//     this.disconnectAll();

//     this.#readyState = ReadyState.Closing;
//     this.#e.emit('readystatechange', new ReadyStateChangeEvent(this));

//     this.#s?.close(() => {
//       this.#readyState = ReadyState.Closed;
//       this.#e.emit('readystatechange', new ReadyStateChangeEvent(this));
//     });
//   }
// }


// export class WebSocketClient<
//   TopicsMap extends Record<string, unknown> = Record<string, Topic>
// > implements Node<TopicsMap> {
//   readonly #o: ClientInit;
//   readonly #s: ReturnType<typeof clientio>;

//   constructor(uri: string, options?: ClientInit) {
//     this.#s = clientio(uri, options);

//     this.#o = {
//       ...options,
//       [$clientUri]: uri,
//     };
//   }

//   public get url(): string {
//     return this.#o[$clientUri];
//   }

//   public subscribe<K extends keyof TopicsMap>(topic: K | Omit<string, K>, listener: ((event: EachTopic) => void)): TopicListener {
//     assertString(topic);
    
//     const subscriptionId = Hash.sha256(listener.toString());
//     const subscription = {
//       unsubscribe: () => {
//         this.#s.off(topic, listener);
//       },
//       topic,
//       subscriptionId,
//       listener,
//     };
    
//     this.#s.on(topic, listener);
//     return subscription;
//   }

//   public emit<K extends keyof TopicsMap>(topic: K | Omit<string, K>, ...args: any[]): boolean {
//     assertString(topic);
//     this.#s.emit(topic, ...args);
//     return true;
//   }

//   public unsubscribe<K extends keyof TopicsMap>(topic: K | Omit<string, K>, listener: ((event: EachTopic) => void)): void {
//     assertString(topic);
//     this.#s.off(topic, listener);
//   }

//   public disconnect(): void {
//     this.#s.disconnect();
//   }

//   public close(): void {
//     this.#s.disconnect();
//     this.#s.close();
//   }
// }
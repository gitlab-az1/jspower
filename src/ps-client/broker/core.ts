// import { errno } from '../_utils';
// import { Node } from '../net/socket';
// import { Throwable } from '../errors';


// const $socket = Symbol('Broker::$SOCKET');


// export type Message = {
//   readonly key: string;
//   readonly value: string | readonly number[];
// };


// export type Partition = {
//   partition: number;
//   firstSequence: number;
//   offset: number;
//   fetchOffset: number;
//   maxBytes: number;
//   messages: readonly Message[];
// };


// export type Topic = {
//   readonly topic: string;
//   readonly size: number;
//   readonly headers: readonly string[];
// } & (
//   {
//     readonly partitioned: true;
//     readonly partitions: readonly Partition[];
//   } | {
//     readonly partitioned: false;
//     readonly messages: readonly Message[];
//   }
// );


// export interface EachTopic {
//   readonly $this: Topic;

//   heartbeat(): Promise<void>;
//   pause(): Promise<void>;
// }


// export type BrokerInit = {
//   isServer?: boolean;
//   socket: Node;
// };

// export class Broker {
//   readonly #o: Omit<BrokerInit, 'socket'>;
//   private [$socket]: Node;

//   constructor(options: BrokerInit) {
//     if(!options.socket) {
//       throw new Throwable('Websocket node is required', {
//         errno: errno.invalid_argument,
//       });
//     }

//     this[$socket] = options.socket;
//     delete (options as Record<string, any>).socket;

//     this.#o = options;
//   }
// }
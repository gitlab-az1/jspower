import { Broadcaster, Client } from './_abstract';
import { WebSocketBroadcasterRootNode, WebsocketBroadcaster } from './broadcaster/socket';


export interface WebSocketPoolClient extends Client {
  readonly type: 'ws';
  clients(): Promise<(Broadcaster & WebsocketBroadcaster)[]>;
}

export interface EventEmitterPoolClient extends Client {
  readonly type: 'local';
  clients(): Promise<Broadcaster[]>;
}

export interface Pool {
  readonly createdAt: number;
  readonly key: string;
  readonly name: string;
  readonly port: number;
  readonly url: string;
  readonly version: string;
  readonly clients: (WebSocketPoolClient | EventEmitterPoolClient)[];
  clientsCount(): Promise<number>;
  addClient(client: WebSocketPoolClient | EventEmitterPoolClient): Promise<void>;
  removeClient(client: WebSocketPoolClient | EventEmitterPoolClient): Promise<void>;
  serialize(): object;
}


export async function createPool(serverPort: number = 9999): Promise<Pool> {
  const root = new WebSocketBroadcasterRootNode(serverPort);
  await root.createConnection();

  // TODO: finish it!
  return {} as unknown as Pool;
}
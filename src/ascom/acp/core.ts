import { Crypto } from '../../crypto';
import { Broadcaster, Client } from './_abstract';
import { WebSocketBroadcasterClientNode, WebSocketBroadcasterRootNode, WebsocketBroadcaster } from './broadcaster/socket';


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
  readonly port: number;
  readonly url: string;
  readonly version: string;
  readonly clients: (WebSocketPoolClient | EventEmitterPoolClient)[];
  readonly root: WebSocketBroadcasterRootNode;
  clientsCount(): Promise<number>;
  createClient(): Promise<WebSocketBroadcasterClientNode>;
  removeClient(client: WebSocketPoolClient | EventEmitterPoolClient): Promise<void>;
  serialize(): object;
}


export async function createPool(serverPort: number = 9999, secure: boolean = false): Promise<Pool> {
  const root = new WebSocketBroadcasterRootNode(serverPort, { secure });
  await root.createServer();

  const createClient = async () => {
    const protocol = secure === true ? 'wss:' : 'ws:';
    const node = new WebSocketBroadcasterClientNode(`${protocol}//127.0.0.1:${serverPort}`, { secure });

    await node.connect();
    return node;
  };

  const serialize = () => {
    return {};
  };

  return {
    root,
    serialize,
    createClient,
    port: serverPort,
    key: Crypto.uuid(),
    createdAt: Date.now(),
    version: '0.0.1' as const,
    url: `${secure === true ? 'wss' : 'ws'}://127.0.0.1:${serverPort}` as const,
  } as unknown as Pool;
}
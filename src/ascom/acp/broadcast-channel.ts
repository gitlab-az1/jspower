import { Crypto } from '../../crypto';
import { IBroadcastChannel } from './_abstract';


export class BroadcastChannel implements IBroadcastChannel {
  private readonly _initTs: number;
  private readonly _channelKey: string;
  private readonly _channelName: string;

  constructor(name?: string) {
    this._initTs = Date.now();
    this._channelKey = Crypto.uuid().replace(/-/g, '');
    this._channelName = name ?? new Date().toUTCString();
  }

  public get _key(): string {
    return this._channelKey;
  }

  public get name(): string {
    return this._channelName;
  }

  public get createdAt(): number {
    return this._initTs;
  }

  public serialize(): object {
    return Object.freeze({
      createdAt: this.createdAt,
      name: this.name,
      key: this._key,
    });
  }
}

export default BroadcastChannel;
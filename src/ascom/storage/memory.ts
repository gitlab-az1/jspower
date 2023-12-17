import {
  ERR_INVALID_ADDRESS,
  ERR_INVALID_SIGNATURE,
  ERR_READ_BUFFER_AS_LITERAL,
  ERR_READ_LITERAL_AS_BUFFER,
  ERR_ENVIRONMENT_NOT_SUPPORTED,
} from '../_utils';

import { EventEmitter, Event as BaseEvent, EventEmitterSubscription } from '../../events';
import { isNode } from '../../constants';
import { Hash } from '../../crypto';
import { List } from '../../list';
import Errno from '../errno';


/**
 * Represents a block of memory storage for literal data.
 */
export type MemoryStorageBlock<T> = {
  readonly signature: string;
  readonly address: number;
  readonly type: 'literal';
  readonly data: T;
};

/**
 * Represents a block of memory storage for buffer data.
 */
export type BufferStorageBlock = {
  readonly size: number;
  readonly data: number[];
  readonly type: 'Buffer';
  readonly address: number;
  readonly signature: string;
}

const $InputDataType = Symbol('AsCOM->Storage::AsyncVirtualMemoryStorageDriver::$$InputDataType{ Buffer | Literal }');

/**
 * Represents the context of a virtual memory block.
 */
export type VirtualMemoryBlockContext = {
  [$InputDataType]: 'buffer'| 'literal';
  readonly signature: string;
  readonly address: number;
  readonly data: number[];
  readonly size: number;
}


type EventSubscription = {
  unsubscribe(): void;
  readonly event: string;
  readonly signature: string;
}


type RWEvent = {
  readonly operation: 'read' | 'write';
  readonly current: VirtualMemoryBlockContext;
  readonly _class: AsyncVirtualMemoryStorageDriver;
  readonly previous: VirtualMemoryBlockContext | null;
  readonly currentSnapshot: MemoryStorageBlock<any> | BufferStorageBlock;
  readonly previousSnapshot: MemoryStorageBlock<any> | BufferStorageBlock | null;
};

class ReadWriteEvent extends BaseEvent<RWEvent> {
  constructor(target: RWEvent) {
    super('rw', { target, cancelable: false });
  }
}


export interface VirtualMemoryEventsMap {
  rw: ReadWriteEvent;
}


export class AsyncVirtualMemoryStorageDriver {
  readonly #storage: List<MemoryStorageBlock<any> | BufferStorageBlock> = new List<MemoryStorageBlock<any> | BufferStorageBlock>();
  readonly #ee: EventEmitter = new EventEmitter();
  #events: EventSubscription[];

  /**
   * Writes literal data to the virtual memory storage.
   * @param address - The address to write the data to.
   * @param data - The data to be written.
   */
  public write<T = any>(address: string | number, data: T): void {
    if(typeof address !== 'string') {
      address = typeof address === 'number' ? 
        address.toString(16) :
        (address as unknown as any).toString();
    }

    const signature = Hash.sha512(JSON.stringify(data));
    const addr = parseInt(address as string, 16);

    if(Number.isNaN(addr) || addr < 0) {
      throw new Errno(ERR_INVALID_ADDRESS, 'AsyncVirtualMemoryStorageDriver::Write');
    }

    const block = {
      type: 'literal',
      address: addr,
      signature,
      data,
    } as const;

    this.#storage.push(block, address as string);

    this.#ee.emit('rw', new ReadWriteEvent({
      _class: this,
      operation: 'write',
      current: {
        [$InputDataType]: 'literal',
        signature,
        address: addr,
        data: Buffer.from(JSON.stringify(data)).toJSON().data,
        size: Buffer.from(JSON.stringify(data)).byteLength,
      },
      previous: null,
      currentSnapshot: block,
      previousSnapshot: null,
    }));
  }

  /**
   * Reads literal data from the virtual memory storage.
   * @param address - The address to read the data from.
   * @returns The memory storage block if found, otherwise null.
   * @throws {Errno} If there is an error reading the buffer as a literal or if the signature is invalid.
   */
  public read<T = any>(address: string | number): MemoryStorageBlock<T> | null {
    if(typeof address !== 'string') {
      address = typeof address === 'number' ? 
        address.toString(16) :
        (address as unknown as any).toString();
    }

    const block = this.#storage.lookup(address as string);
    if(!block) return null;

    if(block.type === 'Buffer') {
      throw new Errno(ERR_READ_BUFFER_AS_LITERAL, 'AsyncVirtualMemoryStorageDriver::Read');
    }
    
    const calculatedSignature = Hash.sha512(JSON.stringify(block.data));

    if(calculatedSignature !== block.signature) {
      throw new Errno(ERR_INVALID_SIGNATURE, 'AsyncVirtualMemoryStorageDriver::Read');
    }

    this.#ee.emit('rw', new ReadWriteEvent({
      _class: this,
      operation: 'read',
      current: {
        [$InputDataType]: 'literal',
        signature: block.signature,
        address: block.address,
        data: Buffer.from(JSON.stringify(block.data)).toJSON().data,
        size: Buffer.from(JSON.stringify(block.data)).byteLength,
      },
      previous: null,
      currentSnapshot: block,
      previousSnapshot: null,
    }));

    return block;
  }

  /**
   * Writes buffer data to the virtual memory storage.
   * @param address - The address to write the buffer data to.
   * @param data - The buffer or array containing data to be written.
   */
  public writeBuffer(address: string | number, data: Buffer | number[]): void {
    if(!isNode) {
      throw new Errno(ERR_ENVIRONMENT_NOT_SUPPORTED, 'AsyncVirtualMemoryStorageDriver::WriteBuffer');
    }

    if(typeof address !== 'string') {
      address = typeof address === 'number' ? 
        address.toString(16) :
        (address as unknown as any).toString();
    }

    if(!Buffer.isBuffer(data)) {
      data = Buffer.from(JSON.stringify(data));
    }

    const signature = Hash.sha512(data.toString('hex'));
    const addr = parseInt(address as string, 16);

    if(Number.isNaN(addr) || addr < 0) {
      throw new Errno(ERR_INVALID_ADDRESS, 'AsyncVirtualMemoryStorageDriver::WriteBuffer');
    }

    const block = {
      address: addr,
      type: 'Buffer',
      signature,
      size: data.length,
      data: data.toJSON().data,
    } as const;

    this.#storage.push(block, address as string);

    this.#ee.emit('rw', new ReadWriteEvent({
      _class: this,
      operation: 'write',
      current: {
        [$InputDataType]: 'buffer',
        signature,
        address: addr,
        data: data.toJSON().data,
        size: data.length,
      },
      previous: null,
      currentSnapshot: block,
      previousSnapshot: null,
    }));
  }

  /**
   * Reads buffer data from the virtual memory storage.
   * @param address - The address to read the buffer data from.
   * @returns The buffer if found, otherwise null.
   * @throws {Errno} If there is an error reading the literal as a buffer or if the signature is invalid.
   */
  public readBuffer(address: string | number): Buffer | null {
    if(!isNode) {
      throw new Errno(ERR_ENVIRONMENT_NOT_SUPPORTED, 'AsyncVirtualMemoryStorageDriver::ReadBuffer');
    }

    if(typeof address !== 'string') {
      address = typeof address === 'number' ? 
        address.toString(16) :
        (address as unknown as any).toString();
    }

    const block = this.#storage.lookup(address as string);
    if(!block) return null;

    if(block.type === 'literal') {
      throw new Errno(ERR_READ_LITERAL_AS_BUFFER, 'AsyncVirtualMemoryStorageDriver::ReadBuffer');
    }
    
    const calculatedSignature = Hash.sha512(Buffer.from(block.data).toString('hex'));

    if(calculatedSignature !== block.signature) {
      throw new Errno(ERR_INVALID_SIGNATURE, 'AsyncVirtualMemoryStorageDriver::ReadBuffer');
    }

    const buf = Buffer.from(block.data);

    this.#ee.emit('rw', new ReadWriteEvent({
      _class: this,
      operation: 'read',
      current: {
        [$InputDataType]: 'buffer',
        signature: block.signature,
        address: block.address,
        data: buf.toJSON().data,
        size: buf.byteLength,
      },
      previous: null,
      currentSnapshot: block,
      previousSnapshot: null,
    }));

    return buf;
  }

  /**
   * Serializes the context of virtual memory blocks.
   * @returns An array of virtual memory block contexts.
   */
  public serializeContext(): VirtualMemoryBlockContext[] {
    const items: List<VirtualMemoryBlockContext> = new List<VirtualMemoryBlockContext>();

    for(const item of this.#storage.toArray()) {
      let data: number[];
      let size: number;

      if(isNode) {
        if(item.type === 'literal') {
          const buf = Buffer.from(JSON.stringify(item.data));
  
          data = buf.toJSON().data;
          size = buf.byteLength;
        } else {
          data = item.data;
          size = item.size;
        }
      } else {
        if(item.type === 'literal') {
          const textEncoder = new TextEncoder();
          const byteArray = textEncoder.encode(JSON.stringify(item.data));

          data = Array.from(byteArray);
          size = byteArray.byteLength;
        } else {
          data = item.data;
          size = item.size;
        }
      }

      items.push({
        [$InputDataType]: item.type === 'literal' ? 'literal' : 'buffer',
        signature: item.signature,
        address: item.address,
        size,
        data,
      });
    }

    return items.toArray();
  }

  /**
   * Remove all data stored in this instance of virtual memory storage.
   */
  public empty() {
    this.#storage.clear();
  }

  /**
   * Adds an event listener for virtual memory events.
   * @param event - The event type to listen for.
   * @param listener - The listener function.
   * @returns An event subscription object.
   */
  public addEventListener<K extends keyof VirtualMemoryEventsMap>(event: K, listener: ((__ev: VirtualMemoryEventsMap[K]) => void)): EventEmitterSubscription {
    const signature = Hash.sha512(listener.toString());
    const subscription = this.#ee.subscribe(event, listener);

    this.#events.push({
      event,
      signature,
      unsubscribe() {
        subscription.unsubscribe();
      },
    });

    return subscription;
  }

  /**
   * Removes an event listener for virtual memory events.
   * @param event - The event type to remove the listener from.
   * @param listener - The listener function to remove.
   */
  public removeEventListener<K extends keyof VirtualMemoryEventsMap>(event: K, listener: ((__ev: VirtualMemoryEventsMap[K]) => void)): void {
    const signature = Hash.sha512(listener.toString());
    const index = this.#events.findIndex(x => x.event === event && x.signature === signature);
    if(index === -1) return;
    
    this.#events[index].unsubscribe();
    this.#events.splice(index, 1);
  }

  /**
   * Removes multiple event listeners for a specific event type.
   * @param event - The event type to remove listeners from.
   */
  public removeManyEventListeners<K extends keyof VirtualMemoryEventsMap>(event: K): void {
    this.#events.filter(item => item.event === event).forEach(item => item.unsubscribe());
    this.#events = this.#events.filter(item => item.event !== event);
  }

  /**
   * Removes all event listeners for virtual memory events.
   */
  public removeAllEventListeners(): void {
    for(const event of this.#events) {
      event.unsubscribe();
    }

    this.#events = [];
  }

  /**
   * Gets the number of blocks stored in the virtual memory storage.
   */
  public get length() {
    return this.#storage.length;
  }

  /**
   * Converts a virtual memory block context to literal data.
   * @param context - The virtual memory block context to convert.
   * @returns The literal data.
   * @throws {Errno} If the signature is invalid or parsing fails.
   */
  public static convertContextToLiteral<T = any>(context: VirtualMemoryBlockContext): T {
    const data = Buffer.from(context.data);
    const _literalDataToHash = context[$InputDataType] === 'literal' ? 
      data.toString() :
      data.toString('hex');

    const sign = Hash.sha512(_literalDataToHash);

    if(sign !== context.signature) {
      throw new Errno(ERR_INVALID_SIGNATURE, 'AsyncVirtualMemoryStorageDriver::ConvertContextToLiteral');
    }

    try {
      const parsed = JSON.parse(data.toString());
      return parsed as T;
    } catch (err: any) {
      console.warn(`[AsyncVirtualMemoryStorageDriver::ConvertContextToLiteral] Failed to parse data as JSON: ${err.message}`);
      return data.toString() as unknown as T;
    }
  }
}

export default AsyncVirtualMemoryStorageDriver;
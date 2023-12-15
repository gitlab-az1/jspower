import {
  ERR_INVALID_ADDRESS,
  ERR_INVALID_SIGNATURE,
  ERR_READ_BUFFER_AS_LITERAL,
  ERR_READ_LITERAL_AS_BUFFER,
} from '../_utils';

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

/**
 * Represents the context of a virtual memory block.
 */
export type VirtualMemoryBlockContext = {
  readonly signature: string;
  readonly address: number;
  readonly data: number[];
  readonly size: number;
}

export class AsyncVirtualMemoryStorageDriver {
  readonly #storage: List<MemoryStorageBlock<any> | BufferStorageBlock> = new List<MemoryStorageBlock<any> | BufferStorageBlock>();

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

    this.#storage.push({
      type: 'literal',
      address: addr,
      signature,
      data,
    }, address as string);
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

    return block;
  }

  /**
   * Writes buffer data to the virtual memory storage.
   * @param address - The address to write the buffer data to.
   * @param data - The buffer or array containing data to be written.
   */
  public writeBuffer(address: string | number, data: Buffer | number[]): void {
    if(typeof address !== 'string') {
      address = typeof address === 'number' ? 
        address.toString(16) :
        (address as unknown as any).toString();
    }

    if(!Buffer.isBuffer(data)) {
      data = Buffer.from(data);
    }

    const signature = Hash.sha512(data.toString('hex'));
    const addr = parseInt(address as string, 16);

    if(Number.isNaN(addr) || addr < 0) {
      throw new Errno(ERR_INVALID_ADDRESS, 'AsyncVirtualMemoryStorageDriver::WriteBuffer');
    }

    this.#storage.push({
      address: addr,
      type: 'Buffer',
      signature,
      size: data.length,
      data: data.toJSON().data,
    }, address as string);
  }

  /**
   * Reads buffer data from the virtual memory storage.
   * @param address - The address to read the buffer data from.
   * @returns The buffer if found, otherwise null.
   * @throws {Errno} If there is an error reading the literal as a buffer or if the signature is invalid.
   */
  public readBuffer(address: string | number): Buffer | null {
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

    return Buffer.from(block.data);
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

      if(item.type === 'literal') {
        const buf = Buffer.from(JSON.stringify(item.data));

        data = buf.toJSON().data;
        size = buf.byteLength;
      } else {
        data = item.data;
        size = item.size;
      }

      items.push({
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
   * Gets the number of blocks stored in the virtual memory storage.
   */
  public get length() {
    return this.#storage.length;
  }
}

export default AsyncVirtualMemoryStorageDriver;
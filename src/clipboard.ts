import { EventEmitter, Event as BaseEvent, EventEmitterSubscription } from './events';
import { jsonSafeStorage, ssrSafeDocument } from './ssr';
import { Exception } from './errors/exception';
import { Crypto, Hash } from './crypto';
import { is } from './utils';



export type ClipboardItem = {
  readonly [mimeType: string]: Blob;
} & {
  readonly signature: string;
  readonly mimeType: string;
  maxAccessCount?: number;
  lastAccessTime?: number;
  readonly size: number;
  expireAfter?: number;
  accessCount?: number;
  readonly id: string;
}

type SerializedItem = {
  readonly signature: string;
  readonly mimeType: string;
  maxAccessCount?: number;
  lastAccessTime?: number;
  readonly size: number;
  expireAfter?: number;
  accessCount?: number;
  readonly id: string;
  readonly _blob: {
    readonly data: {
      readonly type: string;
      readonly base64: string;
    };
    readonly checksum: {
      readonly algorithm: 'sha256' | 'sha512';
      readonly hash: string;
    };
  };
};


/* events */
type EventSubscription = {
  readonly signature: string;
  unsubscribe: () => void;
  readonly event: string;
  readonly id: number;
}


export class ReadyStateChageEvent extends BaseEvent<VirtualClipboard> {
  constructor(target: VirtualClipboard) {
    super('readystatechange', { target, cancelable: false });
  }
}


export class CloseEvent extends BaseEvent<VirtualClipboard> {
  constructor(target: VirtualClipboard) {
    super('close', { target, cancelable: false });
  }
}


export class CopyEvent extends BaseEvent<ClipboardItem> {
  constructor(target: ClipboardItem) {
    super('copy', { target, cancelable: false });
  }
}


export class PasteEvent extends BaseEvent<string | ClipboardItem> {
  constructor(target: string | ClipboardItem) {
    super('paste', { target, cancelable: false });
  }
}


export interface VirtualClipboardEventsMap {
  readystatechange: ReadyStateChageEvent;
  close: CloseEvent;
  paste: PasteEvent;
  copy: CopyEvent;
}
/* events */


export type NewItemOptions = {
  maxAccessCount?: number;
  maxAge?: number;
}


enum ReadyState {
  Uninitialized,
  Loading,
  Interactive,
  Closed,
}


/**
 * VirtualClipboard is a clipboard that can be used as a fallback to navigator.clipboard
 */
export class VirtualClipboard {
  #e: EventEmitter;
  #items: ClipboardItem[];
  #readyState: ReadyState;
  #events: EventSubscription[];
  readonly #storageKey: string;

  constructor(storageKey?: string) {
    if(!ssrSafeDocument) {
      throw new Exception('VirtualClipboard can not be used in server side rendering');
    }
    
    this.#storageKey = storageKey ?? '_vclipboard';
    this.#readyState = ReadyState.Uninitialized;
    this.#e = new EventEmitter();
    this.#events = [];
    this.#items = [];

    this.#load();
    console.log('[*] Initializing virtual clipboard...');
  }

  async #load(): Promise<void> {
    this.#readyState = ReadyState.Loading;
    this.#e.emit('readystatechange', new ReadyStateChageEvent(this));

    const storage = jsonSafeStorage('localStorage');
    const storedItems = storage.getItem(this.#storageKey) as SerializedItem[] | undefined;

    const r = () => {
      this.#readyState = ReadyState.Interactive;
      this.#e.emit('readystatechange', new ReadyStateChageEvent(this));
      
      console.log('[*] Virtual clipboard is ready');
    };

    if(!storedItems) return r();
    if(!Array.isArray(storedItems)) return r();

    for(const item of storedItems) {
      if(item.expireAfter && Date.now() > item.expireAfter) continue;
      if(item.maxAccessCount && item.accessCount && item.accessCount >= item.maxAccessCount) continue;
      
      if(!['sha256', 'sha512'].includes(item._blob.checksum.algorithm)) continue;
      const dataHash = Hash[item._blob.checksum.algorithm](JSON.stringify(item._blob.data));

      if(dataHash !== item._blob.checksum.hash) continue;
      const blob = new Blob([ item._blob.data.base64 ], { type: item._blob.data.type });
      const blobSign = await this.#getSignature(blob);

      if(blobSign !== item.signature) continue;

      this.#items.push({
        id: item.id,
        mimeType: item.mimeType,
        maxAccessCount: item.maxAccessCount,
        lastAccessTime: item.lastAccessTime,
        signature: item.signature,
        size: blob.size,
        accessCount: item.accessCount,
        expireAfter: item.expireAfter,
        [item.mimeType]: blob,
      } as unknown as ClipboardItem);
    }

    return r();
  }

  async #getSignature(item: Blob): Promise<string> {
    const buffer = await item.arrayBuffer();
    return Hash.sha512(new TextDecoder().decode(buffer));
  }

  /**
   * Add an item to the virtual clipboard
   * 
   * @param {ClipboardItem} item
   * @returns {string} The id of the item
   */
  public async addItem(item: any, mimeType: string = 'text/plain', options?: NewItemOptions): Promise<string> {
    if(this.#readyState !== ReadyState.Interactive) {
      throw new Exception('VirtualClipboard is not ready yet. Please wait for the ready event');
    }

    const id = Crypto.uuid();
    const blob = new Blob([item], { type: mimeType });

    const obj = {
      id,
      [mimeType]: blob,
      signature: await this.#getSignature(blob),
      size: blob.size,
      accessCount: 0,
      lastAccessTime: 0,
      mimeType,
    };

    if(options?.maxAge && options.maxAge > 0) {
      obj.expireAfter = Date.now() + options.maxAge;
    }

    if(options?.maxAccessCount && is.isNumber(options.maxAccessCount)) {
      obj.maxAccessCount = options.maxAccessCount;
    }

    if(!(obj[mimeType] instanceof Blob)) {
      throw new Exception('Invalid item');
    }

    this.#items.push(obj as unknown as ClipboardItem);
    await this._saveContext();

    return id;
  }

  /**
   * Get all items from the virtual clipboard
   * @returns {ClipboardItem[]}
   */
  public getItems(): ClipboardItem[] {
    if(this.#readyState !== ReadyState.Interactive) {
      throw new Exception('VirtualClipboard is not ready yet. Please wait for the ready event');
    }

    return [ ...this.#items ];
  }

  /**
   * Clear all items from the virtual clipboard
   */
  public clearItems(): void {
    this.#items = [];
  }

  /**
   * Remove an item from the virtual clipboard
   * @param {string} id The id of the item to remove 
   */
  public async removeItem(id: string): Promise<void> {
    if(this.#readyState !== ReadyState.Interactive) {
      throw new Exception('VirtualClipboard is not ready yet. Please wait for the ready event');
    }

    this.#items = this.#items.filter(item => item.id !== id);
    await this._saveContext();
  }

  /**
   * Get the latest item from the virtual clipboard
   * 
   * @param {string} mimeType If not provided, the latest item will be returned otherwise the latest item with the provided mime type will be returned or null if not found
   * @returns {Promise<ClipboardItem | null>}
   */
  public async getLatestItem(mimeType?: string): Promise<ClipboardItem | null> {
    if(this.#readyState !== ReadyState.Interactive) {
      throw new Exception('VirtualClipboard is not ready yet. Please wait for the ready event');
    }

    if(this.length < 1) return null;
    let item: ClipboardItem | undefined;

    if(!mimeType) {
      item = this.#items.at(-1);
    } else {
      item = this.#items.filter(item => {
        return item[mimeType] && item[mimeType] instanceof Blob;
      }).at(-1);
    }

    if(!item) return null;

    if(item.maxAccessCount && item.accessCount && item.accessCount >= item.maxAccessCount) return (await ((async () => {
      await this.removeItem(item.id);
      return null;
    }))());

    item.accessCount = item.accessCount ? item.accessCount + 1 : 1;
    item.lastAccessTime = Date.now();
    await this._saveContext();

    if(!item.expireAfter) return item;

    if(Date.now() < item.expireAfter) return item;

    await this.removeItem(item.id);
    return null;
  }

  /**
   * Get an item from the virtual clipboard by id
   * 
   * @param {string} id The id of the item to get 
   * @returns {Promise<ClipboardItem | null>}
   */
  public async getItem(id: string): Promise<ClipboardItem | null> {
    if(this.#readyState !== ReadyState.Interactive) {
      throw new Exception('VirtualClipboard is not ready yet. Please wait for the ready event');
    }

    const item = this.#items.find(item => item.id === id);
    if(!item) return null;

    if(item.maxAccessCount && item.accessCount && item.accessCount >= item.maxAccessCount) return (await ((async () => {
      await this.removeItem(item.id);
      return null;
    }))());

    item.accessCount = item.accessCount ? item.accessCount + 1 : 1;
    item.lastAccessTime = Date.now();
    await this._saveContext();

    if(!item.expireAfter) return item;

    if(Date.now() < item.expireAfter) return item;

    await this.removeItem(item.id);
    return null;
  }

  /**
   * Add an event listener
   * 
   * @param {string} event  The name of the event to listen to
   * @param {Function} listener The listener function to add
   * @returns {EventEmitterSubscription} The subscription object
   */
  public addEventListener<K extends keyof VirtualClipboardEventsMap>(event: K, listener: ((event: VirtualClipboardEventsMap[K]) => unknown | Promise<unknown>)): EventEmitterSubscription {
    const subscription = this.#e.subscribe(event, listener);
    const signature = Hash.sha256(listener.toString());
    const id = (1 + this.#events.length) * 8 / 2;

    this.#events.push({
      ...subscription,
      signature,
      event,
      id,
    });

    return subscription;
  }

  /**
   * Remove an event listener
   * 
   * @param {string} event The name of the event to remove the listener from
   * @param {Function} listener The listener function to remove
   */
  public removeEventListener<K extends keyof VirtualClipboardEventsMap>(event: K, listener: ((event: VirtualClipboardEventsMap[K]) => unknown | Promise<unknown>)): void {
    const listenerSignature = Hash.sha256(listener.toString());
    const index = this.#events.findIndex(subscription => subscription.event === event && subscription.signature === listenerSignature);

    if(index < 0) return;

    const subscription = this.#events[index];
    subscription.unsubscribe();
    this.#events.splice(index, 1);
  }

  /**
   * Remove all event listeners for a specific event
   * 
   * @param {string} event The name of the event to remove all listeners from
   */
  public removeManyEventListeners<K extends keyof VirtualClipboardEventsMap>(event: K): void {
    const subscriptions = this.#events.filter(subscription => subscription.event === event);
    
    for(const subscription of subscriptions) {
      subscription.unsubscribe();
    }

    this.#events = this.#events.filter(subscription => subscription.event !== event);
  }

  /**
   * Remove all event listeners
   */
  public removeAllEventListeners(): void {
    for(const subscription of this.#events) {
      subscription.unsubscribe();
    }

    this.#events = [];
  }

  /**
   * Close the virtual clipboard and remove all event listeners.
   * 
   * The virtual clipboard will be unusable after closing it but the current items will be saved to the local storage.
   */
  public async close(): Promise<void> {
    this.removeAllEventListeners();
    await this._saveContext();
    
    this.#readyState = ReadyState.Closed;
    
    this.#e.emit('readystatechange', new ReadyStateChageEvent(this));
    this.#e.emit('close', new CloseEvent(this));
  }

  /**
   * Copy text to the virtual clipboard and the browser clipboard
   * @param {string} text
   */
  public async copyToClipboard(text: string): Promise<void> {
    if(!ssrSafeDocument) {
      throw new Exception('copyToClipboard can only be used in client side');
    }

    if(this.#readyState !== ReadyState.Interactive) {
      throw new Exception('VirtualClipboard is not ready yet. Please wait for the ready event');
    }

    const id = await this.addItem(text, 'text/plain');
    const item = await this.getItem(id);

    this.#e.emit('copy', new CopyEvent(item as ClipboardItem));

    try {
      await navigator.clipboard.writeText(text);
    } catch (err: any) {
      console.warn(`${new Date().getTime()} | [VirtualClipboard warn]: ${err.message || err}`);

      const textarea = ssrSafeDocument.createElement('textarea');
      textarea.value = text;
      ssrSafeDocument.body.appendChild(textarea);
      textarea.select();
      ssrSafeDocument.execCommand('copy');
      ssrSafeDocument.body.removeChild(textarea);
      textarea.remove();
    }
  }

  /**
   * Paste text from the virtual clipboard or the browser clipboard
   * @returns {string}
   */
  public async pasteFromClipboard(): Promise<string> {
    if(!ssrSafeDocument) {
      throw new Exception('pasteFromClipboard can only be used in client side rendering');
    }

    if(this.#readyState !== ReadyState.Interactive) {
      throw new Exception('VirtualClipboard is not ready yet. Please wait for the ready event');
    }

    try {
      const browserClipboardText = await navigator.clipboard.readText();
      this.#e.emit('paste', new PasteEvent(browserClipboardText));
      if(browserClipboardText) return browserClipboardText;
    } catch (err: any) {
      console.warn(`${new Date().getTime()} | [VirtualClipboard warn]: ${err.message || err}`);
    }

    // Fallback to virtual clipboard
    const virtualClipboardText = await this.getLatestItem('text/plain');
    if(!virtualClipboardText) return '';

    this.#e.emit('paste', new PasteEvent(virtualClipboardText));
    return virtualClipboardText['mime/type'].text();
  }

  /**
   * Get the length of items stored in the virtual clipboard
   * @returns {number}
   */
  public get length(): number {
    if(this.#readyState !== ReadyState.Interactive) return 0;
    return this.#items.length;
  }

  private async _saveContext(): Promise<void> {
    const items: SerializedItem[] = [];

    const serializeItem = (item: ClipboardItem) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          if(!reader.result) return reject(new Exception('Failed to serialize item'));
          const base64Data = (reader.result as string).split(',')[1]; // Get the base64 data
          
          const data = {
            type: item[item.mimeType].type,
            base64: base64Data,
          };

          const checksum = {
            algorithm: 'sha512',
            hash: Hash.sha512(JSON.stringify(data)),
          } satisfies SerializedItem['_blob']['checksum'];

          const obj = { ...item };
          delete obj[item.mimeType];

          items.push({
            ...obj,
            _blob: { data, checksum },
          } satisfies SerializedItem);

          resolve(obj);
        };

        reader.readAsDataURL(item[item.mimeType]);
      });
    };

    for(const item of this.getItems()) {
      await serializeItem(item);
    }
    
    const storage = jsonSafeStorage('localStorage');
    storage.setItem(this.#storageKey, items);
  }
}


/**
 * Copy text to clipboard using the Clipboard API if available
 * otherwise fallback to execCommand('copy')
 * @param {string} text 
 */
export async function copy(text: string): Promise<void> {
  if(!ssrSafeDocument) {
    throw new Exception('copy can not be used in server side rendering');
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (err: any) {
    console.warn(`${new Date().getTime()} | [warn]: ${err.message || err}`);
    
    const textarea = ssrSafeDocument.createElement('textarea');
    textarea.value = text;
    ssrSafeDocument.body.appendChild(textarea);
    textarea.select();
    ssrSafeDocument.execCommand('copy');
    ssrSafeDocument.body.removeChild(textarea);
    textarea.remove();
  }
}


/**
 * Paste text from clipboard using the Clipboard API if available
 * otherwise fallback to execCommand('paste')
 * @returns {string}
 */
export async function paste(): Promise<string> {
  if(!ssrSafeDocument) {
    throw new Exception('paste can not be used in server side rendering');
  }

  try {
    return await navigator.clipboard.readText();
  } catch (err: any) {
    console.warn(`${new Date().getTime()} | [warn]: ${err.message || err}`);
    
    const textarea = ssrSafeDocument.createElement('textarea');
    ssrSafeDocument.body.appendChild(textarea);
    textarea.select();
    ssrSafeDocument.execCommand('paste');
    const text = textarea.value;
    ssrSafeDocument.body.removeChild(textarea);
    textarea.remove();

    return text;
  }
}
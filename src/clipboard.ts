import { Exception } from './errors/exception';
import { ssrSafeDocument } from './ssr';


export type ClipboardEvent = 'copy' | 'cut' | 'paste';

export type ClipboardItem = {
  [mimeType: string]: Blob;
} & {
  text?: string;
};

export class VirtualClipboard {
  #items: ClipboardItem[];

  constructor() {
    if(!ssrSafeDocument) {
      throw new Exception('VirtualClipboard can only be used in server side rendering');
    }

    this.#items = [];
  }

  public get items(): ClipboardItem[] {
    return [ ...this.#items ];
  }
}


/**
 * Copy text to clipboard using the Clipboard API if available
 * otherwise fallback to execCommand('copy')
 * @param {string} text 
 */
export async function copy(text: string): Promise<void> {
  if(!ssrSafeDocument) {
    throw new Exception('copy can only be used in server side rendering');
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.warn(err);
    
    const textarea = ssrSafeDocument.createElement('textarea');
    textarea.value = text;
    ssrSafeDocument.body.appendChild(textarea);
    textarea.select();
    ssrSafeDocument.execCommand('copy');
    ssrSafeDocument.body.removeChild(textarea);
  }
}


/**
 * Paste text from clipboard using the Clipboard API if available
 * otherwise fallback to execCommand('paste')
 * @returns {string}
 */
export async function paste(): Promise<string> {
  if(!ssrSafeDocument) {
    throw new Exception('paste can only be used in server side rendering');
  }

  try {
    return await navigator.clipboard.readText();
  } catch (err) {
    console.warn(err);
    
    const textarea = ssrSafeDocument.createElement('textarea');
    ssrSafeDocument.body.appendChild(textarea);
    textarea.select();
    ssrSafeDocument.execCommand('paste');
    const text = textarea.value;
    ssrSafeDocument.body.removeChild(textarea);

    return text;
  }
}
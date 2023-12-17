import HttpStatusCodes from './helpers/status-code';
import { Exception } from '../errors/exception';
import { Comparator } from '../math';
import { type Dict } from '../types';
import { Headers } from './headers';


export interface IResponse {
  readonly responseTime: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly status: number;
  readonly ok: boolean;

  clone(): Response;
}

export class BodyParser {
  readonly #buffer: ArrayBuffer;
  readonly #hasBody?: boolean;
  #bodyUsed: boolean;

  public readonly size: number;

  public get bodyUsed(): boolean {
    return this.#bodyUsed;
  }

  constructor(body?: ArrayBuffer) {
    if(!!body && !(body instanceof ArrayBuffer)) {
      throw new Exception('Invalid body.', { expected: 'ArrayBuffer', received: typeof body });
    }

    this.#hasBody = (
      body && 
      (body instanceof ArrayBuffer)
    );

    this.#buffer = body!;
    this.#bodyUsed = false;
    this.size = body?.byteLength ?? 0;
  }

  public async json<T>(): Promise<T> {
    if(this.#bodyUsed) {
      throw new Exception('Cannot parse body twice.');
    }

    let text = '';

    if(!this.#hasBody) {
      this.#bodyUsed = true;
      text = JSON.stringify('"[empty]"');
    } else {
      text = await this.text();
    }

    return JSON.parse(text);
  }

  public async blob(): Promise<Blob> {
    if(!this.#hasBody) {
      throw new Exception('Cannot parse an empty response body to blob');
    }

    if(this.#bodyUsed) {
      throw new Exception('Cannot parse body twice.');
    }

    this.#bodyUsed = true;
    return new Blob([this.#buffer]);
  }

  public async arrayBuffer(): Promise<ArrayBuffer> {
    if(!this.#hasBody) {
      throw new Exception('Cannot parse an empty response body to array buffer');
    }

    if(this.#bodyUsed) {
      throw new Exception('Cannot parse body twice.');
    }

    this.#bodyUsed = true;
    return this.#buffer;
  }

  public text(encoding: BufferEncoding = 'utf-8'): Promise<string> {
    return this.#extractText(encoding);
  }

  public stream(): Promise<ReadableStream<Uint8Array>> {
    return this.#createStream();
  }

  async #createStream() {
    if(!this.#hasBody) {
      throw new Exception('Cannot parse an empty response body to readable stream');
    }

    if(this.#bodyUsed) {
      throw new Exception('Cannot parse body twice.');
    }

    const uint8Array = new Uint8Array(this.#buffer);

    const readableStream = new ReadableStream<Uint8Array>({
      start: (controller: ReadableStreamDefaultController<Uint8Array>) => {
        controller.enqueue(uint8Array);
        controller.close();
      },
    });

    this.#bodyUsed = true;
    return readableStream;
  }

  async #extractText(encoding: BufferEncoding = 'utf-8') {
    if(!this.#hasBody) return (() => {
      this.#bodyUsed = true;
      return '[empty]';
    })();
    
    if(this.#bodyUsed) {
      throw new Exception('Cannot parse body twice.');
    }

    this.#bodyUsed = true;

    const decoder = new TextDecoder(encoding ?? 'utf-8');
    const dataView = new DataView(this.#buffer);
    const decodedString = decoder.decode(dataView);
    return decodedString;
  }
}


export type ResponseProps = {
  status: number;
  responseTime: number;
  headers: Dict<string>;
}

export class Response extends BodyParser implements IResponse {
  #body: ArrayBuffer;

  public readonly responseTime: number;
  public readonly statusText: string;
  public readonly headers: Headers;
  public readonly status: number;
  public readonly ok: boolean;

  constructor(body: ArrayBuffer, props: ResponseProps) {
    super(body);

    this.#body = body;
    this.status = props.status;
    this.headers = Headers.from(props.headers);
    this.ok = (2 === ((props.status / 100) | 0));
    this.responseTime = Number(Number(props.responseTime).toFixed(2));

    const c = new Comparator();

    this.statusText = c.isBetween(props.status, 100, 511, true) ?
      HttpStatusCodes[props.status] :
      'Unknown status code';
  }

  public clone(): Response {
    if(this.bodyUsed) {
      throw new Exception('Cannot clone a used body.');
    }

    return new Response(
      this.#body,
      {
        status: this.status,
        headers: this.headers.toObject() as Dict<string>,
        responseTime: this.responseTime,
      } // eslint-disable-line comma-dangle
    );
  }
}

export default Response;
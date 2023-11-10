'use strict';

import stream from 'stream';

import { ssrSafeWindow } from '../../ssr';
import { Exception } from '../../errors/exception';


/**
 * A Transform stream that adds zlib headers to a stream if they are not present.
 * 
 * @see https://github.com/axios/axios/blob/v1.x/lib/helpers/ZlibHeaderTransformStream.js
 */
export class ZlibHeaderTransformStream extends stream.Transform {
  constructor(options?: stream.TransformOptions) {
    if(ssrSafeWindow) {
      throw new Exception('ZlibHeaderTransformStream is not available in browser environments.');
    }

    super(options);
  }

  __transform(chunk: any, encoding: stream.TransformOptions['encoding'], callback: stream.TransformCallback): void {
    encoding;
    this.push(chunk);
    callback();
  }

  _transform(chunk: any, encoding: stream.TransformOptions['encoding'], callback: stream.TransformCallback): void {
    if(chunk.length !== 0) {
      this._transform = this.__transform;

      // Add Default Compression headers if no zlib headers are present
      if (chunk[0] !== 120) { // Hex: 78
        const header = Buffer.alloc(2);
        header[0] = 120; // Hex: 78
        header[1] = 156; // Hex: 9C 

        this.push(header, encoding);
      }
    }

    this.__transform(chunk, encoding, callback);
  }
}

export default ZlibHeaderTransformStream;
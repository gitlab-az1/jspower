'use strict';


import * as zlib from 'node:zlib';


/** An empty buffer */
export const EMPTY_BUFFER = Buffer.alloc(0);


/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 * @public
 */
function _mask(source: Buffer, mask: Buffer, output: Buffer, offset: number, length: number): void {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
}

/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 * @public
 */
function _unmask(buffer: Buffer, mask: Buffer): void {
  for(let i = 0; i < buffer.length; i++) {
    buffer[i] ^= mask[i & 3];
  }
}

/**
 * Converts a buffer to an `ArrayBuffer`.
 *
 * @param {Buffer} buf The buffer to convert
 * @return {ArrayBuffer} Converted buffer
 * @public
 */
export function toArrayBuffer(buf: Buffer): ArrayBuffer {
  if(buf.length === buf.buffer.byteLength) return buf.buffer;
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
}


/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 * @public
 */
export function mask(source: Buffer, mask: Buffer, output: Buffer, offset: number, length: number): void {
  // eslint-disable-next-line no-extra-boolean-cast
  if(!!process.env.TYPESDK_CONTROLS_NO_BUFFER_UTILS) return _mask(source, mask, output, offset, length);
  if(length < 48) return _mask(source, mask, output, offset, length);

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bufferUtil = require('bufferutil');
    return bufferUtil.mask(source, mask, output, offset, length);

    // eslint-disable-next-line no-empty
  } catch {}
}


/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 * @public
 */
export function unmask(buffer: Buffer, mask: Buffer): void {
  // eslint-disable-next-line no-extra-boolean-cast
  if(!!process.env.TYPESDK_CONTROLS_NO_BUFFER_UTILS) return _unmask(buffer, mask);
  if(buffer.length < 32) return _unmask(buffer, mask);

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bufferUtil = require('bufferutil');
    return bufferUtil.unmask(buffer, mask);

    // eslint-disable-next-line no-empty
  } catch {}
}


/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 * @public
 */
export const unsafeMask = _mask;

/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 * @public
 */
export const unsafeUnmask = _unmask;


/**
 * Compresses the given buffer with deflate.
 * 
 * @param {Buffer} source The buffer to compress 
 * @param {zlib.ZlibOptions} options (Optional) The options to use 
 * @returns {Buffer} The compressed buffer as a promise that resolves with it
 */
export function compress(source: Buffer, options?: zlib.ZlibOptions): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    if(
      !!options &&
      typeof options === 'object'
    ) {
      zlib.deflate(source, options, (err, result) => {
        if(err) return reject(err);
        resolve(result);
      });
    } else {
      zlib.deflate(source, (err, result) => {
        if(err) return reject(err);
        resolve(result);
      });
    }
  });
}

/**
 * Decompresses the given buffer with inflate.
 * 
 * @param {Buffer} buf The buffer to decompress 
 * @param {zlib.ZlibOptions} options (Optional) The options to use 
 * @returns {Buffer} The decompressed buffer as a promise that resolves with it
 */
export function decompress(buf: Buffer, options?: zlib.ZlibOptions): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    if(
      !!options &&
        typeof options === 'object'
    ) {
      zlib.inflate(buf, options, (err, result) => {
        if(err) return reject(err);
        resolve(result);
      });
    } else {
      zlib.inflate(buf, (err, result) => {
        if(err) return reject(err);
        resolve(result);
      });
    }
  });
}

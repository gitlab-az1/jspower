import * as stream from 'stream';

import type { Dict, GenericFunction } from '../../types';
import { throttle, toFlatObject } from '../../utils';
import { Exception } from '../../errors/exception';
import { speedometer } from '../../speedometer';
import { isUndefined } from '../../utils/is';
import { ssrSafeWindow } from '../../ssr';


const $I = Symbol('internals');

type Internals = {
  length: number;
  timeWindow: number;
  ticksRate: number;
  chunkSize: number;
  maxRate: number;
  minChunkSize: number | false;
  bytesSeen: number;
  isCaptured: boolean;
  notifiedBytesLoaded: number;
  ts: number;
  bytes: number;
  onReadCallback: null | GenericFunction;
  updateProgress?: GenericFunction;
}


/**
 * Transform stream with progress event
 * 
 * @license MIT
 * @copyright axios
 * @see https://github.com/axios/axios/blob/v1.x/lib/helpers/AxiosTransformStream.js
 */
export class TransformStream extends stream.Transform {
  private readonly [$I]: Internals;

  constructor(options: Dict<any>) {
    if(ssrSafeWindow) {
      throw new Exception('TransformStream is not available in browser environments.');
    }

    options = toFlatObject(options, {
      maxRate: 0,
      chunkSize: 64 * 1024,
      minChunkSize: 100,
      timeWindow: 500,
      ticksRate: 2,
      samplesCount: 15,
    }, undefined, (prop, src) => {
      return !isUndefined((src as Dict<any>)[prop]);
    });

    super({ readableHighWaterMark: options.chunkSize });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    const internals: Internals = this[$I] = {
      length: options.length,
      timeWindow: options.timeWindow,
      ticksRate: options.ticksRate,
      chunkSize: options.chunkSize,
      maxRate: options.maxRate,
      minChunkSize: options.minChunkSize,
      bytesSeen: 0,
      isCaptured: false,
      notifiedBytesLoaded: 0,
      ts: Date.now(),
      bytes: 0,
      onReadCallback: null,
    };

    const _speedometer = speedometer(internals.ticksRate * options.samplesCount, internals.timeWindow);

    this.on('newListener', event => {
      if (event === 'progress') {
        if (!internals.isCaptured) {
          internals.isCaptured = true;
        }
      }
    });

    let bytesNotified = 0;

    internals.updateProgress = throttle(function throttledHandler() {
      const totalBytes = internals.length;
      const bytesTransferred = internals.bytesSeen;
      const progressBytes = bytesTransferred - bytesNotified;
      if (!progressBytes || self.destroyed) return;

      const rate = _speedometer(progressBytes);

      bytesNotified = bytesTransferred;

      process.nextTick(() => {
        self.emit('progress', {
          'loaded': bytesTransferred,
          'total': totalBytes,
          'progress': totalBytes ? (bytesTransferred / totalBytes) : undefined,
          'bytes': progressBytes,
          'rate': rate ? rate : undefined,
          'estimated': rate && totalBytes && bytesTransferred <= totalBytes ?
            (totalBytes - bytesTransferred) / rate : undefined,
        });
      });
    }, internals.ticksRate);

    const onFinish = () => {
      internals.updateProgress?.(true);
    };

    this.once('end', onFinish);
    this.once('error', onFinish);
  }

  _read(size: number) {
    const internals = this[$I];

    if (internals.onReadCallback) {
      internals.onReadCallback();
    }

    return super._read(size);
  }

  _transform(chunk: any, encoding: stream.TransformOptions['encoding'], callback: stream.TransformCallback) {
    encoding;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const internals = this[$I];
    const maxRate = internals.maxRate;

    const readableHighWaterMark = this.readableHighWaterMark;

    const timeWindow = internals.timeWindow;

    const divider = 1000 / timeWindow;
    const bytesThreshold = (maxRate / divider);
    const minChunkSize = internals.minChunkSize !== false ? Math.max(internals.minChunkSize, bytesThreshold * 0.01) : 0;

    function pushChunk(_chunk: any, _callback: GenericFunction) {
      const bytes = Buffer.byteLength(_chunk);
      internals.bytesSeen += bytes;
      internals.bytes += bytes;

      if (internals.isCaptured) {
        internals.updateProgress?.();
      }

      if (self.push(_chunk)) {
        process.nextTick(_callback);
      } else {
        internals.onReadCallback = () => {
          internals.onReadCallback = null;
          process.nextTick(_callback);
        };
      }
    }

    const transformChunk = (_chunk: any, _callback: GenericFunction): any => {
      const chunkSize = Buffer.byteLength(_chunk);
      let chunkRemainder: any = null;
      let maxChunkSize = readableHighWaterMark;
      let bytesLeft;
      let passed = 0;

      if (maxRate) {
        const now = Date.now();

        if (!internals.ts || (passed = (now - internals.ts)) >= timeWindow) {
          internals.ts = now;
          bytesLeft = bytesThreshold - internals.bytes;
          internals.bytes = bytesLeft < 0 ? -bytesLeft : 0;
          passed = 0;
        }

        bytesLeft = bytesThreshold - internals.bytes;
      }

      if (maxRate) {
        if ((bytesLeft!) <= 0) return setTimeout(() => {
          _callback(null, _chunk);
        }, timeWindow - passed); // next time window

        if ((bytesLeft!) < maxChunkSize) {
          maxChunkSize = bytesLeft!;
        }
      }

      if (maxChunkSize && chunkSize > maxChunkSize && (chunkSize - maxChunkSize) > minChunkSize) {
        chunkRemainder = _chunk.subarray(maxChunkSize);
        _chunk = _chunk.subarray(0, maxChunkSize);
      }

      pushChunk(_chunk, chunkRemainder ? () => {
        process.nextTick(_callback, null, chunkRemainder);
      } : _callback);
    };

    transformChunk(chunk, function transformNextChunk(err, _chunk) {
      if (err) {
        return callback(err);
      }

      if (_chunk) {
        transformChunk(_chunk, transformNextChunk);
      } else {
        callback(null);
      }
    });
  }

  setLength(length: number): this {
    this[$I].length = +length;
    return this;
  }
}

export default TransformStream;
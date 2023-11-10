'use strict';


/**
 * Calculate data maxRate
 * 
 * @license MIT
 * @copyright axios
 * @see https://github.com/axios/axios/blob/v1.x/lib/helpers/combineURLs.js
 * 
 * @param {Number} [samplesCount= 10]
 * @param {Number} [min= 1000]
 * @returns {Function}
 */
export function speedometer(samplesCount: number = 10, min: number = 100): ((chunkLength: number) => number | undefined) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS: number;

  min = min !== undefined ? min : 1000;

  return function push(chunkLength: number) {
    const now = Date.now();

    const startedAt = timestamps[tail];

    if (!firstSampleTS) {
      firstSampleTS = now;
    }

    bytes[head] = chunkLength;
    timestamps[head] = now;

    let i = tail;
    let bytesCount = 0;

    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }

    head = (head + 1) % samplesCount;

    if(head === tail) {
      tail = (tail + 1) % samplesCount;
    }

    if(now - firstSampleTS < min) return;

    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
  };
}

export default speedometer;
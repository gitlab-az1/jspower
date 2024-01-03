'use strict';


const _errno = {
  success: 0x0,
  invalid: 0x1,
  operation_aborted: 0x2,
  operation_failed: 0x3,
  invalid_operation: 0x4,
  invalid_argument: 0x5,
  retry_timeout: 0x6,
  retry_limit_exceeded: 0x7,
  non_retriable: 0x8,
  lock_timeout: 0x9,
  lock_limit_exceeded: 0xa,
  gateway_timeout: 0xb,
  invalid_ready_state: 0xc,
} as const;


/** Error number enumeration. */
export const errno = Object.freeze({ ..._errno }) as typeof _errno;


const _binTypes = ['nodebuffer', 'arraybuffer', 'fragments'] as const;

/**
 * Binary types enumeration.
 * 
 * - `nodebuffer` - Node.js Buffer
 * - `arraybuffer` - ArrayBuffer
 * - `fragments` - Array of ArrayBuffer
 */
export const binaryTypes = Object.freeze([ ..._binTypes ]) as typeof _binTypes;


/** No operation function. */
export const noop = () => void 0;

/** The global unique identifier of the PS Client. */
export const GUID = '70A7AF8F-DF56-4158-86C0-DBA130B496A2';
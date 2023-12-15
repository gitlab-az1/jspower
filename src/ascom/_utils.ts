
/**
 * The operation was completed successfully
 */
export const EXIT_SUCCESS = 0x0;

/**
 * This operations is not permitted in the current context
 */
export const ERR_OPERATION_NOT_PERMITTED = 0x1;

/**
 * The signature of the data does not match the expected signature
 */
export const ERR_INVALID_SIGNATURE = 0x2;

/**
 * Virtual memory blocks readed with the method `read` cannot be readed as a Buffer
 */
export const ERR_READ_BUFFER_AS_LITERAL = 0x3;

/**
 * Virtual memory blocks readed with the method `readBuffer` cannot be readed as a literal object
 */
export const ERR_READ_LITERAL_AS_BUFFER = 0x4;

/**
 * The address is invalid
 */
export const ERR_INVALID_ADDRESS = 0x5;


/**
 * Get the error message for a given error code from ascom
 * 
 * @param {number} code The exit code
 * @returns {string} The error message
 */
export function errnoMessage(code: number): string {
  return (
    (({
      0x0: 'Success',
      0x1: 'Operation not permitted',
      0x2: 'Invalid signature',
      0x3: 'Cannot read a buffer as a literal object',
      0x4: 'Cannot read a literal object as a buffer',
      0x5: 'Invalid address',
    })[code < 0 ? code * -1 : code]) || 'Unknown error'
  );
}
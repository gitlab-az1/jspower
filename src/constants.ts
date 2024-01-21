
/**
 * The root path of the project
 */
export const root = process?.cwd();

/**
 * Whether the project is running in production mode
 */
export const isProduction = (process?.env.NODE_ENV === 'production' ||
  process?.env.NEXT_PUBLIC_NODE_ENV === 'production');


/**
 * Whether the project is running in node-js runtime environment
 */
export const isNode = (typeof process !== 'undefined' &&
  Object.prototype.toString.call(process) === '[object process]' &&
  process.release &&
  process.release.name === 'node');


/**
 * Whether the project is running in a browser environment
 */
export const isBrowser = (typeof window !== 'undefined' &&
  typeof document !== 'undefined');


/**
 * permission for files created by the app `[chmod 644]`.
 * 
 * permissions role:
 * `rw-r--r--`
 * 
 * `owner: read, write`
 * 
 * `group: read`
 * 
 * `others: read`
 * 
 * ```js
 * 0o644
 * ```
 * 
 * @example
 * ```js
 * import fs from 'node:fs'
 * fs.writeFileSync('new-file.txt', 'Hello World!', { mode: 0o644, encoding: 'utf-8' });
 * ```
 */
export const FILE_PERMISSION = 0o644;

/**
 * permission for folders created by the app `[chmod 755]`.
 * 
 * permissions role:
 * `rwxr-xr-x`
 * 
 * `owner: read, write, execute`
 * 
 * `group: read, execute`
 * 
 * `others: read, execute`
 * 
 * ```js
 * 0o755 
 * ```
 * 
 * @example
 * ```js
 * import fs from 'node:fs';
 * await fs.mkdirSync('new-folder', { mode: 0o755 });
 * ```
 */
export const FOLDER_PERMISSION = 0o755;


/**
 * The maximum value of a 32-bit integer
 */
export const MAX_INT_32 = (2 ** 31) - 1;



export default Object.freeze({
  root,
  isNode,
  isBrowser,
  MAX_INT_32,
  isProduction,
  FILE_PERMISSION,
  FOLDER_PERMISSION,
});
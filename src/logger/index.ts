export { removeAsciCharacters, formatMessage } from './_utils';
export { default as consoleLogger } from './console';

import { Logger, type LoggerOptions } from './_types';
import { isProduction } from '../constants';
import c from './console';


export function createLogger(options?: LoggerOptions): Logger {
  if(isProduction) {
    throw new Error('Logger is not available in production yet');
  }

  return c(options);
}
export { removeAsciCharacters, formatMessage } from './_utils';
export { default as consoleLogger } from './console';
export { Logger } from './_types';

import { isProduction } from '../constants';
import { Logger } from './_types';
import c from './console';


export function createLogger(): Logger {
  if(isProduction) {
    throw new Error('Logger is not available in production yet');
  }

  return c();
}
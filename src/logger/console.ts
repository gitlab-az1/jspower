import { Logger } from './_types';
import { formatMessage } from './_utils';


export default (function(): Logger {
  const info = (message: any): void => {
    console.log(formatMessage(message, 'info'));
  };

  const success = (message: any): void => {
    console.log(formatMessage(message, 'success'));
  };

  const warn = (message: any): void => {
    console.log(formatMessage(message, 'warn'));
  };

  const error = (message: any): void => {
    console.log(formatMessage(message, 'error'));
  };

  const debug = (message: any): void => {
    console.log(formatMessage(message, 'debug'));
  };

  const trace = (message: any): void => {
    console.log(formatMessage(message, 'trace'));
  };

  return Object.freeze({
    info,
    success,
    warn,
    error,
    debug,
    trace,
  });
});
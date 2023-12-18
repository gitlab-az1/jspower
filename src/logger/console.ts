import { Logger, type LoggerOptions } from './_types';
import { formatMessage } from './_utils';


export default (function(options?: LoggerOptions): Logger {
  const info = (message: any): void => {
    console.log(formatMessage(message, 'info', options));
  };

  const success = (message: any): void => {
    console.log(formatMessage(message, 'success', options));
  };

  const warn = (message: any): void => {
    console.log(formatMessage(message, 'warn', options));
  };

  const error = (message: any): void => {
    console.log(formatMessage(message, 'error', options));
  };

  const debug = (message: any): void => {
    console.log(formatMessage(message, 'debug', options));
  };

  const trace = (message: any): void => {
    console.log(formatMessage(message, 'trace', options));
  };

  const fatal = (message: any): void => {
    console.log(formatMessage(message, 'fatal', options));
  };

  return Object.freeze({
    info,
    success,
    warn,
    error,
    debug,
    trace,
    fatal,
  });
});
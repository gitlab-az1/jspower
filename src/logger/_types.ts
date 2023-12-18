export interface Logger {
  info(message: any): void;
  success(message: any): void;
  warn(message: any): void;
  error(message: any): void;
  debug(message: any): void;
  trace(message: any): void;
  fatal(message: any): void;
}


export type LoggerOptions = {
  hideDate?: boolean;
};
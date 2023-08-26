interface ILogger {
  log(message: string): void;
  debug(message: string): void;
  trace(message: string): void;
  info(message: string): void;
  warning(message: string): void;
  error(message: string): void;
}

export default ILogger;

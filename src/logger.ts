import ILogger from './logger.interface';

class Logger implements ILogger {
  public log(message: string) {
    console.log(message);
  }

  public debug(message: string) {
    console.debug(message);
  }

  public trace(message: string) {
    console.trace(message);
  }

  public info(message: string) {
    console.info(message);
  }

  public warning(message: string) {
    console.warn(message);
  }

  public error(message: string) {
    console.error(message);
  }
}

export default Logger;

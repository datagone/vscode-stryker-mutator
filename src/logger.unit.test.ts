import { ILogger, Logger } from './logger';
import { mockConsoleLog } from './test-helpers';

mockConsoleLog();

let consoleLogSpy: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let consoleDebugSpy: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let consoleTraceSpy: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let consoleInfoSpy: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let consoleWarningSpy: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let logger: ILogger;

beforeEach(() => {
  // Arrange (GIVEN)
  jest.clearAllMocks();

  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  consoleTraceSpy = jest.spyOn(console, 'trace').mockImplementation();
  consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
  consoleWarningSpy = jest.spyOn(console, 'warn').mockImplementation();
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  logger = new Logger();
});

afterEach(() => {
  // Cleanup
  consoleLogSpy.mockRestore();
  consoleDebugSpy.mockRestore();
  consoleTraceSpy.mockRestore();
  consoleInfoSpy.mockRestore();
  consoleWarningSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

describe('WHEN logging', () => {
  describe('GIVEN a specific message', () => {
    it('THEN console.log is called', () => {
      // Arrange (GIVEN)
      const messageToLog = 'message to log';

      // Act (WHEN)
      logger.log(messageToLog);

      // Assert (THEN)
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(messageToLog);
    });
  });
});

describe('WHEN logging as debug', () => {
  describe('GIVEN a message used for debugging', () => {
    it('THEN console.debug is called', () => {
      // Arrange (GIVEN)
      const debugMessageToLog = 'debug message to log';

      // Act (WHEN)
      logger.debug(debugMessageToLog);

      // Assert (THEN)
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      expect(consoleDebugSpy).toHaveBeenCalledWith(debugMessageToLog);
    });
  });
});

describe('WHEN logging for trace', () => {
  describe('GIVEN a message used for tracing', () => {
    it('THEN console.trace is called', () => {
      // Arrange (GIVEN)
      const traceMessageToLog = 'trace message to log';

      // Act (WHEN)
      logger.trace(traceMessageToLog);

      // Assert (THEN)
      expect(consoleTraceSpy).toHaveBeenCalledTimes(1);
      expect(consoleTraceSpy).toHaveBeenCalledWith(traceMessageToLog);
    });
  });
});

describe('WHEN logging as informational', () => {
  describe('GIVEN an informational message', () => {
    it('THEN console.info is called', () => {
      // Arrange (GIVEN)
      const informationalMessageToLog = 'information message to log';

      // Act (WHEN)
      logger.info(informationalMessageToLog);

      // Assert (THEN)
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledWith(informationalMessageToLog);
    });
  });
});

describe('WHEN logging as warning', () => {
  describe('GIVEN a warning message', () => {
    it('THEN console.warn is called', () => {
      // Arrange (GIVEN)
      const warningMessageToLog = 'warning message to log';

      // Act (WHEN)
      logger.warning(warningMessageToLog);

      // Assert (THEN)
      expect(consoleWarningSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarningSpy).toHaveBeenCalledWith(warningMessageToLog);
    });
  });
});

describe('WHEN logging as an error', () => {
  describe('GIVEN an error message', () => {
    it('THEN console.warn is called', () => {
      // Arrange (GIVEN)
      const errorMessageToLog = 'error message to log';

      // Act (WHEN)
      logger.error(errorMessageToLog);

      // Assert (THEN)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessageToLog);
    });
  });
});

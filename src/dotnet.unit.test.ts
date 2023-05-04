import { Uri } from '../__mocks__/vscode';
import { executeCommandWithArguments, isValidToRegex } from './cli-exec';
import { Dotnet, DotnetType } from './dotnet';
import { ILogger } from './logger';
import { StrykerConfigurationType } from './stryker-configuration';
import { mockConsoleLog } from './test-helpers';
import { when } from 'jest-when';

jest.mock('./cli-exec');
jest.mock('./logger');
jest.mock('./stryker-configuration');

mockConsoleLog();

describe('WHEN executing the dotnet command', () => {
  let dotnetClass: DotnetType;
  let spyLogger: ILogger;
  let strykerConfig: StrykerConfigurationType;
  let mockExecuteCommand: jest.MockedFn<typeof executeCommandWithArguments>;
  let mockIsValidToRegex: jest.MockedFn<typeof isValidToRegex>;

  const stdoutExecuteCommandResult: string = 'This is the default output';

  beforeEach(() => {
    // Arrange (GIVEN)
    jest.clearAllMocks();

    spyLogger = {
      log: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
    };

    strykerConfig = {
      initializeBasicConfiguration: jest.fn(),
      createStrykerConfigurationFile: jest.fn(),
    };

    mockExecuteCommand = executeCommandWithArguments as jest.MockedFn<typeof executeCommandWithArguments>;
    mockIsValidToRegex = isValidToRegex as jest.MockedFn<typeof isValidToRegex>;

    dotnetClass = new Dotnet(strykerConfig, spyLogger);

    mockExecuteCommand.mockResolvedValue(stdoutExecuteCommandResult);
    mockIsValidToRegex.mockResolvedValue(true);
  });

  afterEach(() => {
    // Assert (WHEN)
    expect(executeCommandWithArguments).toHaveBeenCalled();
    expect(isValidToRegex).toHaveBeenCalled();

    // Cleanup
    mockExecuteCommand.mockRestore();
    mockIsValidToRegex.mockRestore();
  });

  describe('GIVEN dotnet sdk is present', () => {
    it('THEN it should resolves with the underlying executeCommand called with the required arguments', async () => {
      // Arrange (GIVEN)
      const requiredArguments: string[] = ['--version'];

      // Act (WHEN)
      const result: Promise<boolean> = (dotnetClass as Dotnet).isSdkInstalled();
      // Assert (THEN)
      await expect(result).resolves.toBe(true);
      expect(executeCommandWithArguments).toHaveBeenCalledTimes(1);
      expect(executeCommandWithArguments).toHaveBeenCalledWith(requiredArguments);
      expect(isValidToRegex).toHaveBeenCalledTimes(1);
    });
  });

  describe('GIVEN dotnet stryker tool is present', () => {
    it('THEN it should resolves with the underlying executeCommand called with the required arguments', async () => {
      // Arrange (GIVEN)
      const requiredArguments: string[] = ['tool', 'list', '--global'];

      // Act (WHEN)
      const result: Promise<boolean> = dotnetClass.isStrykerToolInstalled();
      // Assert (THEN)
      await expect(result).resolves.toBe(true);
      expect(executeCommandWithArguments).toHaveBeenCalledWith(requiredArguments);
    });
  });

  describe('GIVEN the installation of the dotnet stryker', () => {
    const requiredArguments: string[] = ['tool', 'install', '--global', 'dotnet-stryker'];

    beforeEach(() => {
      mockExecuteCommand.mockImplementation((val: string[]) => {
        if (val.includes('--version')) {
          return Promise.resolve('1.2.3');
        }
        if (val.includes('list')) {
          return Promise.resolve('dotnet-stryker    1.2.3    dotnet-stryker');
        }
        if (val.includes('install')) {
          return Promise.resolve("Tool 'dotnet-stryker' (version '1.2.3') was successfully installed");
        }
        if (val.includes('uninstall')) {
          return Promise.resolve("Tool 'dotnet-stryker' (version '1.2.3') was successfully uninstalled.");
        }
        return Promise.reject('error in ExecuteCommand');
      });
    });

    afterEach(() => {
      // Assert (THEN)
      expect(spyLogger.log).toHaveBeenCalledWith('Task : Install the dotnet-stryker tool');
    });

    describe('AND GIVEN the installation is already done', () => {
      it('THEN it should not try to install it', async () => {
        // Arrange (GIVEN)
        mockExecuteCommand.mockImplementation((val: string[]) => {
          if (val.includes('--version')) {
            return Promise.resolve('1.2.3');
          } else if (val.includes('list')) {
            return Promise.resolve('dotnet-stryker    1.2.3    dotnet-stryker');
          } else if (val.includes('install')) {
            return Promise.resolve("Tool 'dotnet-stryker' (version '1.2.3') was successfully installed");
          }
          return Promise.reject('error in ExecuteCommand');
        });

        mockIsValidToRegex.mockImplementation((value: string, pattern: string): Promise<boolean> => {
          value = value.trim();
          if (pattern.includes('dotnet-stryker(\\s*)((\\d+\\.)*\\d+)(\\s*)dotnet-stryker')) {
            return Promise.resolve(true);
          } else if (pattern === '^(\\d+\\.)*\\d+$') {
            return Promise.resolve(true);
          }
          return Promise.reject('error in IsValidToRegex');
        });
        // Act (WHEN)
        const result: Promise<boolean> = dotnetClass.installStrykerTool();
        // Assert (THEN)
        await expect(result).resolves.toBe(true);
        expect(executeCommandWithArguments).toHaveBeenCalledTimes(2);
        expect(executeCommandWithArguments).not.toHaveBeenCalledWith(requiredArguments);
        expect(isValidToRegex).toHaveBeenCalledTimes(2);
        expect(spyLogger.log).toHaveBeenCalledTimes(1);
      });
    });

    describe('AND GIVEN the installation was not done', () => {
      it('THEN it should be installed', async () => {
        // Arrange (GIVEN)
        mockExecuteCommand.mockImplementation((val: string[]) => {
          if (val.includes('--version')) {
            return Promise.resolve('1.2.3');
          } else if (val.includes('list')) {
            return Promise.resolve(' ');
          } else if (val.includes('install')) {
            return Promise.resolve("Tool 'dotnet-stryker' (version '1.2.3') was successfully installed");
          }
          return Promise.reject('error in ExecuteCommand');
        });
        mockIsValidToRegex.mockImplementation((value: string, pattern: string): Promise<boolean> => {
          if (value === ' ' && pattern.includes('dotnet-stryker')) {
            return Promise.resolve(false);
          } else if (
            value.includes('dotnet-stryker') &&
            pattern.includes('dotnet-stryker') &&
            pattern.includes('successfully installed')
          ) {
            return Promise.resolve(true);
          } else if (pattern === '^(\\d+\\.)*\\d+$') {
            return Promise.resolve(true);
          }
          return Promise.reject('error in IsValidToRegex');
        });
        // Act (WHEN)
        const result: Promise<boolean> = dotnetClass.installStrykerTool();
        // Assert (THEN)
        await expect(result).resolves.toBe(true);
        expect(executeCommandWithArguments).toHaveBeenCalledTimes(3);
        expect(executeCommandWithArguments).toHaveBeenCalledWith(requiredArguments);
        expect(isValidToRegex).toHaveBeenCalledTimes(3);
        expect(spyLogger.log).toHaveBeenCalledTimes(3);
        expect(spyLogger.log).toHaveBeenCalledWith('dotnet-stryker tool is not already installed');
        expect(spyLogger.log).toHaveBeenCalledWith('Installing dotnet-stryker tool');
      });
    });

    describe('AND GIVEN the installation failed', () => {
      it('THEN it should reject AND NOT call The validationRegex after that', async () => {
        // Arrange (GIVEN)
        const expectedErrorMessage: string = 'Failed Installation';
        mockExecuteCommand.mockImplementation((val: string[]) => {
          if (val.includes('--version')) {
            return Promise.resolve('1.2.3');
          } else if (val.includes('list')) {
            return Promise.resolve(' ');
          } else if (val.includes('install')) {
            return Promise.reject(expectedErrorMessage);
          }
          return Promise.reject('error in ExecuteCommand');
        });
        mockIsValidToRegex.mockImplementation((value: string, pattern: string): Promise<boolean> => {
          if (value === expectedErrorMessage) {
            return Promise.resolve(false);
          }
          if (value === ' ' && pattern.includes('dotnet-stryker')) {
            return Promise.resolve(false);
          } else if (
            value.includes('dotnet-stryker') &&
            pattern.includes('dotnet-stryker') &&
            pattern.includes('successfully installed')
          ) {
            return Promise.resolve(true);
          } else if (pattern === '^(\\d+\\.)*\\d+$') {
            return Promise.resolve(true);
          }
          return Promise.reject('error in IsValidToRegex');
        });
        // Act (WHEN)
        const result: Promise<boolean> = dotnetClass.installStrykerTool();
        // Assert (THEN)
        await expect(result).rejects.toBe(expectedErrorMessage);
        expect(executeCommandWithArguments).toHaveBeenCalledTimes(3);
        expect(executeCommandWithArguments).toHaveBeenCalledWith(requiredArguments);
        expect(isValidToRegex).toHaveBeenCalledTimes(2);
        expect(spyLogger.log).toHaveBeenCalledTimes(3);
        expect(spyLogger.log).toHaveBeenCalledWith('dotnet-stryker tool is not already installed');
        expect(spyLogger.log).toHaveBeenCalledWith('Installing dotnet-stryker tool');
      });
    });
  });

  describe('GIVEN the uninstallation of the dotnet stryker', () => {
    const requiredArguments: string[] = ['tool', 'uninstall', '--global', 'dotnet-stryker'];

    afterEach(() => {
      // Assert (THEN)
      expect(spyLogger.log).toHaveBeenCalledTimes(1);
      expect(spyLogger.log).toHaveBeenCalledWith('Task : Uninstall the stryker dotnet tool');
    });

    describe('AND GIVEN the dotnet stryker is installed', () => {
      it('THEN it should be uninstalled', async () => {
        // Arrange (GIVEN)
        mockExecuteCommand.mockImplementation((val: string[]) => {
          if (val.includes('--version')) {
            return Promise.resolve('1.2.3');
          } else if (val.includes('list')) {
            return Promise.resolve('dotnet-stryker    1.2.3    dotnet-stryker');
          } else if (val.includes('uninstall')) {
            return Promise.resolve("Tool 'dotnet-stryker' (version '1.2.3') was successfully uninstalled");
          }
          return Promise.reject('error in ExecuteCommand');
        });

        mockIsValidToRegex.mockImplementation((value: string, pattern: string): Promise<boolean> => {
          value = value.trim();
          if (pattern.includes('dotnet-stryker(\\s*)((\\d+\\.)*\\d+)(\\s*)dotnet-stryker')) {
            return Promise.resolve(true);
          } else if (pattern.includes('dotnet-stryker') && pattern.includes('successfully uninstalled')) {
            return Promise.resolve(true);
          } else if (pattern === '^(\\d+\\.)*\\d+$') {
            return Promise.resolve(true);
          }
          return Promise.reject('error in IsValidToRegex');
        });

        // Act (WHEN)
        const result: Promise<boolean> = dotnetClass.uninstallStrykerTool();
        // Assert (THEN)
        await expect(result).resolves.toBe(true);
        expect(executeCommandWithArguments).toHaveBeenCalledTimes(3);
        expect(executeCommandWithArguments).toHaveBeenCalledWith(requiredArguments);
        expect(isValidToRegex).toHaveBeenCalledTimes(3);
      });
    });

    describe('AND GIVEN the dotnet stryker is not installed', () => {
      it('THEN it should not try to uninstall it', async () => {
        // Arrange (GIVEN)
        mockExecuteCommand.mockImplementation((val: string[]) => {
          if (val.includes('--version')) {
            return Promise.resolve('1.2.3');
          } else if (val.includes('list')) {
            return Promise.resolve(' ');
          } else if (val.includes('uninstall')) {
            return Promise.resolve("Tool 'dotnet-stryker' (version '1.2.3') was successfully uninstalled");
          }
          return Promise.reject('error in ExecuteCommand');
        });

        mockIsValidToRegex.mockImplementation((value: string, pattern: string): Promise<boolean> => {
          if (value === ' ' && pattern.includes('dotnet-stryker')) {
            return Promise.resolve(false);
          } else if (pattern.includes('dotnet-stryker(\\s*)((\\d+\\.)*\\d+)(\\s*)dotnet-stryker')) {
            return Promise.resolve(true);
          } else if (pattern.includes('dotnet-stryker') && pattern.includes('successfully uninstalled')) {
            return Promise.resolve(true);
          } else if (pattern === '^(\\d+\\.)*\\d+$') {
            return Promise.resolve(true);
          }
          return Promise.reject('error in IsValidToRegex');
        });

        // Act (WHEN)
        const result: Promise<boolean> = dotnetClass.uninstallStrykerTool();
        // Assert (THEN)
        await expect(result).resolves.toBe(true);
        expect(executeCommandWithArguments).toHaveBeenCalledTimes(2);
        expect(executeCommandWithArguments).not.toHaveBeenCalledWith(requiredArguments);
        expect(isValidToRegex).toHaveBeenCalledTimes(2);
      });
    });

    describe('AND GIVEN the uninstallation failed', () => {
      it('THEN it should reject AND NOT call The validationRegex after that', async () => {
        // Arrange (GIVEN)
        const expectedErrorMessage: string = 'Failed Uninstallation';
        mockExecuteCommand.mockImplementation((val: string[]) => {
          if (val.includes('--version')) {
            return Promise.resolve('1.2.3');
          } else if (val.includes('list')) {
            return Promise.resolve('dotnet-stryker    1.2.3    dotnet-stryker');
          } else if (val.includes('uninstall')) {
            return Promise.reject(expectedErrorMessage);
          }
          return Promise.reject('error in ExecuteCommand');
        });
        mockIsValidToRegex.mockImplementation((value: string, pattern: string): Promise<boolean> => {
          if (value === expectedErrorMessage) {
            return Promise.resolve(false);
          }
          if (value === ' ' && pattern.includes('dotnet-stryker')) {
            return Promise.resolve(false);
          } else if (pattern.includes('dotnet-stryker(\\s*)((\\d+\\.)*\\d+)(\\s*)dotnet-stryker')) {
            return Promise.resolve(true);
          } else if (
            value.includes('dotnet-stryker') &&
            pattern.includes('dotnet-stryker') &&
            pattern.includes('successfully uninstalled')
          ) {
            return Promise.resolve(true);
          } else if (pattern === '^(\\d+\\.)*\\d+$') {
            return Promise.resolve(true);
          }
          return Promise.reject('error in IsValidToRegex');
        });

        // Act (WHEN)
        const result: Promise<boolean> = dotnetClass.uninstallStrykerTool();
        // Assert (THEN)
        await expect(result).rejects.toBe(expectedErrorMessage);
        expect(executeCommandWithArguments).toHaveBeenCalledTimes(3);
        expect(executeCommandWithArguments).toHaveBeenCalledWith(requiredArguments);
        expect(isValidToRegex).toHaveBeenCalledTimes(2);
      });
    });
  });
});

// TODO : It may not be in the right class... ?!?!?
describe('WHEN initializing the stryker configuration', () => {
  let dotnetClass: DotnetType;
  let spyLogger: ILogger;
  let strykerConfig: StrykerConfigurationType;

  beforeEach(() => {
    // Arrange (GIVEN)
    jest.clearAllMocks();

    spyLogger = {
      log: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
    };

    strykerConfig = {
      initializeBasicConfiguration: jest.fn(),
      createStrykerConfigurationFile: jest.fn(),
    };

    dotnetClass = new Dotnet(strykerConfig, spyLogger);
  });

  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
  });

  describe('GIVEN a successfull initialization of a basic configuration', () => {
    it('THEN should resolves with a successfull message', async () => {
      // Arrange (GIVEN)
      const expectedSuccessfulMessage: string = 'Successfully configured stryker';
      const aValidFolderUri: string = './ValidFolder.Tests';

      when(strykerConfig.initializeBasicConfiguration)
        .calledWith(expect.any(Uri))
        .mockResolvedValue(expectedSuccessfulMessage);

      // Act (WHEN)
      const result: Promise<string> = dotnetClass.initializeStrykerConfiguration(aValidFolderUri);

      // Assert (THEN)
      await expect(result).resolves.toBe(expectedSuccessfulMessage);
    });
  });

  describe('GIVEN an error occured duiring the initialization process', () => {
    it('THEN should rejet with the error message', async () => {
      // Arrange (GIVEN)
      const expectedErrorMessage: string = 'An Error occurred while initilizing stryker';
      const aValidFolderUri: string = './ValidFolder.Tests';

      when(strykerConfig.initializeBasicConfiguration)
        .calledWith(expect.any(Uri))
        .mockRejectedValue(expectedErrorMessage);

      // Act (WHEN)
      const result: Promise<string> = dotnetClass.initializeStrykerConfiguration(aValidFolderUri);

      // Assert (THEN)
      await expect(result).rejects.toBe(expectedErrorMessage);
    });
  });
});

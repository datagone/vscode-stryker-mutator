import path from 'path';
import { Uri } from '../__mocks__/vscode';
import { argsInstallationLocation } from './cli-builder';
import { executeCommandWithArguments, isValidToRegex } from './cli-exec';
import Dotnet from './dotnet';
import IDotnet from './dotnet.interface';
import { getDotNetSolutionFolderPath, isFileExists } from './fs-helpers';
import ILogger from './logger.interface';
import IStrykerConfiguration from './stryker-configuration.interface';
import { mockConsoleLog } from './test-helpers';
import { when } from 'jest-when';

jest.mock('./cli-builder');
jest.mock('./cli-exec');
jest.mock('./fs-helpers');
jest.mock('./logger');
jest.mock('./stryker-configuration');

mockConsoleLog();

describe('WHEN executing the dotnet command', () => {
  let dotnetClass: IDotnet;
  let spyLogger: ILogger;
  let strykerConfig: IStrykerConfiguration;

  let mockExecuteCommand: jest.MockedFn<typeof executeCommandWithArguments>;
  let mockIsValidToRegex: jest.MockedFn<typeof isValidToRegex>;
  let mockIsFileExists: jest.MockedFn<typeof isFileExists>;
  let mockDotNetSolutionFolderPath: jest.MockedFn<typeof getDotNetSolutionFolderPath>;
  let mockStrykerInstallationLocation: jest.MockedFn<typeof argsInstallationLocation>;

  const stdoutExecuteCommandResult: string = 'This is the default output';

  beforeEach(() => {
    // Arrange (GIVEN)
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
    mockIsFileExists = isFileExists as jest.MockedFn<typeof isFileExists>;
    mockDotNetSolutionFolderPath = getDotNetSolutionFolderPath as jest.MockedFn<typeof getDotNetSolutionFolderPath>;
    mockStrykerInstallationLocation = argsInstallationLocation as jest.MockedFn<typeof argsInstallationLocation>;

    dotnetClass = new Dotnet(strykerConfig, spyLogger);

    mockExecuteCommand.mockResolvedValue(stdoutExecuteCommandResult);
    mockIsValidToRegex.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('GIVEN dotnet sdk is present', () => {
    it('THEN it should resolves with the underlying executeCommand called with the required arguments', async () => {
      // Arrange (GIVEN)
      const requiredArguments: string[] = ['--version'];

      // Act (WHEN)
      const result: Promise<boolean> = (dotnetClass as Dotnet).isSdkInstalled();
      // Assert (THEN)
      await expect(result).resolves.toBe(true);
      expect(mockExecuteCommand).toHaveBeenCalledTimes(1);
      expect(mockExecuteCommand).toHaveBeenCalledWith(requiredArguments);
      expect(mockIsValidToRegex).toHaveBeenCalledTimes(1);
      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(mockIsValidToRegex).toHaveBeenCalled();
    });
  });

  describe('GIVEN dotnet stryker tool is present', () => {
    it('THEN it should resolves with the underlying executeCommand called with the required arguments', async () => {
      // Arrange (GIVEN)
      const requiredArguments: string[] = ['tool', 'list'];

      // Act (WHEN)
      const result: Promise<boolean> = dotnetClass.isStrykerToolInstalled();
      // Assert (THEN)
      await expect(result).resolves.toBe(true);
      expect(mockExecuteCommand).toHaveBeenCalledWith(requiredArguments);
      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(mockIsValidToRegex).toHaveBeenCalled();
    });
  });

  describe('GIVEN verifying the presence of the dotnet tool manifest', () => {
    const CURRENT_WORKSPACE_PATH: string = '/current/workspace/path/';
    const EXPECTED_TOOLMANIFEST_PARTIAL_FILEPATH: string = path.join(
      CURRENT_WORKSPACE_PATH,
      `.config/dotnet-tools.json`,
    );
    const VALUE_FOR_TOOLMANIFEST_ABSENT: boolean = false;
    const VALUE_FOR_TOOLMANIFEST_EXISTS: boolean = true;

    beforeEach(() => {
      mockDotNetSolutionFolderPath.mockReturnValue(CURRENT_WORKSPACE_PATH);
    });

    afterEach(() => {
      expect(mockDotNetSolutionFolderPath).toHaveBeenCalledTimes(1);
      expect(mockIsFileExists).toHaveBeenCalledTimes(1);
      expect(mockIsFileExists).toHaveBeenCalledWith(EXPECTED_TOOLMANIFEST_PARTIAL_FILEPATH);
    });

    describe('AND GIVEN the file is missing', () => {
      it('THEN should resolved as absent', async () => {
        mockIsFileExists.mockReturnValue(VALUE_FOR_TOOLMANIFEST_ABSENT);
        var actualResult: boolean = await dotnetClass.isDotnetManifestExists();
        expect(actualResult).toBe(VALUE_FOR_TOOLMANIFEST_ABSENT);
      });
    });
    describe('AND GIVEN the file is present', () => {
      it('THEN should resolved as absent', async () => {
        mockIsFileExists.mockReturnValue(VALUE_FOR_TOOLMANIFEST_EXISTS);
        var actualResult: boolean = await dotnetClass.isDotnetManifestExists();
        expect(actualResult).toBe(VALUE_FOR_TOOLMANIFEST_EXISTS);
      });
    });
  });

  describe('GIVEN the installation of the dotnet stryker', () => {
    const requiredArguments: string[] = ['tool', 'install', 'dotnet-stryker'];

    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
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
        if (val.includes('new') && val.includes('tool-manifest')) {
          return Promise.resolve('tool-manifest installed');
        }
        return Promise.reject('error in ExecuteCommand');
      });
    });

    afterEach(() => {
      // Assert (THEN)
      expect(spyLogger.log).toHaveBeenCalledWith('Task: Install the dotnet-stryker tool');
      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(mockIsValidToRegex).toHaveBeenCalled();
      // TWEAK : to ensure dotnettoolmanifest is called
      expect(mockStrykerInstallationLocation).toHaveBeenCalledTimes(1);
    });

    describe('AND GIVEN the installation location is local', () => {
      beforeEach(() => {
        // Arrange (GIVEN)
        mockStrykerInstallationLocation.mockReturnValue('--local');
        mockDotNetSolutionFolderPath.mockReturnValue('/my/current/workspace');
      });

      afterEach(() => {
        // TWEAK: to verify that isDotnetManifestExists has been called
        expect(mockDotNetSolutionFolderPath).toHaveBeenCalled();
        expect(mockIsFileExists).toHaveBeenCalledTimes(1);
        expect(mockIsFileExists).toHaveBeenCalledWith(expect.stringContaining('dotnet-tools.json'));
      });

      describe('AND GIVEN the tool-manifest is absent', () => {
        it('THEN should create the tool manifest', async () => {
          // Arrange (GIVEN)
          mockIsFileExists.mockReturnValue(false);
          // Act (WHEN)
          await dotnetClass.installStrykerTool();
          // Assert (THEN)
          expect(mockExecuteCommand).toHaveBeenCalledTimes(3);
          expect(mockExecuteCommand).toHaveBeenCalledWith(['new', 'tool-manifest']);
          expect(mockIsValidToRegex).toHaveBeenCalledTimes(3);
          expect(mockIsValidToRegex).toHaveBeenCalledWith('tool-manifest installed', 'tool');
        });
      });

      describe('AND GIVEN the tool-manifest exists', () => {
        it('THEN should not create the tool manifest', async () => {
          // Arrange (GIVEN)
          mockIsFileExists.mockReturnValue(true);
          // Act (WHEN)
          await dotnetClass.installStrykerTool();
          // Assert (THEN)
          expect(mockExecuteCommand).toHaveBeenCalledTimes(2);
          expect(mockExecuteCommand).not.toHaveBeenCalledWith(['new', 'tool-manifest']);
        });
      });
    });

    describe('AND GIVEN the installation location is global', () => {
      it('THEN should not try to create the tool-manifest', async () => {
        // Arrange (GIVEN)
        mockStrykerInstallationLocation.mockReturnValue('--global');
        // Act (WHEN)
        await dotnetClass.installStrykerTool();
        // Assert (THEN)
        expect(mockExecuteCommand).toHaveBeenCalledTimes(2);
        expect(mockExecuteCommand).not.toHaveBeenCalledWith(['new', 'tool-manifest']);
        // TWEAK: to verify that isDotnetManifestExists not has been called
        expect(mockDotNetSolutionFolderPath).not.toHaveBeenCalled();
        expect(mockIsFileExists).not.toHaveBeenCalled();
      });
    });

    describe('AND GIVEN the installation is already done', () => {
      it('THEN it should not try to install it', async () => {
        // Arrange (GIVEN)
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
          if (val.includes('new') && val.includes('tool-manifest')) {
            return Promise.resolve('tool-manifest installed');
          }
          return Promise.reject('error in ExecuteCommand');
        });

        mockIsValidToRegex.mockImplementation((value: string, pattern: string): Promise<boolean> => {
          value = value.trim();
          if (pattern.includes('dotnet-stryker(\\s*)((\\d+\\.)*\\d+)(\\s*)dotnet-stryker')) {
            return Promise.resolve(true);
          }
          if (pattern === '^(\\d+\\.)*\\d+$') {
            return Promise.resolve(true);
          }
          if (pattern === 'tool') {
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
          }
          if (val.includes('list')) {
            return Promise.resolve(' ');
          }
          if (val.includes('install')) {
            return Promise.resolve("Tool 'dotnet-stryker' (version '1.2.3') was successfully installed");
          }
          if (val.includes('new') && val.includes('tool-manifest')) {
            return Promise.resolve('tool-manifest installed');
          }
          return Promise.reject('error in ExecuteCommand');
        });
        mockIsValidToRegex.mockImplementation((value: string, pattern: string): Promise<boolean> => {
          if (value === ' ' && pattern.includes('dotnet-stryker')) {
            return Promise.resolve(false);
          }
          if (
            value.includes('dotnet-stryker') &&
            pattern.includes('dotnet-stryker') &&
            pattern.includes('successfully installed')
          ) {
            return Promise.resolve(true);
          }
          if (pattern === '^(\\d+\\.)*\\d+$') {
            return Promise.resolve(true);
          }
          if (pattern === 'tool') {
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
        expect(spyLogger.log).toHaveBeenCalledTimes(2);
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
          }
          if (val.includes('list')) {
            return Promise.resolve(' ');
          }
          if (val.includes('install')) {
            return Promise.reject(expectedErrorMessage);
          }
          if (val.includes('new') && val.includes('tool-manifest')) {
            return Promise.resolve('tool-manifest installed');
          }
          return Promise.reject('error in ExecuteCommand');
        });
        mockIsValidToRegex.mockImplementation((value: string, pattern: string): Promise<boolean> => {
          if (value === expectedErrorMessage) {
            return Promise.resolve(false);
          }
          if (value === ' ' && pattern.includes('dotnet-stryker')) {
            return Promise.resolve(false);
          }
          if (
            value.includes('dotnet-stryker') &&
            pattern.includes('dotnet-stryker') &&
            pattern.includes('successfully installed')
          ) {
            return Promise.resolve(true);
          }
          if (pattern === '^(\\d+\\.)*\\d+$') {
            return Promise.resolve(true);
          }
          if (pattern === 'tool') {
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
        expect(spyLogger.log).toHaveBeenCalledTimes(2);
        expect(spyLogger.log).toHaveBeenCalledWith('Installing dotnet-stryker tool');
      });
    });
  });

  describe('GIVEN the update of the dotnet stryker', () => {
    const requiredUpdateArguments: string[] = ['tool', 'update', 'dotnet-stryker'];
    const requiredInstallArguments: string[] = ['tool', 'install', 'dotnet-stryker'];

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
        if (val.includes('update')) {
          return Promise.resolve(
            "Tool 'dotnet-stryker' was successfully updated from version '1.2.3' to version '2.3.4'",
          );
        }
        return Promise.reject('error in ExecuteCommand');
      });
    });

    afterEach(() => {
      // Assert (THEN)
      expect(spyLogger.log).toHaveBeenCalledWith('Task: Update the dotnet-stryker tool');
      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(mockIsValidToRegex).toHaveBeenCalled();
    });

    describe('AND GIVEN the tool is not up to date', () => {
      it('THEN it should update it', async () => {
        // Arrange (GIVEN)
        mockExecuteCommand.mockImplementation((val: string[]) => {
          if (val.includes('--version')) {
            return Promise.resolve('1.2.3');
          }
          if (val.includes('list')) {
            return Promise.resolve('dotnet-stryker    1.2.3    dotnet-stryker');
          }
          if (val.includes('update')) {
            return Promise.resolve(
              "Tool 'dotnet-stryker' was successfully updated from version '1.2.3' to version '2.3.4'",
            );
          }
          return Promise.reject('error in ExecuteCommand');
        });

        mockIsValidToRegex.mockImplementation((value: string, pattern: string): Promise<boolean> => {
          value = value.trim();
          if (pattern === '^(\\d+\\.)*\\d+$') {
            // --version
            return Promise.resolve(true);
          }
          if (pattern.includes('dotnet-stryker(\\s*)((\\d+\\.)*\\d+)(\\s*)dotnet-stryker')) {
            // tool list [--global|--local]
            return Promise.resolve(true);
          }
          if (
            value.includes('dotnet-stryker') &&
            pattern.includes('dotnet-stryker') &&
            pattern.includes('successfully updated')
          ) {
            return Promise.resolve(true);
          }
          return Promise.reject('error in IsValidToRegex');
        });
        // Act (WHEN)
        const result: Promise<boolean> = dotnetClass.updateStrykerTool();
        // Assert (THEN)
        await expect(result).resolves.toBe(true);
        expect(executeCommandWithArguments).toHaveBeenCalledTimes(3);
        expect(executeCommandWithArguments).not.toHaveBeenCalledWith(requiredInstallArguments);
        expect(executeCommandWithArguments).toHaveBeenCalledWith(requiredUpdateArguments);
        expect(isValidToRegex).toHaveBeenCalledTimes(3);
        expect(spyLogger.log).toHaveBeenCalledTimes(1);
        expect(spyLogger.log).toHaveBeenCalledWith('Task: Update the dotnet-stryker tool');
      });
    });

    describe('AND GIVEN the update is already done', () => {
      it('THEN it should reinstall it', async () => {
        // Arrange (GIVEN)
        mockExecuteCommand.mockImplementation((val: string[]) => {
          if (val.includes('--version')) {
            return Promise.resolve('1.2.3');
          }
          if (val.includes('list')) {
            return Promise.resolve('dotnet-stryker    1.2.3    dotnet-stryker');
          }
          if (val.includes('update')) {
            return Promise.resolve(
              "Tool 'dotnet-stryker' was reinstalled with the latest stable version (version '1.2.3')",
            );
          }
          return Promise.reject('error in ExecuteCommand');
        });

        mockIsValidToRegex.mockImplementation((value: string, pattern: string): Promise<boolean> => {
          value = value.trim();
          if (pattern === '^(\\d+\\.)*\\d+$') {
            // --version
            return Promise.resolve(true);
          }
          if (pattern.includes('dotnet-stryker(\\s*)((\\d+\\.)*\\d+)(\\s*)dotnet-stryker')) {
            // tool list [--global|--local]
            return Promise.resolve(true);
          }
          if (
            value.includes('dotnet-stryker') &&
            pattern.includes('dotnet-stryker') &&
            pattern.includes('reinstalled')
          ) {
            return Promise.resolve(true);
          }
          return Promise.reject('error in IsValidToRegex');
        });
        // Act (WHEN)
        const result: Promise<boolean> = dotnetClass.updateStrykerTool();
        // Assert (THEN)
        await expect(result).resolves.toBe(true);
        expect(executeCommandWithArguments).toHaveBeenCalledTimes(3);
        expect(executeCommandWithArguments).not.toHaveBeenCalledWith(requiredInstallArguments);
        expect(executeCommandWithArguments).toHaveBeenCalledWith(requiredUpdateArguments);
        expect(isValidToRegex).toHaveBeenCalledTimes(3);
        expect(spyLogger.log).toHaveBeenCalledTimes(1);
        expect(spyLogger.log).toHaveBeenCalledWith('Task: Update the dotnet-stryker tool');
      });
    });

    describe('AND GIVEN the installation was not done', () => {
      it('THEN it should reject the update', async () => {
        // Arrange (GIVEN)
        mockExecuteCommand.mockImplementation((val: string[]) => {
          if (val.includes('--version')) {
            return Promise.resolve('1.2.3');
          }
          if (val.includes('list')) {
            return Promise.resolve(' ');
          }
          if (val.includes('install')) {
            return Promise.resolve("Tool 'dotnet-stryker' (version '1.2.3') was successfully installed");
          }
          return Promise.reject('error in ExecuteCommand');
        });
        mockIsValidToRegex.mockImplementation((value: string, pattern: string): Promise<boolean> => {
          if (value === ' ' && pattern.includes('dotnet-stryker')) {
            return Promise.resolve(false);
          }
          if (
            value.includes('dotnet-stryker') &&
            pattern.includes('dotnet-stryker') &&
            pattern.includes('successfully installed')
          ) {
            return Promise.resolve(true);
          }
          if (pattern === '^(\\d+\\.)*\\d+$') {
            return Promise.resolve(true);
          }
          return Promise.reject('error in IsValidToRegex');
        });
        // Act (WHEN)
        const result: Promise<boolean> = dotnetClass.updateStrykerTool();
        // Assert (THEN)
        await expect(result).rejects.toBe('dotnet-stryker tool is not already installed');
        expect(executeCommandWithArguments).toHaveBeenCalledTimes(2);
        expect(isValidToRegex).toHaveBeenCalledTimes(2);
        expect(spyLogger.log).toHaveBeenCalledTimes(1);
        expect(spyLogger.log).toHaveBeenCalledWith('Task: Update the dotnet-stryker tool');
      });
    });

    describe('AND GIVEN the update failed', () => {
      it('THEN it should reject AND NOT call The validationRegex after that', async () => {
        // Arrange (GIVEN)
        const expectedErrorMessage: string = 'Failed Update';
        mockExecuteCommand.mockImplementation((val: string[]) => {
          if (val.includes('--version')) {
            return Promise.resolve('1.2.3');
          }
          if (val.includes('list')) {
            return Promise.resolve('dotnet-stryker    1.2.3    dotnet-stryker');
          }
          if (val.includes('update')) {
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
          }
          if (
            value.includes('dotnet-stryker') &&
            pattern.includes('dotnet-stryker') &&
            pattern.includes('successfully updated')
          ) {
            return Promise.resolve(true);
          }
          if (pattern === '^(\\d+\\.)*\\d+$') {
            return Promise.resolve(true);
          }
          if (pattern === 'dotnet-stryker(\\s*)((\\d+\\.)*\\d+)(\\s*)dotnet-stryker') {
            return Promise.resolve(true);
          }
          return Promise.reject('error in IsValidToRegex');
        });
        // Act (WHEN)
        const result: Promise<boolean> = dotnetClass.updateStrykerTool();
        // Assert (THEN)
        await expect(result).rejects.toBe(expectedErrorMessage);
        expect(executeCommandWithArguments).toHaveBeenCalledTimes(3);
        expect(executeCommandWithArguments).toHaveBeenCalledWith(requiredUpdateArguments);
        expect(isValidToRegex).toHaveBeenCalledTimes(2);
        expect(spyLogger.log).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('GIVEN the uninstallation of the dotnet stryker', () => {
    const requiredArguments: string[] = ['tool', 'uninstall', 'dotnet-stryker'];

    afterEach(() => {
      // Assert (THEN)
      expect(spyLogger.log).toHaveBeenCalledTimes(1);
      expect(spyLogger.log).toHaveBeenCalledWith('Task: Uninstall the dotnet-stryker tool');
      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(mockIsValidToRegex).toHaveBeenCalled();
    });

    describe('AND GIVEN the dotnet stryker is installed', () => {
      it('THEN it should be uninstalled', async () => {
        // Arrange (GIVEN)
        mockExecuteCommand.mockImplementation((val: string[]) => {
          if (val.includes('--version')) {
            return Promise.resolve('1.2.3');
          }
          if (val.includes('list')) {
            return Promise.resolve('dotnet-stryker    1.2.3    dotnet-stryker');
          }
          if (val.includes('uninstall')) {
            return Promise.resolve("Tool 'dotnet-stryker' (version '1.2.3') was successfully uninstalled");
          }
          return Promise.reject('error in ExecuteCommand');
        });

        mockIsValidToRegex.mockImplementation((value: string, pattern: string): Promise<boolean> => {
          value = value.trim();
          if (pattern.includes('dotnet-stryker(\\s*)((\\d+\\.)*\\d+)(\\s*)dotnet-stryker')) {
            return Promise.resolve(true);
          }
          if (pattern.includes('dotnet-stryker') && pattern.includes('successfully uninstalled')) {
            return Promise.resolve(true);
          }
          if (pattern === '^(\\d+\\.)*\\d+$') {
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
          }
          if (val.includes('list')) {
            return Promise.resolve(' ');
          }
          if (val.includes('uninstall')) {
            return Promise.resolve("Tool 'dotnet-stryker' (version '1.2.3') was successfully uninstalled");
          }
          return Promise.reject('error in ExecuteCommand');
        });

        mockIsValidToRegex.mockImplementation((value: string, pattern: string): Promise<boolean> => {
          if (value === ' ' && pattern.includes('dotnet-stryker')) {
            return Promise.resolve(false);
          }
          if (pattern.includes('dotnet-stryker(\\s*)((\\d+\\.)*\\d+)(\\s*)dotnet-stryker')) {
            return Promise.resolve(true);
          }
          if (pattern.includes('dotnet-stryker') && pattern.includes('successfully uninstalled')) {
            return Promise.resolve(true);
          }
          if (pattern === '^(\\d+\\.)*\\d+$') {
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
          }
          if (val.includes('list')) {
            return Promise.resolve('dotnet-stryker    1.2.3    dotnet-stryker');
          }
          if (val.includes('uninstall')) {
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
          }
          if (pattern.includes('dotnet-stryker(\\s*)((\\d+\\.)*\\d+)(\\s*)dotnet-stryker')) {
            return Promise.resolve(true);
          }
          if (
            value.includes('dotnet-stryker') &&
            pattern.includes('dotnet-stryker') &&
            pattern.includes('successfully uninstalled')
          ) {
            return Promise.resolve(true);
          }
          if (pattern === '^(\\d+\\.)*\\d+$') {
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
  let dotnetClass: IDotnet;
  let spyLogger: ILogger;
  let strykerConfig: IStrykerConfiguration;

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

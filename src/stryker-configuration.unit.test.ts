import ILogger from './logger.interface';
import IStrykerConfiguration from './stryker-configuration.interface';
import StrykerConfiguration from './stryker-configuration';
import { mockFindFiles, mockGetWorkspaceFolder, mockShowOpenDialog, Uri } from '../__mocks__/vscode';
import fs from 'fs';
import path from 'path';
import { mockConsoleLog } from './test-helpers';
import { when } from 'jest-when';
import { OpenDialogOptions } from 'vscode';

jest.mock('fs');

let stubLogger: ILogger;
let configuration: IStrykerConfiguration;

const configFileExistsMessage: string = 'The stryker configuration file already exists. It will not be overwritten.';
const strykerConfigurationFileCreationSuccess: string = 'The stryker configuration file has been created:';

mockConsoleLog();

beforeEach(() => {
  // Arrange (GIVEN)
  jest.clearAllMocks();

  stubLogger = {
    log: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  };

  configuration = new StrykerConfiguration(stubLogger);
});

describe('WHEN Creating a new instance of StrykerConfiguration', () => {
  it('THEN returns an instance of StrykerConfiguration', () => {
    // Arrange (GIVEN)

    // Act (WHEN)

    // Assert (THEN)
    expect(configuration).not.toBe(null);
    expect(configuration).toBeInstanceOf(StrykerConfiguration);
  });
});

describe('WHEN Initializing the configuration file', () => {
  describe('GIVEN a folder uri is provided', () => {
    it('THEN it should create a the default configuration file in that folder', async () => {
      // Arrange (GIVEN)
      const aProvidedFolderUri = './AProvidedFolder';
      const expectedSolutionTestsFolder: Uri = Uri.file(path.join(aProvidedFolderUri));
      const expectedConfigurationFilePath: Uri = Uri.file(
        path.join(expectedSolutionTestsFolder.fsPath, 'stryker-config.json'),
      );
      const expectMessageToBeLogged = `Creating the stryker configuration file into: ${expectedSolutionTestsFolder.path}`;
      const expectedDefaultJsonStrykerConfigFile: any = {
        'stryker-config': {
          'mutation-level': 'Complete',
          reporters: ['html', 'json', 'markdown', 'cleartext', 'progress'],
          'report-file-name': 'mutation-report',
          thresholds: { high: 100, low: 100, break: 100 },
        },
      };
      const expectedJsonStringForTheConfigurationFile = JSON.stringify(expectedDefaultJsonStrykerConfigFile, null, 2);
      mockGetWorkspaceFolder.mockReturnValue({
        uri: {
          path: expectedSolutionTestsFolder.path,
          fsPath: expectedSolutionTestsFolder.path,
        },
      });
      const writeFileSpy = jest.spyOn(fs, 'writeFile');
      // Act (WHEN)
      const result = configuration.initializeBasicConfiguration(expectedSolutionTestsFolder);
      // Assert (THEN)
      await expect(result).resolves.toContain(expectedSolutionTestsFolder.path);
      expect(mockGetWorkspaceFolder).toHaveBeenCalled();
      expect(stubLogger.info).toHaveBeenCalledTimes(1);
      expect(stubLogger.info).toHaveBeenCalledWith(expectMessageToBeLogged);
      expect(writeFileSpy).toHaveBeenCalledTimes(1);
      expect(writeFileSpy).toHaveBeenCalledWith(
        expectedConfigurationFilePath.path,
        expectedJsonStringForTheConfigurationFile,
        expect.anything(),
      );
    });
  });

  describe('GIVEN the folderpath is not within a workspace', () => {
    describe('AND GIVEN a dialogBox is opened to chose a folder', () => {
      // todo : should we specify cancelled also [aka undefined] et not choice [aka FoldingRange.length = 0]
      describe('AND GIVEN a folder choice was cancelled', () => {
        it('THEN it should reject with the message that requires to chose a folder', async () => {
          // Arrange (GIVEN)
          const pathNotInWorkspace: Uri = Uri.file('./Other/Path');
          const expectChosenFolderMissing = 'You must select one folder';
          mockGetWorkspaceFolder.mockReturnValue(undefined);
          when(mockShowOpenDialog).calledWith(expect.anything()).mockResolvedValue(undefined);

          // Act (WHEN)
          const result = configuration.initializeBasicConfiguration(pathNotInWorkspace);

          // Assert (THEN)
          await expect(result).rejects.toBe(expectChosenFolderMissing);
          expect(mockGetWorkspaceFolder).toHaveBeenCalledTimes(1);
          expect(mockShowOpenDialog).toHaveBeenCalledTimes(1);
          expect(stubLogger.info).not.toHaveBeenCalled();
        });
      });
      describe('AND GIVEN no folder choice was made', () => {
        it('THEN it should reject with the message that requires to chose a folder', async () => {
          // Arrange (GIVEN)
          const pathNotInWorkspace: Uri = Uri.file('./Other/Path');
          const expectChosenFolderMissing = 'You must select one folder';
          mockGetWorkspaceFolder.mockReturnValue(undefined);
          when(mockShowOpenDialog).calledWith(expect.anything()).mockResolvedValue([]);

          // Act (WHEN)
          const result = configuration.initializeBasicConfiguration(pathNotInWorkspace);

          // Assert (THEN)
          await expect(result).rejects.toBe(expectChosenFolderMissing);
          expect(mockGetWorkspaceFolder).toHaveBeenCalledTimes(1);
          expect(mockShowOpenDialog).toHaveBeenCalledTimes(1);
          expect(stubLogger.info).not.toHaveBeenCalled();
        });
      });

      describe('AND GIVEN a single folder is chosen', () => {
        it('THEN it should use the workspace root path of the chosen folder', async () => {
          // Arrange (GIVEN)
          const pathWithinWorkspace: Uri = Uri.file('./WorkspaceRoot/Path');
          const workspaceRootPath: Uri = Uri.file('./WorkspaceRoot');
          const expectedWorkspaceToBeUsed: string = path.join(workspaceRootPath.path);
          const expectMessageToBeLogged = `Creating the stryker configuration file into: ${expectedWorkspaceToBeUsed}`;
          mockGetWorkspaceFolder.mockReturnValue(undefined);
          const dialogOptions: OpenDialogOptions = {
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
          };
          when(mockShowOpenDialog).calledWith(dialogOptions).mockResolvedValue([workspaceRootPath]);
          const mockedSolutionUri: Uri = Uri.file(path.join(expectedWorkspaceToBeUsed, 'test.sln'));
          when(mockFindFiles).calledWith('**/*.sln').mockReturnValue([mockedSolutionUri]);

          // Act (WHEN)
          const result = configuration.initializeBasicConfiguration(pathWithinWorkspace);

          // Assert (THEN)
          await expect(result).resolves.toContain(expectedWorkspaceToBeUsed);
          expect(mockShowOpenDialog).toHaveBeenCalledWith(dialogOptions);
          expect(mockGetWorkspaceFolder).toHaveBeenCalled();
          expect(stubLogger.info).toHaveBeenCalledTimes(1);
          expect(stubLogger.info).toHaveBeenCalledWith(expectMessageToBeLogged);
        });
      });
    });
  });
});

describe('WHEN Creating the configuration file', () => {
  describe('GIVEN a folderpath ending with .Test', () => {
    it('THEN it should resolve with the successful message', async () => {
      // Arrange (GIVEN)
      const testFolderPath: Uri = Uri.file('./a-folder' /*.Test'*/);

      // Act (WHEN)
      const result = configuration.createStrykerConfigurationFile(testFolderPath);
      // Assert (THEN)
      await expect(result).resolves.toContain(`${strykerConfigurationFileCreationSuccess}`);
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('GIVEN a valid .Tests folderpath', () => {
    // Arrange (GIVEN)
    const validFolderPath: Uri = Uri.file('./a-valid-folder' /*.Tests'*/);

    describe('AND GIVEN stryker-config.json exists', () => {
      it('THEN it should reject with a message saying that the file already exists', async () => {
        // Arrange (GIVEN)
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const mockIsFile = jest.fn().mockReturnValue(true);
        const mockLstatSync = jest.fn().mockReturnValue({
          isFile: mockIsFile,
        });
        jest.spyOn(fs, 'lstatSync').mockImplementation((filePath) => {
          return mockLstatSync(filePath);
        });

        // Act (WHEN)
        const result = configuration.createStrykerConfigurationFile(validFolderPath);

        // Assert (THEN)
        await expect(result).rejects.toBe(configFileExistsMessage);
        expect(stubLogger.warning).toHaveBeenCalledTimes(1);
        expect(stubLogger.warning).toHaveBeenCalledWith(configFileExistsMessage);
      });
    });

    describe('AND GIVEN stryker-config.json does not exists', () => {
      const messageFileDoesntExist = 'does not exist, at the moment.';

      describe('AND GIVEN the writing process completes sucessfully', () => {
        it('THEN it should resolve with the message that the configuration file is created', async () => {
          // Arrange (GIVEN)
          const expectedFilePath: string = path.join(validFolderPath.path, 'stryker-config.json');
          jest.spyOn(fs, 'existsSync').mockReturnValue(false);
          jest.spyOn(fs, 'writeFile').mockImplementation(async (filePath, content, callback) => {
            filePath = filePath;
            content = content;
            callback(null);
          });
          const expectedLoggedMsgAboutConfigFileDoesntExistRightNow = `${expectedFilePath} ${messageFileDoesntExist}`;
          const expectedMessageForConfigFileCreation = `${strykerConfigurationFileCreationSuccess} ${expectedFilePath}`;

          // Act (WHEN)
          const result = configuration.createStrykerConfigurationFile(validFolderPath);

          // Assert (THEN)
          await expect(result).resolves.toContain(expectedFilePath);
          expect(stubLogger.error).not.toHaveBeenCalled();
          expect(stubLogger.log).toHaveBeenCalledTimes(2);
          expect(stubLogger.log).toHaveBeenCalledWith(expectedLoggedMsgAboutConfigFileDoesntExistRightNow);
          expect(stubLogger.log).toHaveBeenCalledWith(expectedMessageForConfigFileCreation);
        });
      });

      describe('AND GIVEN an issue happen during the writing process', () => {
        it('THEN it should reject with the error message', async () => {
          // Arrange (GIVEN)
          const validFolderPath: Uri = Uri.file('./a-valid-folder' /*.Tests'*/);
          const expectedErrorMessage: string = 'an issue happen during the writing process';
          const expectedCallbackError = new Error(expectedErrorMessage);
          jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callback) => {
            filePath = filePath;
            content = content;
            callback(expectedCallbackError);
          });
          const expectedFilePath: string = path.join(validFolderPath.path, 'stryker-config.json');
          const expectedLoggedMsgAboutConfigFileDoesntExistRightNow = `${expectedFilePath} ${messageFileDoesntExist}`;

          // Act (WHEN)
          const result = configuration.createStrykerConfigurationFile(validFolderPath);

          // Assert (THEN)
          await expect(result).rejects.toBe(expectedCallbackError);
          expect(stubLogger.error).toHaveBeenCalledTimes(1);
          expect(stubLogger.error).toHaveBeenCalledWith(expectedErrorMessage);
          expect(stubLogger.log).toHaveBeenCalledTimes(1);
          expect(stubLogger.log).toHaveBeenCalledWith(expectedLoggedMsgAboutConfigFileDoesntExistRightNow);
        });
      });
    });
  });
});

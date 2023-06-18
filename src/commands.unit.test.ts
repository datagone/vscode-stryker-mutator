import { when } from 'jest-when';
import {
  Uri,
  mockAsRelativePath,
  mockShowErrorMessage,
  mockShowInformationMessage,
  mockShowOpenDialog,
  mockShowWarningMessage,
  window,
} from '../__mocks__/vscode';
import {
  mutateFileCommand,
  mutateSelectionCommand,
  createBoilerplateStrykerConfigurationFileCommand,
  installStrykerDotnetToolCommand,
  uninstallStrykerDotnetToolCommand,
  mutateWorkspaceCommand,
  mutateSolutionCommand,
} from './commands';
import { DotnetType } from './dotnet';
import { mockConsoleLog } from './test-helpers';
import { isTestFile, showInvalidFileMessage } from './valid-files';
import { commandRunner } from './stryker';
import { OpenDialogOptions } from 'vscode';

jest.mock('./valid-files');
jest.mock('./stryker.ts');

const mockIsTestFile = isTestFile as jest.MockedFn<typeof isTestFile>;
const mockCommandRunner = commandRunner as jest.MockedFn<typeof commandRunner>;

let mockDotnet: DotnetType;

describe('Commands', () => {
  mockConsoleLog();

  beforeEach(() => {
    jest.clearAllMocks();

    // Arrange (GIVEN)
    mockDotnet = {
      isSdkInstalled: jest.fn(),
      isStrykerToolInstalled: jest.fn(),

      installStrykerTool: jest.fn(),
      uninstallStrykerTool: jest.fn(),

      initializeStrykerConfiguration: jest.fn(),
    };
  });

  describe('Run stryker to mutate the workspace', () => {
    it('should return a function', () => {
      expect(mutateWorkspaceCommand(jest.fn())).toEqual(expect.any(Function));
    });
    describe('GIVEN the a warning is shown for a user to choose', () => {
      describe('AND GIVEN the user chooses to continue', () => {
        it('should run a command ', async () => {
          const run = jest.fn();
          const uriPath: string = 'x.cs';
          mockAsRelativePath.mockReturnValue(uriPath);
          mockIsTestFile.mockReturnValue(false);
          when(mockShowWarningMessage)
            .calledWith(expect.stringContaining('🧟‍♀️🧟‍♂️'), 'Yes', 'No')
            .mockReturnValue(Promise.resolve('Yes'));

          await mutateWorkspaceCommand(run)();

          expect(run).toHaveBeenCalledTimes(1);
          expect(run).toHaveBeenCalledWith({});
          expect(mockShowInformationMessage).not.toHaveBeenCalled();
        });
      });
      describe('AND GIVEN the user chooses to refuse', () => {
        it('THEN should receive a thank you message', async () => {
          const run = jest.fn();
          const uriPath: string = 'x.cs';
          mockAsRelativePath.mockReturnValue(uriPath);
          mockIsTestFile.mockReturnValue(false);
          when(mockShowWarningMessage)
            .calledWith(expect.stringContaining('🧟‍♀️🧟‍♂️'), 'Yes', 'No')
            .mockReturnValue(Promise.resolve('No'));

          await mutateWorkspaceCommand(run)();

          expect(run).not.toHaveBeenCalled();
          expect(mockShowInformationMessage).toHaveBeenCalledTimes(1);
          expect(mockShowInformationMessage).toHaveBeenCalledWith(expect.stringContaining('😇'));
        });
      });
      describe('AND GIVEN the user close the dialog', () => {
        it('THEN should receive a thank you message', async () => {
          const run = jest.fn();
          const uriPath: string = 'x.cs';
          mockAsRelativePath.mockReturnValue(uriPath);
          mockIsTestFile.mockReturnValue(false);

          await mutateWorkspaceCommand(run)();

          expect(run).not.toHaveBeenCalled();
          expect(mockShowInformationMessage).toHaveBeenCalledTimes(1);
          expect(mockShowInformationMessage).toHaveBeenCalledWith(expect.stringContaining('😇'));
        });
      });
    });
  });

  describe('Run stryker to mutate a file', () => {
    let stubFilters: Record<string, string[]>;
    let dialogOptions: OpenDialogOptions;

    beforeEach(async () => {
      stubFilters = {
        'C# Files': ['cs'],
        '.Net Solution Files': ['sln'],
        '.Net Project Files': ['csproj'],
        '.Net TestProject Files': ['Tests.csproj', 'Test.csproj'],
        'All Files': ['*'],
      };
      dialogOptions = {
        canSelectMany: false,
        filters: stubFilters,
      };
    });

    it('should return a function', async () => {
      expect(mutateFileCommand(jest.fn())).toEqual(expect.any(Function));
    });
    it('should do nothing if no URI is passed as an argument', async () => {
      const run = jest.fn();

      await mutateFileCommand(run)();

      expect(run).not.toHaveBeenCalled();
      expect(isTestFile).not.toHaveBeenCalled();
      expect(showInvalidFileMessage).not.toHaveBeenCalled();
    });
    it('should show an error message if the file is a test file', async () => {
      const run = jest.fn();
      const uriPath: string = 'x.test.cs';
      mockAsRelativePath.mockReturnValue(uriPath);
      mockIsTestFile.mockReturnValue(true);

      await mutateFileCommand(run)(new Uri({ path: uriPath }));

      console.log((isTestFile as jest.Mock).mock.calls);

      expect(run).not.toHaveBeenCalled();
      expect(isTestFile).toHaveBeenCalledWith(expect.stringContaining(uriPath));
      expect(showInvalidFileMessage).toHaveBeenCalledWith();
    });
    it('should run a command if the file is not a test file', async () => {
      const run = jest.fn();
      const uriPath: string = 'x.cs';
      const uriUseToCall: Uri = new Uri({ path: uriPath });
      const expectedUri: unknown = { path: uriPath };
      mockAsRelativePath.mockReturnValue(uriPath);
      mockIsTestFile.mockReturnValue(false);

      await mutateFileCommand(run)(uriUseToCall);

      expect(run).toHaveBeenCalledWith({ file: expect.objectContaining(expectedUri) });
      expect(isTestFile).toHaveBeenCalledWith(expect.stringContaining(uriPath));
      expect(showInvalidFileMessage).not.toHaveBeenCalledWith();
    });

    it('should show run a command if the active document is a .cs file', async () => {
      const run = jest.fn();
      const uriPath: string = 'x.cs';
      const mockDocument = { fileName: uriPath, uri: new Uri({ path: uriPath }) };
      mockAsRelativePath.mockReturnValue(uriPath);
      mockIsTestFile.mockReturnValue(false);
      window.activeTextEditor = {
        document: mockDocument,
      };

      await mutateFileCommand(run)({ path: '' });

      const expectedUri: unknown = { path: uriPath };

      expect(run).toHaveBeenCalledTimes(1);
      expect(run).toHaveBeenCalledWith({ file: expect.objectContaining(expectedUri) });
      expect(isTestFile).toHaveBeenCalledWith(expect.stringContaining(uriPath));
      expect(showInvalidFileMessage).not.toHaveBeenCalledWith();
      expect(mockShowErrorMessage).not.toHaveBeenCalled();
    });

    it('should show OpenDialog if the active document is not a .cs file', async () => {
      const run = jest.fn();
      const uriPath: string = 'x.md';
      const mockDocument = { fileName: uriPath, uri: new Uri({ path: uriPath }) };
      window.activeTextEditor = {
        document: mockDocument,
      };
      const expectChosenFileOrFolderMissing = 'Stryker.NET: You must select a file or folder';

      await mutateFileCommand(run)({ path: '' });

      expect(mockShowOpenDialog).toHaveBeenCalledTimes(1);
      expect(mockShowErrorMessage).toHaveBeenCalledWith(expectChosenFileOrFolderMissing);
      expect(isTestFile).not.toHaveBeenCalledWith();
      expect(run).not.toHaveBeenCalled();
    });

    it('should show select missing file message if cancel the opendialog', async () => {
      const run = jest.fn();
      mockIsTestFile.mockReturnValue(false);
      window.activeTextEditor = {
        document: undefined,
      };
      when(mockShowOpenDialog).calledWith(expect.anything()).mockResolvedValue(undefined);
      const expectChosenFileOrFolderMissing = 'Stryker.NET: You must select a file or folder';

      await mutateFileCommand(run)({ path: '' });

      expect(run).not.toHaveBeenCalled();
      expect(mockShowErrorMessage).toHaveBeenCalledWith(expectChosenFileOrFolderMissing);
      expect(isTestFile).not.toHaveBeenCalledWith();
    });

    it('should show select missing file message if no file or folder is chosen in the opendialog', async () => {
      const run = jest.fn();
      mockIsTestFile.mockReturnValue(false);
      window.activeTextEditor = {
        document: undefined,
      };
      const expectChosenFileOrFolderMissing = 'Stryker.NET: You must select a file or folder';
      when(mockShowOpenDialog).calledWith(expect.anything()).mockResolvedValue([]);

      await mutateFileCommand(run)({ path: '' });

      expect(run).not.toHaveBeenCalled();
      expect(mockShowErrorMessage).toHaveBeenCalledWith(expectChosenFileOrFolderMissing);
      expect(isTestFile).not.toHaveBeenCalledWith();
    });

    it('should show  run a command if a file or folder is chosen in the opendialog', async () => {
      const run = jest.fn();
      const fileOrFolderFullPath: Uri = Uri.file('./tempo/tryout/x.cs');
      const fileOrFolderPath: string = 'x.cs';
      const expectedUri: unknown = { path: fileOrFolderFullPath.fsPath };
      window.activeTextEditor = {
        document: undefined,
      };
      mockIsTestFile.mockReturnValue(false);

      when(mockShowOpenDialog).calledWith(dialogOptions).mockResolvedValue([fileOrFolderFullPath]);

      await mutateFileCommand(run)({ path: '' });

      expect(run).toHaveBeenCalledTimes(1);
      expect(run).toHaveBeenCalledWith({ file: expect.objectContaining(expectedUri) });
      expect(isTestFile).toHaveBeenCalledWith(expect.stringContaining(fileOrFolderPath));
      expect(showInvalidFileMessage).not.toHaveBeenCalledWith();
      expect(mockShowErrorMessage).not.toHaveBeenCalled();
    });
  });

  describe('Run stryker to mutate a selection', () => {
    it('should return a function', () => {
      expect(mutateSelectionCommand(jest.fn())).toEqual(expect.any(Function));
    });
    it('should do nothing if no URI is passed as an argument', async () => {
      const run = jest.fn();

      await mutateSelectionCommand(run)();

      expect(run).not.toHaveBeenCalled();
      expect(isTestFile).not.toHaveBeenCalled();
      expect(showInvalidFileMessage).not.toHaveBeenCalled();
    });
    it('should show an error message if the file is a test file', async () => {
      const run = jest.fn();
      const uriPath: string = 'x.test.cs';
      mockAsRelativePath.mockReturnValue(uriPath);
      mockIsTestFile.mockReturnValue(true);

      await mutateSelectionCommand(run)(new Uri({ path: uriPath }));

      expect(run).not.toHaveBeenCalled();
      expect(isTestFile).toHaveBeenCalledWith(expect.stringContaining(uriPath));
      expect(showInvalidFileMessage).toHaveBeenCalledWith();
    });
    it('should do nothing if there is no active editor', async () => {
      const run = jest.fn();
      const uriPath: string = 'x.cs';
      mockAsRelativePath.mockReturnValue(uriPath);
      mockIsTestFile.mockReturnValue(false);
      window.activeTextEditor = null as any;

      await mutateSelectionCommand(run)(new Uri({ path: uriPath }));

      expect(run).not.toHaveBeenCalled();
      expect(isTestFile).toHaveBeenCalledWith(expect.stringContaining(uriPath));
      expect(showInvalidFileMessage).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Stryker.NET: No action, no active editor');
    });
    it('should do nothing when the selection is empty', async () => {
      const run = jest.fn();
      const uriPath: string = 'x.cs';
      mockAsRelativePath.mockReturnValue(uriPath);
      mockIsTestFile.mockReturnValue(false);
      window.activeTextEditor = { selection: { isEmpty: true } };

      await mutateSelectionCommand(run)(new Uri({ path: uriPath }));

      expect(run).not.toHaveBeenCalled();
      expect(isTestFile).toHaveBeenCalledWith(expect.stringContaining(uriPath));
      expect(showInvalidFileMessage).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Stryker.NET: No action, selection is single character');
    });
    it('should show run a command if the file is not a test file', async () => {
      const run = jest.fn();
      const uriPath: string = 'x.cs';
      const mockDocument = { offsetAt: jest.fn(), positionAt: jest.fn() };
      const expectedStaringPosition = { line: 4, character: 5 };
      const expectedEndingPosition = { line: 6, character: 7 };
      const expectedStartingCharacter = 45;
      const expectedEndingCharacter = 123;
      const stubSelection = { start: expectedStaringPosition, end: expectedEndingPosition };
      mockAsRelativePath.mockReturnValue(uriPath);
      mockIsTestFile.mockReturnValue(false);
      window.activeTextEditor = {
        selection: stubSelection,
        document: mockDocument,
      };
      when(mockDocument.offsetAt)
        .calledWith(expectedStaringPosition)
        .mockReturnValueOnce(expectedStartingCharacter)
        .calledWith(expectedEndingPosition)
        .mockReturnValueOnce(expectedEndingCharacter);

      await mutateSelectionCommand(run)(new Uri({ path: uriPath }));

      expect(run).toHaveBeenCalledWith({
        file: expect.objectContaining({ path: uriPath }),
        range: `${expectedStartingCharacter}..${expectedEndingCharacter}`,
      });
      expect(isTestFile).toHaveBeenCalledWith(expect.stringContaining(uriPath));
      expect(showInvalidFileMessage).not.toHaveBeenCalled();
    });
  });

  describe('WHEN running stryker to mutate a solution', () => {
    // let mockCommandRunner = commandRunner as jest.MockedFn<typeof commandRunner>;
    let uriPath: string;
    let stubFilters: Record<string, string[]>;
    let dialogOptions: OpenDialogOptions;

    beforeEach(async () => {
      stubFilters = {
        'C# Files': ['cs'],
        '.Net Solution Files': ['sln'],
        '.Net Project Files': ['csproj'],
        '.Net TestProject Files': ['Tests.csproj', 'Test.csproj'],
        'All Files': ['*'],
      };
      dialogOptions = {
        canSelectMany: false,
        filters: stubFilters,
      };

      // mockCommandRunner = jest.fn();
      uriPath = 'aSolution.sln';
    });

    // it('should return a function', () => {
    //   expect(mutateSolutionCommand(jest.fn())).toEqual(expect.any(Function));
    // });

    describe('GIVEN a solution file', () => {
      // describe('AND GIVEN no URI is passed as arguments', () => {
      //   it('THEN should show an error message', async () => {
      //     // //const run = jest.fn();

      //     // await mutateSolutionCommand(mockCommandRunner)();

      //     // expect(mockCommandRunner).not.toHaveBeenCalledWith();
      //     // expect(mockShowErrorMessage).toHaveBeenCalledTimes(1);
      //     const run = jest.fn();

      //     await mutateSolutionCommand(run)();

      //     expect(run).not.toHaveBeenCalled();
      //     // expect(isTestFile).not.toHaveBeenCalled();
      //     // expect(showInvalidFileMessage).not.toHaveBeenCalled();
      //   });
      // });

      describe('AND GIVEN the solutin file URI as arguments', () => {
        it('THEN should run a command for the solution', async () => {
          const uriUseToCall: Uri = new Uri({ path: uriPath });
          const expectedUri: unknown = { path: uriPath };
          mockAsRelativePath.mockReturnValue(uriPath);
          mockIsTestFile.mockReturnValue(false);

          await mutateSolutionCommand(mockCommandRunner)(uriUseToCall);

          expect(showInvalidFileMessage).not.toHaveBeenCalledWith();
          expect(mockCommandRunner).toHaveBeenCalledWith({ file: expect.objectContaining(expectedUri) });
        });
      });

      describe('AND GIVEN the Uri parameter is empty', () => {
        const expectChosenFileOrFolderMissing = 'Stryker.NET: You must select a file or folder';

        describe('AND GIVEN the solution file is the active document', () => {
          it('THEN should run a command', async () => {
            const mockDocument = { fileName: uriPath, uri: new Uri({ path: uriPath }) };
            window.activeTextEditor = {
              document: mockDocument,
            };
            const expectedUri: unknown = { path: uriPath };
            mockAsRelativePath.mockReturnValue(uriPath);
            mockIsTestFile.mockReturnValue(false);

            await mutateSolutionCommand(mockCommandRunner)({ path: '' });

            expect(mockCommandRunner).toHaveBeenCalledTimes(1);
            expect(mockCommandRunner).toHaveBeenCalledWith({ file: expect.objectContaining(expectedUri) });
            expect(mockShowErrorMessage).not.toHaveBeenCalled();
          });
        });

        describe('AND GIVEN the active document is not a .sln file', () => {
          it('THEN should show OpenDialog', async () => {
            const uriPath: string = 'x.md';
            const mockDocument = { fileName: uriPath, uri: new Uri({ path: uriPath }) };
            window.activeTextEditor = {
              document: mockDocument,
            };

            await mutateSolutionCommand(mockCommandRunner)();

            expect(mockCommandRunner).not.toHaveBeenCalled();
            expect(mockShowOpenDialog).toHaveBeenCalledTimes(1);
            expect(mockShowErrorMessage).toHaveBeenCalledWith(expectChosenFileOrFolderMissing);
          });
        });

        describe('AND GIVEN canceling the OpenDialog', () => {
          it('THEN should display an error message that no valid selection was made', async () => {
            window.activeTextEditor = {
              document: undefined,
            };
            when(mockShowOpenDialog).calledWith(expect.anything()).mockResolvedValue(undefined);

            await mutateSolutionCommand(mockCommandRunner)({ path: '' });

            expect(mockCommandRunner).not.toHaveBeenCalled();
            expect(mockShowErrorMessage).toHaveBeenCalledWith(expectChosenFileOrFolderMissing);
          });
        });

        describe('AND GIVEN something has been chosen in OpenDialog', () => {
          it('THEN should display an error message that no valid selection was made', async () => {
            window.activeTextEditor = {
              document: undefined,
            };
            when(mockShowOpenDialog).calledWith(expect.anything()).mockResolvedValue([]);

            await mutateFileCommand(mockCommandRunner)({ path: '' });

            expect(mockCommandRunner).not.toHaveBeenCalled();
            expect(mockShowErrorMessage).toHaveBeenCalledWith(expectChosenFileOrFolderMissing);
          });
        });

        describe('AND GIVEN a sln file is chosen in the OpenDialog', () => {
          it('THEN should run a command', async () => {
            const aSlnFullPath: Uri = Uri.file('./tempo/tryout.sln');
            const expectedUri: unknown = { path: aSlnFullPath.fsPath };
            window.activeTextEditor = {
              document: undefined,
            };
            when(mockShowOpenDialog).calledWith(dialogOptions).mockResolvedValue([aSlnFullPath]);

            await mutateFileCommand(mockCommandRunner)({ path: '' });

            expect(mockCommandRunner).toHaveBeenCalledTimes(1);
            expect(mockCommandRunner).toHaveBeenCalledWith({ file: expect.objectContaining(expectedUri) });
            expect(mockShowErrorMessage).not.toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe('WHEN installing the dotnet-stryker tool', () => {
    describe('GIVEN the dotnet-stryker tool install is successful', () => {
      const expectedSucessfulInstallationMessage = 'Stryker.NET: dotnet-stryker tool has been installed';

      beforeEach(() => {
        // Arrange (GIVEN)
        when(mockDotnet.installStrykerTool).mockResolvedValue(true);
      });

      it('THEN should show the VSCode information message that the installation was successful', async () => {
        // Arrange (GIVEN)

        // Act (WHEN)
        await installStrykerDotnetToolCommand(mockDotnet)();

        // Assert (THEN)
        expect(window.showInformationMessage).toHaveBeenCalledTimes(1);
        expect(window.showInformationMessage).toHaveBeenCalledWith(expectedSucessfulInstallationMessage);
      });
    });

    describe('GIVEN the dotnet-stryker tool installation fails', () => {
      const expectedFailedInstallationMessage = 'Stryker.NET: dotnet-stryker tool is not installed';

      beforeEach(() => {
        // Arrange (GIVEN)
        when(mockDotnet.installStrykerTool).mockResolvedValue(false);
      });

      it('THEN should show the VSCode warning message that the installation failed', async () => {
        // Arrange (GIVEN)

        // Act (WHEN)
        await installStrykerDotnetToolCommand(mockDotnet)();

        // Assert (THEN)
        expect(window.showWarningMessage).toHaveBeenCalledTimes(1);
        expect(window.showWarningMessage).toHaveBeenCalledWith(expectedFailedInstallationMessage);
      });
    });
  });

  describe('WHEN uninstalling the dotnet-stryker tool', () => {
    describe('GIVEN the dotnet-stryker tool is uninstalled is successful', () => {
      const expectedSucessfulUninstallationMessage = 'Stryker.NET: dotnet-stryker tool has been uninstalled';

      beforeEach(() => {
        // Arrange (GIVEN)
        when(mockDotnet.uninstallStrykerTool).mockResolvedValue(true);
      });

      it('THEN should show the VSCode information message that the uninstallation was successful', async () => {
        // Arrange (GIVEN)

        // Act (WHEN)
        await uninstallStrykerDotnetToolCommand(mockDotnet)();

        // Assert (THEN)
        expect(window.showInformationMessage).toHaveBeenCalledTimes(1);
        expect(window.showInformationMessage).toHaveBeenCalledWith(expectedSucessfulUninstallationMessage);
      });
    });

    describe('GIVEN the dotnet-stryker tool uninstallation fails', () => {
      const expectedFailedUninstallationMessage = 'Stryker.NET: dotnet-stryker tool uninstallation failed';

      beforeEach(() => {
        // Arrange (GIVEN)
        when(mockDotnet.uninstallStrykerTool).mockResolvedValue(false);
      });

      it('THEN should show the VSCode warning message that the uninstallation failed', async () => {
        // Arrange (GIVEN)

        // Act (WHEN)
        await uninstallStrykerDotnetToolCommand(mockDotnet)();

        // Assert (THEN)
        expect(window.showWarningMessage).toHaveBeenCalledTimes(1);
        expect(window.showWarningMessage).toHaveBeenCalledWith(expectedFailedUninstallationMessage);
      });
    });
  });

  describe('WHEN creating the boilerplate configuration file for Stryker', () => {
    const testFolder: string = './folder.Tests';

    describe('GIVEN the initialization worked', () => {
      it('THEN should show the vscode information message windows with the returned configuration file', async () => {
        // Arrange (GIVEN)
        const expectedConfigurationFileOutput: string = `Stryker.NET: ${testFolder}/stryker-config.json`;
        when(mockDotnet.initializeStrykerConfiguration)
          .calledWith(expect.any(String))
          .mockResolvedValue(expectedConfigurationFileOutput);

        // Act (WHEN)
        await createBoilerplateStrykerConfigurationFileCommand(mockDotnet)(testFolder);

        // Assert (THEN)
        expect(window.showInformationMessage).toHaveBeenCalledTimes(1);
        expect(window.showInformationMessage).toHaveBeenCalledWith(expectedConfigurationFileOutput);
      });
    });
    describe('GIVEN the initialization failed', () => {
      it('THEN should show the vscode error message windows with the error received', async () => {
        // Arrange (GIVEN)
        const expectedErrorMessage: string =
          'Expected Error When calling dotnet.InitializeStrykerConfiguration during the test';
        when(mockDotnet.initializeStrykerConfiguration)
          .calledWith(expect.any(String))
          .mockRejectedValue(expectedErrorMessage);

        // Act (WHEN)
        await createBoilerplateStrykerConfigurationFileCommand(mockDotnet)(testFolder);

        // Assert (THEN)
        expect(window.showErrorMessage).toHaveBeenCalledTimes(1);
        expect(window.showErrorMessage).toHaveBeenCalledWith(expectedErrorMessage);
      });
    });
  });
});

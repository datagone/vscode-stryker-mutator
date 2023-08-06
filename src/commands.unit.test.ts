import { when } from 'jest-when';
import { Uri, mockAsRelativePath, mockShowErrorMessage, window } from '../__mocks__/vscode';
import {
  createBoilerplateStrykerConfigurationFileCommand,
  installStrykerDotnetToolCommand,
  uninstallStrykerDotnetToolCommand,
  mutateWorkspaceCommand,
  mutateFolderCommand,
  mutateSolutionCommand,
  mutateProjectCommand,
  mutateFileCommand,
  mutateSelectionCommand,
} from './commands';
import { DotnetType } from './dotnet';
import { mockConsoleLog } from './test-helpers';
import { isTestFile, showInvalidFileMessage } from './valid-files';
import { commandRunner } from './stryker';
import { selectAFileToMutateFrom, selectAFolderToMutateFrom } from './fileSelector';
import PathToMutate from './pathToMutate';
import { chooseToRunFullMutationTest } from './warningMessenger';

jest.mock('./valid-files');
jest.mock('./stryker.ts');
jest.mock('./fileSelector');
jest.mock('./pathToMutate');
jest.mock('./warningMessenger');

let mockIsTestFile: jest.MockedFn<typeof isTestFile>;
let mockCommandRunner: jest.MockedFn<typeof commandRunner>;
let mockChooseToRunFullMutationTest: jest.MockedFn<typeof chooseToRunFullMutationTest>;

let mockDotnet: DotnetType;

describe('USING Commands', () => {
  mockConsoleLog();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    mockIsTestFile = isTestFile as jest.MockedFn<typeof isTestFile>;
    mockCommandRunner = commandRunner as jest.MockedFn<typeof commandRunner>;
    mockChooseToRunFullMutationTest = chooseToRunFullMutationTest as jest.MockedFn<typeof chooseToRunFullMutationTest>;

    // Arrange
    mockDotnet = {
      isSdkInstalled: jest.fn(),
      isStrykerToolInstalled: jest.fn(),

      installStrykerTool: jest.fn(),
      uninstallStrykerTool: jest.fn(),

      initializeStrykerConfiguration: jest.fn(),
    };
  });

  describe('WHEN command to mutate the workspace', () => {
    it('THEN a warning is shown to the user', async () => {
      await mutateWorkspaceCommand(mockCommandRunner)();
      expect(mockChooseToRunFullMutationTest).toBeCalledTimes(1);
    });

    describe('GIVEN a warning shown to the user', () => {
      describe('AND GIVEN the user refuses to continue', () => {
        it('THEN should not run the command', async () => {
          mockChooseToRunFullMutationTest.mockResolvedValue(false);
          await mutateWorkspaceCommand(mockCommandRunner)();
          expect(mockCommandRunner).not.toHaveBeenCalled();
        });
      });
      describe('AND GIVEN the user chooses to continue', () => {
        it('THEN should run a command', async () => {
          mockChooseToRunFullMutationTest.mockResolvedValue(true);
          await mutateWorkspaceCommand(mockCommandRunner)();
          expect(mockCommandRunner).toHaveBeenCalledTimes(1);
          expect(mockCommandRunner).toHaveBeenCalledWith({});
        });
      });
    });
  });

  describe('WHEN command to mutate a folder', () => {
    const mockSelectAFolderToMutateFrom = selectAFolderToMutateFrom as jest.MockedFn<typeof selectAFolderToMutateFrom>;

    it('THEN a warning is shown to the user', async () => {
      await mutateFolderCommand(mockCommandRunner)();
      expect(mockChooseToRunFullMutationTest).toBeCalledTimes(1);
    });

    describe('GIVEN a warning shown to the user', () => {
      describe('AND GIVEN the user refuses to continue', () => {
        beforeEach(() => {
          mockChooseToRunFullMutationTest.mockResolvedValue(false);
        });

        it('THEN selection of the folder is not called', async () => {
          await mutateFolderCommand(mockCommandRunner)();
          expect(mockSelectAFolderToMutateFrom).not.toHaveBeenCalled();
        });
      });

      describe('AND GIVEN the user chooses to continue', () => {
        beforeEach(() => {
          mockChooseToRunFullMutationTest.mockResolvedValue(true);
        });

        describe('AND GIVEN there is no folder path to mutate', () => {
          it('THEN should call to select a folder to mutate from', async () => {
            await mutateFolderCommand(mockCommandRunner)();

            expect(mockSelectAFolderToMutateFrom).toHaveBeenCalledTimes(1);
            expect(mockCommandRunner).not.toHaveBeenCalled();
          });

          describe('AND GIVEN the selection does not return the Uri', () => {
            it('THEN should show an error without executing the commandRunner', async () => {
              const expectedRejectionMessage: string = 'err';
              mockSelectAFolderToMutateFrom.mockRejectedValue(expectedRejectionMessage);

              await mutateFolderCommand(mockCommandRunner)();

              expect(mockSelectAFolderToMutateFrom).toHaveBeenCalledTimes(1);
              expect(mockShowErrorMessage).toHaveBeenCalledTimes(1);
              expect(mockShowErrorMessage).toHaveBeenCalledWith(expect.stringContaining(expectedRejectionMessage));
              expect(mockCommandRunner).not.toHaveBeenCalled();
            });
          });

          describe('AND GIVEN the selection returns a valid path to mutate', () => {
            it('THEN should execute the commandRunner', async () => {
              const aValidFolderToMutate: Uri = Uri.file('./this/is/a/folder');
              mockSelectAFolderToMutateFrom.mockResolvedValue(aValidFolderToMutate);
              mockAsRelativePath.mockReturnValue(aValidFolderToMutate.fsPath);
              mockIsTestFile.mockReturnValue(false);

              const mockPathToMutate = PathToMutate as jest.MockedClass<typeof PathToMutate>;
              mockPathToMutate.prototype.pathToMutateValidation.mockResolvedValue();

              await mutateFolderCommand(mockCommandRunner)();

              expect(mockSelectAFolderToMutateFrom).toHaveBeenCalledTimes(1);
              expect(mockShowErrorMessage).toHaveBeenCalledTimes(0);
              expect(mockPathToMutate).toHaveBeenCalled();
              expect(mockPathToMutate.prototype.pathToMutateValidation).toHaveBeenCalledTimes(1);
              expect(mockCommandRunner).toHaveBeenCalledTimes(1);
              expect(mockCommandRunner).toHaveBeenCalledWith({ file: expect.any(PathToMutate) });
            });
          });
        });
      });
    });
  });

  describe('WHEN command to mutate a solution', () => {
    const mockSelectAFileToMutateFrom = selectAFileToMutateFrom as jest.MockedFn<typeof selectAFileToMutateFrom>;

    it('THEN a warning is shown to the user', async () => {
      await mutateSolutionCommand(mockCommandRunner)();
      expect(mockChooseToRunFullMutationTest).toBeCalledTimes(1);
    });

    describe('GIVEN a warning shown to the user', () => {
      describe('AND GIVEN the user refuses to continue', () => {
        beforeEach(() => {
          mockChooseToRunFullMutationTest.mockResolvedValue(false);
        });

        it('THEN selection of the file is not called', async () => {
          await mutateSolutionCommand(mockCommandRunner)();
          expect(mockSelectAFileToMutateFrom).not.toHaveBeenCalled();
        });
      });

      describe('AND GIVEN the user chooses to continue', () => {
        beforeEach(() => {
          mockChooseToRunFullMutationTest.mockResolvedValue(true);
        });

        describe('GIVEN there is no solution path to mutate', () => {
          it('THEN should call to select a file to mutate from', async () => {
            await mutateSolutionCommand(mockCommandRunner)();

            expect(mockSelectAFileToMutateFrom).toHaveBeenCalledTimes(1);
            expect(mockCommandRunner).not.toHaveBeenCalled();
          });

          describe('AND GIVEN the selection does not return the Uri', () => {
            it('THEN should show an error without executing the commandRunner', async () => {
              const expectedRejectionMessage: string = 'err';
              mockSelectAFileToMutateFrom.mockRejectedValue(expectedRejectionMessage);

              await mutateSolutionCommand(mockCommandRunner)();

              expect(mockSelectAFileToMutateFrom).toHaveBeenCalledTimes(1);
              expect(mockShowErrorMessage).toHaveBeenCalledTimes(1);
              expect(mockShowErrorMessage).toHaveBeenCalledWith(expect.stringContaining(expectedRejectionMessage));
              expect(mockCommandRunner).not.toHaveBeenCalled();
            });
          });

          describe('AND GIVEN the selection returns a valid file to mutate', () => {
            it('THEN should execute the commandRunner', async () => {
              const aValidSolutionToMutate: Uri = Uri.file('./aFileToMutate.cs');
              mockSelectAFileToMutateFrom.mockResolvedValue(aValidSolutionToMutate);
              mockAsRelativePath.mockReturnValue(aValidSolutionToMutate.fsPath);
              mockIsTestFile.mockReturnValue(false);

              const mockPathToMutate = PathToMutate as jest.MockedClass<typeof PathToMutate>;
              mockPathToMutate.prototype.pathToMutateValidation.mockResolvedValue();

              await mutateSolutionCommand(mockCommandRunner)();

              expect(mockSelectAFileToMutateFrom).toHaveBeenCalledTimes(1);
              expect(mockShowErrorMessage).toHaveBeenCalledTimes(0);
              expect(mockPathToMutate).toHaveBeenCalled();
              expect(mockPathToMutate.prototype.pathToMutateValidation).toHaveBeenCalledTimes(1);
              expect(mockCommandRunner).toHaveBeenCalledTimes(1);
              expect(mockCommandRunner).toHaveBeenCalledWith({ file: expect.any(PathToMutate) });
            });
          });
        });
      });
    });
  });

  describe('WHEN command to mutate a project', () => {
    const mockSelectAFileToMutateFrom = selectAFileToMutateFrom as jest.MockedFn<typeof selectAFileToMutateFrom>;

    it('THEN a warning is shown to the user', async () => {
      await mutateProjectCommand(mockCommandRunner)();
      expect(mockChooseToRunFullMutationTest).toBeCalledTimes(1);
    });

    describe('GIVEN a warning shown to the user', () => {
      describe('AND GIVEN the user refuses to continue', () => {
        beforeEach(() => {
          mockChooseToRunFullMutationTest.mockResolvedValue(false);
        });

        it('THEN selection of the file is not called', async () => {
          await mutateProjectCommand(mockCommandRunner)();
          expect(mockSelectAFileToMutateFrom).not.toHaveBeenCalled();
        });
      });

      describe('AND GIVEN the user chooses to continue', () => {
        beforeEach(() => {
          mockChooseToRunFullMutationTest.mockResolvedValue(true);
        });

        describe('GIVEN there is no project path to mutate', () => {
          it('THEN should call to select a file to mutate from', async () => {
            await mutateProjectCommand(mockCommandRunner)();

            expect(mockSelectAFileToMutateFrom).toHaveBeenCalledTimes(1);
            expect(mockCommandRunner).not.toHaveBeenCalled();
          });

          describe('AND GIVEN the selection does not return the Uri', () => {
            it('THEN should show an error without executing the commandRunner', async () => {
              const expectedRejectionMessage: string = 'err';
              mockSelectAFileToMutateFrom.mockRejectedValue(expectedRejectionMessage);

              await mutateProjectCommand(mockCommandRunner)();

              expect(mockSelectAFileToMutateFrom).toHaveBeenCalledTimes(1);
              expect(mockShowErrorMessage).toHaveBeenCalledTimes(1);
              expect(mockShowErrorMessage).toHaveBeenCalledWith(expect.stringContaining(expectedRejectionMessage));
              expect(mockCommandRunner).not.toHaveBeenCalled();
            });
          });

          describe('AND GIVEN the selection returns a valid file to mutate', () => {
            it('THEN should execute the commandRunner', async () => {
              const aValidProjectToMutate: Uri = Uri.file('./aProjectToMutate.csproj');
              mockSelectAFileToMutateFrom.mockResolvedValue(aValidProjectToMutate);
              mockAsRelativePath.mockReturnValue(aValidProjectToMutate.fsPath);
              mockIsTestFile.mockReturnValue(false);

              const mockPathToMutate = PathToMutate as jest.MockedClass<typeof PathToMutate>;
              mockPathToMutate.prototype.pathToMutateValidation.mockResolvedValue();

              await mutateProjectCommand(mockCommandRunner)();

              expect(mockSelectAFileToMutateFrom).toHaveBeenCalledTimes(1);
              expect(mockShowErrorMessage).toHaveBeenCalledTimes(0);
              expect(mockPathToMutate).toHaveBeenCalled();
              expect(mockPathToMutate.prototype.pathToMutateValidation).toHaveBeenCalledTimes(1);
              expect(mockCommandRunner).toHaveBeenCalledTimes(1);
              expect(mockCommandRunner).toHaveBeenCalledWith({ file: expect.any(PathToMutate) });
            });
          });
        });
      });
    });
  });

  describe('WHEN command to mutate a file', () => {
    const mockSelectAFileToMutateFrom = selectAFileToMutateFrom as jest.MockedFn<typeof selectAFileToMutateFrom>;

    describe('GIVEN there is no file path to mutate', () => {
      it('THEN should call to select a file to mutate from', async () => {
        await mutateFileCommand(mockCommandRunner)();

        expect(mockSelectAFileToMutateFrom).toHaveBeenCalledTimes(1);
        expect(mockCommandRunner).not.toHaveBeenCalled();
      });

      describe('AND GIVEN the selection does not return the Uri', () => {
        it('THEN should show an error without executing the commandRunner', async () => {
          const expectedRejectionMessage: string = 'err';
          mockSelectAFileToMutateFrom.mockRejectedValue(expectedRejectionMessage);

          await mutateFileCommand(mockCommandRunner)();

          expect(mockSelectAFileToMutateFrom).toHaveBeenCalledTimes(1);
          expect(mockShowErrorMessage).toHaveBeenCalledTimes(1);
          expect(mockShowErrorMessage).toHaveBeenCalledWith(expect.stringContaining(expectedRejectionMessage));
          expect(mockCommandRunner).not.toHaveBeenCalled();
        });
      });

      describe('AND GIVEN the selection returns a valid file to mutate', () => {
        it('THEN should execute the commandRunner', async () => {
          const aValidFileToMutate: Uri = Uri.file('./aFileToMutate.cs');
          mockSelectAFileToMutateFrom.mockResolvedValue(aValidFileToMutate);
          mockAsRelativePath.mockReturnValue(aValidFileToMutate.fsPath);
          mockIsTestFile.mockReturnValue(false);

          const mockPathToMutate = PathToMutate as jest.MockedClass<typeof PathToMutate>;
          mockPathToMutate.prototype.pathToMutateValidation.mockResolvedValue();

          await mutateFileCommand(mockCommandRunner)();

          expect(mockSelectAFileToMutateFrom).toHaveBeenCalledTimes(1);
          expect(mockShowErrorMessage).toHaveBeenCalledTimes(0);
          expect(mockPathToMutate).toHaveBeenCalled();
          expect(mockPathToMutate.prototype.pathToMutateValidation).toHaveBeenCalledTimes(1);
          expect(mockCommandRunner).toHaveBeenCalledTimes(1);
          expect(mockCommandRunner).toHaveBeenCalledWith({ file: expect.any(PathToMutate) });
        });
      });
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

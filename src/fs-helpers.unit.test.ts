import { Stats, existsSync, lstatSync } from 'fs';
import path from 'path';
import { Uri, workspace } from '../__mocks__/vscode';
import { getCurrentWorkspacePath, getDotNetSolutionFolderPath, isDirectoryPath, isFileExists } from './fs-helpers';
import { InvalidDotNetSolutionFolderPathException, InvalidWorkspaceException } from './fs-helpers-exception';
import { dotnetSolutionFolder } from './config';

jest.mock('fs');
jest.mock('./config');

const mockExistsSync = existsSync as jest.MockedFn<typeof existsSync>;
const mockLStatSync = lstatSync as jest.MockedFn<typeof lstatSync>;
const fakeStats = {} as Partial<Stats>;

const mockConfigDotnetSolutionFolder = dotnetSolutionFolder as jest.MockedFn<typeof dotnetSolutionFolder>;

const mockReturnValueTimes = <T extends jest.Mock, Y>(times: number, method: T, value: Y) => {
  new Array(times).fill(1).forEach(() => method.mockReturnValueOnce(value));
};

describe('Filesytem helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    // A minority of tests use a Windows back slash path separator, default to forward slash
    (path.sep as any) = '/';
  });

  describe('When determine if path is a directory', () => {
    // Arrange
    const PATH_DOES_NOT_EXISTS = false;
    const PATH_EXISTS = true;
    const EXPECTED_NOT_A_DIRECTORY = false;
    const EXPECTED_A_DIRECTORY = true;
    const A_FULL_PATH_THAT_DOES_NOT_EXIST = 'root/path/doesnt/exists';
    const A_FULL_DIRECTORY_PATH_THAT_EXISTS = 'root/path/exists';
    const A_FULL_PATH_OF_A_FILE = 'root/path/exists/file.txt';

    describe('Given a path does not exist', () => {
      it('should not be a directory', () => {
        // Arrange (GIVEN)
        mockExistsSync.mockReturnValue(PATH_DOES_NOT_EXISTS);
        // Act (WHEN)
        const actual = isDirectoryPath(A_FULL_PATH_THAT_DOES_NOT_EXIST);
        // Assert (THEN)
        expect(actual).toEqual(EXPECTED_NOT_A_DIRECTORY);
      });
    });

    describe('Given a path exists', () => {
      beforeEach(() => {
        // Arrange (GIVEN)
        mockExistsSync.mockReturnValue(PATH_EXISTS);
      });

      describe('And Given a path is a file', () => {
        it('should not be a directory', () => {
          // Arrange (GIVEN)
          fakeStats.isDirectory = () => false;
          mockLStatSync.mockReturnValue(fakeStats as unknown as Stats);
          // Act (WHEN)
          const actual = isDirectoryPath(A_FULL_PATH_OF_A_FILE);
          // Assert (THEN)
          expect(actual).toEqual(EXPECTED_NOT_A_DIRECTORY);
        });
      });

      describe('And Given a path is a directory', () => {
        it('should be a directory', () => {
          // Arrange (GIVEN)
          fakeStats.isDirectory = () => true;
          mockLStatSync.mockReturnValue(fakeStats as unknown as Stats);
          // Act (WHEN)
          const actual = isDirectoryPath(A_FULL_DIRECTORY_PATH_THAT_EXISTS);
          // Assert (THEN)
          expect(actual).toEqual(EXPECTED_A_DIRECTORY);
        });
      });
    });
  });

  describe('When determine if a file path exists', () => {
    // Arrange
    const PATH_DOES_NOT_EXISTS = false;
    const PATH_EXISTS = true;
    const EXPECTED_NOT_A_FILE = false;
    const EXPECTED_A_FILE = true;
    const A_FULL_DIRECTORY_PATH_THAT_EXISTS = 'root/path/exists';
    const A_FULL_FILE_PATH_THAT_EXISTS = 'root/path/exists/file.txt';
    const A_FULL_FILE_PATH_THAT_DOES_NOT_EXIST = 'root/path/doesnt/exists/file.txt';

    describe('Given a missing file', () => {
      it('should return that the file does not exists', () => {
        // Arrange (GIVEN)
        mockExistsSync.mockReturnValue(PATH_DOES_NOT_EXISTS);
        // Act (WHEN)
        const actual = isFileExists(A_FULL_FILE_PATH_THAT_DOES_NOT_EXIST);
        // Assert (THEN)
        expect(actual).toEqual(EXPECTED_NOT_A_FILE);
      });
    });

    describe('Given a path exists', () => {
      beforeEach(() => {
        // Arrange (GIVEN)
        mockExistsSync.mockReturnValue(PATH_EXISTS);
      });

      describe('And Given a path is folder', () => {
        it('should return that the file does not exists', () => {
          // Arrange (GIVEN)
          fakeStats.isFile = () => false;
          mockLStatSync.mockReturnValue(fakeStats as unknown as Stats);
          // Act (WHEN)
          const actual = isFileExists(A_FULL_DIRECTORY_PATH_THAT_EXISTS);
          // Assert (THEN)
          expect(actual).toEqual(EXPECTED_NOT_A_FILE);
        });
      });

      describe('And Given a path is a file', () => {
        it('should returns that the file exists', () => {
          // Arrange (GIVEN)
          fakeStats.isFile = () => true;
          mockLStatSync.mockReturnValue(fakeStats as unknown as Stats);
          // Act (WHEN)
          const actual = isFileExists(A_FULL_FILE_PATH_THAT_EXISTS);
          // Assert (THEN)
          expect(actual).toEqual(EXPECTED_A_FILE);
        });
      });
    });
  });

  describe('When getting the current workspace path', () => {
    const INVALID_WORKSPACE_ERROR_MESSAGE: string = 'Workspace Folders cannot be empty';

    describe('Given the workspace folders is undefined', () => {
      it('Then should throws an invalid workspace exception', () => {
        // Arrange (GIVEN)
        workspace.workspaceFolders = undefined as any;
        // Act (WHEN)
        const result = () => getCurrentWorkspacePath();
        // Assert (THEN)
        expect(result).toThrow(InvalidWorkspaceException);
        expect(result).toThrowError(INVALID_WORKSPACE_ERROR_MESSAGE);
      });
    });

    describe('Given the workspace folders is empty', () => {
      it('Then should throws an invalid workspace exception', () => {
        // Arrange (GIVEN)
        workspace.workspaceFolders = [] as any;
        // Act (WHEN)
        const result = () => getCurrentWorkspacePath();
        // Assert (THEN)
        expect(result).toThrow(InvalidWorkspaceException);
        expect(result).toThrowError(INVALID_WORKSPACE_ERROR_MESSAGE);
      });
    });

    describe('Given the workspace folders contains one folder', () => {
      it('Then should return the full path', () => {
        // Arrange (GIVEN)
        const folder = { uri: Uri.parse('/my/special/workspace/folder/path/') };
        const stubWorkspaceFolders = [folder];
        workspace.workspaceFolders = stubWorkspaceFolders as any;
        // Act (WHEN)
        const result = getCurrentWorkspacePath();
        // Assert (THEN)
        expect(result).toBe(folder.uri.fsPath);
      });
    });

    describe('Given the workspace folders contains multiple folders', () => {
      it('Then should return the first full path folder', () => {
        // Arrange (GIVEN)
        const folderOne = { uri: Uri.parse('/my/special/workspace/folder/path/1/') };
        const folderTwo = { uri: Uri.parse('/my/special/workspace/folder/path/2/') };
        const stubWorkspaceFolders = [folderOne, folderTwo];
        workspace.workspaceFolders = stubWorkspaceFolders as any;
        // Act (WHEN)
        const result = getCurrentWorkspacePath();
        // Assert (THEN)
        expect(result).toBe(folderOne.uri.fsPath);
      });
    });
  });

  describe('When getting the dotnet solution folder path', () => {
    const WORKSPACE_FOLDER: string = '/path/to/my/workspace/folder';
    const SOLUTION_FOLDER_PATH_WITH_DOT_AND_SLASH: string = './';
    const SOLUTION_FOLDER_PATH_WITH_DOTS_AND_SLASH: string = '../';
    const SOLUTION_FOLDER_PATH_WITH_DOTS_AND_SLASHES: string = '/./../';
    const SOLUTION_FOLDER_PATH_WITH_SLASH: string = '/';
    const SOLUTION_FOLDER_PATH_CONTAINS_A_FOLDER_NAME: string = 'aFolderName';
    const SOLUTION_FOLDER_DOES_NOT_EXIST: string = 'solution/folder/does/not/exists/';
    const SOLUTION_FILE_PATH: string = 'aFolderName/solution.sln';

    const INVALID_DOTNET_SOLUTION_FOLDER_ERROR_MESSAGE: string =
      'The .NET Solution folder must exists. Check your settings.';

    let folder = undefined as any;
    let expectedFolder: string;

    beforeEach(() => {
      // Arrange (GIVEN)
      folder = { uri: Uri.parse(WORKSPACE_FOLDER) };
      const stubWorkspaceFolders = [folder];
      workspace.workspaceFolders = stubWorkspaceFolders as any;
      expectedFolder = path.normalize(`${folder.uri.fsPath}/`);
    });

    describe('Given the solution folder path is undefined', () => {
      it('Then should return the workspace path', () => {
        // Arrange (GIVEN)
        mockConfigDotnetSolutionFolder.mockReturnValue(undefined);
        // Act (WHEN)
        const result = getDotNetSolutionFolderPath();
        // Assert (THEN)
        expect(result).toBe(expectedFolder);
      });
    });

    describe('Given the solution folder path is a valid folder path', () => {
      beforeEach(() => {
        mockExistsSync.mockReturnValue(true);

        fakeStats.isFile = () => false;
        fakeStats.isDirectory = () => true;
        mockLStatSync.mockReturnValue(fakeStats as unknown as Stats);
      });

      describe('Given the solution folder path contains slash', () => {
        it('Then should return the workspace path', () => {
          // Arrange (GIVEN)
          mockConfigDotnetSolutionFolder.mockReturnValue(SOLUTION_FOLDER_PATH_WITH_SLASH);
          // Act (WHEN)
          const result = getDotNetSolutionFolderPath();
          // Assert (THEN)
          expect(result).toBe(expectedFolder);
        });
      });

      describe('Given the solution folder path contains 1 dot and slash', () => {
        it('Then should return the workspace path', () => {
          // Arrange (GIVEN)
          mockConfigDotnetSolutionFolder.mockReturnValue(SOLUTION_FOLDER_PATH_WITH_DOT_AND_SLASH);
          // Act (WHEN)
          const result = getDotNetSolutionFolderPath();
          // Assert (THEN)
          expect(result).toBe(expectedFolder);
        });
      });

      describe('Given the solution folder path contains 2 dots and slash', () => {
        it('Then should return the workspace path', () => {
          // Arrange (GIVEN)
          mockConfigDotnetSolutionFolder.mockReturnValue(SOLUTION_FOLDER_PATH_WITH_DOTS_AND_SLASH);
          // Act (WHEN)
          const result = getDotNetSolutionFolderPath();
          // Assert (THEN)
          expect(result).toBe(expectedFolder);
        });
      });

      describe('Given the solution folder path contains dots and slashes', () => {
        it('Then should return the workspace path', () => {
          // Arrange (GIVEN)
          mockConfigDotnetSolutionFolder.mockReturnValue(SOLUTION_FOLDER_PATH_WITH_DOTS_AND_SLASHES);
          // Act (WHEN)
          const result = getDotNetSolutionFolderPath();
          // Assert (THEN)
          expect(result).toBe(expectedFolder);
        });
      });

      describe('Given the solution folder path contains aFolderName', () => {
        it('Then should return the workspace path followed by aFolderName', () => {
          // Arrange (GIVEN)
          mockConfigDotnetSolutionFolder.mockReturnValue(SOLUTION_FOLDER_PATH_CONTAINS_A_FOLDER_NAME);
          expectedFolder = path.normalize(`${expectedFolder}/${SOLUTION_FOLDER_PATH_CONTAINS_A_FOLDER_NAME}/`);
          // Act (WHEN)
          const result = getDotNetSolutionFolderPath();
          // Assert (THEN)
          expect(result).toBe(expectedFolder);
        });
      });
    });

    describe('Given the solution folder path contains a solution file in aFolderName', () => {
      beforeEach(() => {
        mockExistsSync.mockReturnValue(true);

        fakeStats.isFile = () => true;
        fakeStats.isDirectory = () => false;
        mockLStatSync.mockReturnValue(fakeStats as unknown as Stats);
      });

      it('Then should return the workspace path', () => {
        // Arrange (GIVEN)
        mockConfigDotnetSolutionFolder.mockReturnValue(SOLUTION_FILE_PATH);
        expectedFolder = path.normalize(`${expectedFolder}/${SOLUTION_FOLDER_PATH_CONTAINS_A_FOLDER_NAME}/`);
        // Act (WHEN)
        const result = getDotNetSolutionFolderPath();
        // Assert (THEN)
        expect(result).toBe(expectedFolder);
      });
    });

    describe('Given the solution folder path does not exists', () => {
      beforeEach(() => {
        mockExistsSync.mockReturnValue(false);

        fakeStats.isFile = () => false;
        fakeStats.isDirectory = () => false;
        mockLStatSync.mockReturnValue(fakeStats as unknown as Stats);
      });

      it('Then should throws InvalidDotNetSolutionFolderPathException', () => {
        // Arrange (GIVEN)
        mockConfigDotnetSolutionFolder.mockReturnValue(SOLUTION_FOLDER_DOES_NOT_EXIST);
        // Act (WHEN)
        const result = () => getDotNetSolutionFolderPath();
        // Assert (THEN)
        expect(result).toThrow(InvalidDotNetSolutionFolderPathException);
        expect(result).toThrowError(INVALID_DOTNET_SOLUTION_FOLDER_ERROR_MESSAGE);
      });
    });
  });
});

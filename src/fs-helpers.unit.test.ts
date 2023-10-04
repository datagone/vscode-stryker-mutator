import { Stats, existsSync, lstatSync } from 'fs';
import path from 'path';
import { Uri, workspace } from '../__mocks__/vscode';
import { getCurrentWorkspacePath, isDirectoryPath, isFileExists } from './fs-helpers';
import { InvalidWorkspaceException } from './fs-helpers-exception';

jest.mock('fs');

const mockExistsSync = existsSync as jest.MockedFn<typeof existsSync>;
const mockLStatSync = lstatSync as jest.MockedFn<typeof lstatSync>;
const fakeStats = new Stats();

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
    const INVALID_WORKSPACE_ERROR_MESSAGE: string = 'Workspace Folders can not be empty';

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
});

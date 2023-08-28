import { Stats, existsSync, lstatSync } from 'fs';
import path from 'path';
import { Uri } from '../__mocks__/vscode';
import { isDirectoryPath } from './fs-helpers';

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
});

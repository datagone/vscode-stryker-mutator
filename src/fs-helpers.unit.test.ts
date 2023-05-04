import { existsSync } from 'fs';
import path from 'path';
import { mockGetWorkspaceFolder, Uri } from '../__mocks__/vscode';
import { findFileInTree } from './fs-helpers';

jest.mock('fs');

const mockExistsSync = existsSync as jest.MockedFn<typeof existsSync>;

const mockReturnValueTimes = <T extends jest.Mock, Y>(times: number, method: T, value: Y) => {
  new Array(times).fill(1).forEach(() => method.mockReturnValueOnce(value));
};

describe('Filesytem helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // A minority of tests use a Windows back slash path separator, default to forward slash
    (path.sep as any) = '/';
  });
  describe('Find file in tree', () => {
    it('should check for file in every directory up to the root and return false if file is not found with a unix path', () => {
      mockReturnValueTimes(1, mockExistsSync, false);

      const res = findFileInTree(
        new Uri({ path: 'root/path' }),
        new Uri({ path: 'root/path/to/nested/dir' }),
        'some.txt'
      );

      expect(existsSync).toHaveBeenCalledTimes(4);
      expect(existsSync).toHaveBeenCalledWith('root/path/to/nested/dir/some.txt');
      expect(existsSync).toHaveBeenCalledWith('root/path/to/nested/some.txt');
      expect(existsSync).toHaveBeenCalledWith('root/path/to/some.txt');
      expect(existsSync).toHaveBeenCalledWith('root/path/some.txt');
      expect(res).toEqual(false);
    });
    it('should check for file in every directory up to the root and return true and stop if the files is found with a unix path', () => {
      mockReturnValueTimes(2, mockExistsSync, false);
      mockReturnValueTimes(1, mockExistsSync, true);

      const res = findFileInTree(
        new Uri({ path: 'root/path' }),
        new Uri({ path: 'root/path/to/nested/dir' }),
        'some.txt'
      );

      expect(existsSync).toHaveBeenCalledTimes(3);
      expect(existsSync).toHaveBeenCalledWith('root/path/to/nested/dir/some.txt');
      expect(existsSync).toHaveBeenCalledWith('root/path/to/nested/some.txt');
      expect(existsSync).toHaveBeenCalledWith('root/path/to/some.txt');
      expect(res).toEqual(true);
    });
    it('should check for file in every directory up to the root and return false if file is not found with a windows path', () => {
      (path.sep as string) = '\\';
      mockReturnValueTimes(1, mockExistsSync, false);

      const res = findFileInTree(
        new Uri({ path: 'root\\path' }),
        new Uri({ path: 'root\\path\\to\\nested\\dir' }),
        'some.txt'
      );

      expect(existsSync).toHaveBeenCalledTimes(4);
      expect(existsSync).toHaveBeenCalledWith('root\\path\\to\\nested\\dir\\some.txt');
      expect(existsSync).toHaveBeenCalledWith('root\\path\\to\\nested\\some.txt');
      expect(existsSync).toHaveBeenCalledWith('root\\path\\to\\some.txt');
      expect(existsSync).toHaveBeenCalledWith('root\\path\\some.txt');
      expect(res).toEqual(false);
    });
    it('should check for file in every directory up to the root and return true and stop if the files is found with a windows path', () => {
      (path.sep as string) = '\\';
      mockReturnValueTimes(2, mockExistsSync, false);
      mockReturnValueTimes(1, mockExistsSync, true);

      const res = findFileInTree(
        new Uri({ path: 'root\\path' }),
        new Uri({ path: 'root\\path\\to\\nested\\dir' }),
        'some.txt'
      );

      expect(existsSync).toHaveBeenCalledTimes(3);
      expect(existsSync).toHaveBeenCalledWith('root\\path\\to\\nested\\dir\\some.txt');
      expect(existsSync).toHaveBeenCalledWith('root\\path\\to\\nested\\some.txt');
      expect(existsSync).toHaveBeenCalledWith('root\\path\\to\\some.txt');
      expect(res).toEqual(true);
    });
  });
});

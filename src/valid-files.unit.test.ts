import { file } from '@babel/types';
import { window } from '../__mocks__/vscode';
import { fileCanBeMutated, isTestFile, showInvalidFileMessage } from './valid-files';

describe('WHEN Validate files', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('GIVEN a valid test file', () => {
    it.each([
      'src/mutant.unit.test.cs',
      'src/mutant.test1.cs',
      'src/mutant.unit.tests.cs',
      'src/mutant.test.cs',
      'src/mutantTest.cs',
      'src/mutant.unit.Tests.cs',
      'src/mutant.Tests1.cs',
      'src/mutant.unit.Tests.cs',
      'src/mutant.Tests.unit.cs',
      'src/mutant.Tests.cs',
      'src/mutantTests.cs',
      'src/ProjectTests/mutant.cs',
      'src/ProjectTest/mutant.cs',
      'xtest/mutant.unit.cs',
      'xyTest/mutant.unit.cs',
      'Xtest/mutant.unit.cs',
      'Xtest/mutant.test.cs',
      'test/mutant.cs',
    ])("THEN should validate the path '%s' as a test file", (path: string) => {
      expect(isTestFile(path)).toBeTruthy();
    });
  });
  describe('GIVEN an invalid test file', () => {
    it.each([
      'src/mutant.cs',
      'src/project/mutant.estimation.cs',
      'src/project/main.css',
      'src/mutant.test.vb', // Since we do not support VB file for now
      'src/projectTest/main.css', // Since stryker doesn't support this type of file
    ])("THEN should validate the path '%s' as not a test file", (path: string) => {
      expect(isTestFile(path)).toBeFalsy();
    });
  });
  describe('GIVEN Show invalid test file message', () => {
    it('THEN should show an error message to the user', async () => {
      await showInvalidFileMessage();

      expect(window.showErrorMessage).toHaveBeenCalledWith('Stryker.NET: Cannot run Stryker to mutate a test files');
    });
  });
  describe('GIVEN a file that can be mutated', () => {
    it.each(['src/mutant.cs', 'src/mutant.csproj', 'tests/mutantTests.csproj', 'src/mutant.sln'])(
      "THEN the path '%s' should be a file that can be mutated",
      (path: string) => {
        expect(fileCanBeMutated(path)).toBeTruthy();
      }
    );
  });
  describe('GIVEN a file that can not be mutated', () => {
    it.each([
      'src/mutant.test.cs',
      'src/mutantTests.cs',
      'src/mutantTest.cs',
      'test/mutant.cs',
      'src/mutant.json',
      'src/mutant.ts',
    ])("THEN the path '%s' should be a file that can be mutated", (path: string) => {
      expect(fileCanBeMutated(path)).toBeFalsy();
    });
  });
});

import { window } from '../__mocks__/vscode';
import { isTestFile, showInvalidFileMessage } from './valid-files';

describe('Valid files', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Is test file?', () => {
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
    ])("should validate the path '%s' as a test file", (path) => {
      expect(isTestFile(path)).toBeTruthy();
    });
    it.each([
      'src/mutant.cs',
      'src/project/mutant.estimation.cs',
      'src/project/main.css',
      'src/mutant.test.vb', // Since we do not support VB file for now
      'src/projectTest/main.css', // Since stryker doesn't support this type of file
    ])("should validate the path '%s' as not a test file", (path) => {
      expect(isTestFile(path)).toBeFalsy();
    });
  });
  describe('Show invalid file message', () => {
    it('should show an error message to the user', async () => {
      await showInvalidFileMessage();

      expect(window.showErrorMessage).toHaveBeenCalledWith('Cannot run Stryker to mutate a test files');
    });
  });
});

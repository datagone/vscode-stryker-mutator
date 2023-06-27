import { Uri, mockAsRelativePath, mockShowErrorMessage } from '../__mocks__/vscode';
import IPathToMutate from './pathToMutate.interface';
import PathToMutate from './pathToMutate';

describe('USING PathToMutate', () => {
  const aFilePathEndingWithSln = '/someWorkspace/someFolder/aFileEndingWith.sln';
  const aFilePathEndingWithCs = '/someWorkspace/someFolder/aFileEndingWith.cs';

  const EXPECTED_TO_BE_A_SOLUTION_FILE = true;
  const NOT_EXPECTED_TO_BE_A_SOLUTION_FILE = false;

  let fileToMutate: IPathToMutate;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WHEN adding a PathToMutate', () => {
    describe('GIVEN a valid file path', () => {
      it('THEN should be created', async () => {
        // Arrange (GIVEN)
        const aValidFilePath: Uri = Uri.file(aFilePathEndingWithCs);
        mockAsRelativePath.mockReturnValue(aValidFilePath.fsPath);
        fileToMutate = new PathToMutate(aValidFilePath);
        // Act (WHEN)
        const result = fileToMutate.addPathToMutate(aValidFilePath);
        // Assert (THEN)
        await expect(result).resolves.toBeUndefined(); // because of Promise<void>
      });
    });

    describe('GIVEN an invalid file path', () => {
      it('THEN should rejects with an error message', async () => {
        // Arrange (GIVEN)
        const errorMessageExpected = 'Invalid path to mutate';
        const anInvalidFilePath: Uri = Uri.file('');
        mockAsRelativePath.mockReturnValue(anInvalidFilePath.fsPath);
        fileToMutate = new PathToMutate(anInvalidFilePath);
        // Act (WHEN)
        const result = fileToMutate.addPathToMutate(anInvalidFilePath);
        // Assert (THEN)
        await expect(result).rejects.toBe(errorMessageExpected);
      });
    });
  });

  describe('WHEN evaluating for a solution file', () => {
    describe('GIVEN a file ending with .sln', () => {
      it('THEN should be identified as a solution file', () => {
        // Arrange (GIVEN)
        fileToMutate = new PathToMutate(Uri.file(aFilePathEndingWithSln));
        // Act (WHEN)
        const result: boolean = fileToMutate.isASolutionFile();
        // Assert (THEN)
        expect(result).toBe(EXPECTED_TO_BE_A_SOLUTION_FILE);
      });
    });

    describe('GIVEN a file ending with .cs', () => {
      it('THEN should not be identified as a solution file', () => {
        // Arrange (GIVEN)
        fileToMutate = new PathToMutate(Uri.file(aFilePathEndingWithCs));
        // Act (WHEN)
        const result: boolean = fileToMutate.isASolutionFile();
        // Assert (THEN)
        expect(result).toBe(NOT_EXPECTED_TO_BE_A_SOLUTION_FILE);
      });
    });
  });
});

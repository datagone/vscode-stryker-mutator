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

  describe('WHEN creating a new PathToMutate', () => {
    describe('GIVEN a Uri', () => {
      it('THEN should be created', () => {
        // Arrange (GIVEN)
        const aUri: Uri = Uri.file(aFilePathEndingWithCs);
        // Act (WHEN)
        fileToMutate = new PathToMutate(aUri);
        // Assert (THEN)
        expect(fileToMutate).toBeDefined();
        expect(fileToMutate.fsPath).toContain(aFilePathEndingWithCs);
      });
    });
  });

  describe('WHEN validating a PathToMutate', () => {
    describe('GIVEN a valid file path', () => {
      it('THEN should be valid and resolves without issue', async () => {
        // Arrange (GIVEN)
        const aValidFilePath: Uri = Uri.file(aFilePathEndingWithCs);
        mockAsRelativePath.mockReturnValue(aValidFilePath.fsPath);
        fileToMutate = new PathToMutate(aValidFilePath);
        // Act (WHEN)
        const result = fileToMutate.pathToMutateValidation();
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
        const result = fileToMutate.pathToMutateValidation();
        // Assert (THEN)
        await expect(result).rejects.toBe(errorMessageExpected);
      });
    });
  });
});

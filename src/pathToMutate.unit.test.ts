import { Uri, mockAsRelativePath } from '../__mocks__/vscode';
import IPathToMutate from './pathToMutate.interface';
import PathToMutate from './pathToMutate';
import { isDirectoryPath } from './fs-helpers';
import { fileCanBeMutated, showInvalidFileMessage } from './valid-files';

jest.mock('./fs-helpers');
jest.mock('./valid-files');

describe('USING PathToMutate', () => {
  const aFilePathEndingWithSln = '/someWorkspace/someFolder/aFileEndingWith.sln';
  const aFilePathEndingWithCs = '/someWorkspace/someFolder/aFileEndingWith.cs';
  const aFolderPath = '/someWorkspace/someFolder';

  const EXPECTED_TO_BE_A_FOLDER = true;
  const NOT_EXPECTED_TO_BE_A_FOLDER = false;
  const EXPECTED_TO_BE_MUTATED = true;
  const NOT_EXPECTED_TO_BE_MUTATED = false;

  let mockIsDirectoryPath: jest.MockedFn<typeof isDirectoryPath>;
  let mockFileCanBeMutated: jest.MockedFn<typeof fileCanBeMutated>;
  let mockShowInvalidFileMessage: jest.MockedFn<typeof showInvalidFileMessage>;

  let fileToMutate: IPathToMutate;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    mockIsDirectoryPath = isDirectoryPath as jest.MockedFn<typeof isDirectoryPath>;
    mockIsDirectoryPath.mockReturnValue(NOT_EXPECTED_TO_BE_A_FOLDER);

    mockFileCanBeMutated = fileCanBeMutated as jest.MockedFn<typeof fileCanBeMutated>;
    mockShowInvalidFileMessage = showInvalidFileMessage as jest.MockedFn<typeof showInvalidFileMessage>;
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
    describe('GIVEN a valid file path than can be mutated', () => {
      it('THEN should be valid and resolves without issue', async () => {
        // Arrange (GIVEN)
        const aValidFilePath: Uri = Uri.file(aFilePathEndingWithCs);
        mockAsRelativePath.mockReturnValue(aValidFilePath.fsPath);
        mockFileCanBeMutated.mockReturnValue(EXPECTED_TO_BE_MUTATED);
        fileToMutate = new PathToMutate(aValidFilePath);
        // Act (WHEN)
        const result = fileToMutate.pathToMutateValidation();
        // Assert (THEN)
        await expect(result).resolves.toBeUndefined(); // because of Promise<void>
        expect(mockShowInvalidFileMessage).not.toHaveBeenCalled();
      });
    });

    describe('GIVEN an invalid file path than cannot be mutated', () => {
      it('THEN should rejects with an error message', async () => {
        // Arrange (GIVEN)
        const errorMessageExpected = 'Invalid path to mutate';
        const anInvalidFilePath: Uri = Uri.file('');
        mockAsRelativePath.mockReturnValue(anInvalidFilePath.fsPath);
        mockFileCanBeMutated.mockReturnValue(NOT_EXPECTED_TO_BE_MUTATED);
        fileToMutate = new PathToMutate(anInvalidFilePath);
        // Act (WHEN)
        const result = fileToMutate.pathToMutateValidation();
        // Assert (THEN)
        await expect(result).rejects.toBe(errorMessageExpected);
        expect(mockShowInvalidFileMessage).toHaveBeenCalledTimes(1);
      });
    });

    describe('GIVEN a valid folder path', () => {
      it('THEN should be valid and resolves without using fileCanBeMutated', async () => {
        // Arrange (GIVEN)
        const aValidFolderPath: Uri = Uri.file(aFolderPath);
        mockAsRelativePath.mockReturnValue(aValidFolderPath.fsPath);
        mockIsDirectoryPath.mockReturnValue(EXPECTED_TO_BE_A_FOLDER);
        fileToMutate = new PathToMutate(aValidFolderPath);
        // Act (WHEN)
        const result = fileToMutate.pathToMutateValidation();
        // Assert (THEN)
        await expect(result).resolves.toBeUndefined(); // because of Promise<void>
        expect(mockFileCanBeMutated).not.toHaveBeenCalled();
        expect(mockShowInvalidFileMessage).not.toHaveBeenCalled();
      });
    });
  });
});

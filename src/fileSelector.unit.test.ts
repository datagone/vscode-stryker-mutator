import { selectAFileToMutateFrom } from './fileSelector';
import { Uri, window } from '../__mocks__/vscode';
import { fileCanBeMutated } from './valid-files';
import { chooseAFileToMutate } from './fileChooser';
import { when } from 'jest-when';

jest.mock('./valid-files');
jest.mock('./fileChooser');

describe('USING the File Selector', () => {
  describe('WHEN selecting a file to mutate from a parameter', () => {
    const aMutableFilePath: Uri = Uri.file('./x.cs');
    const notMutableFilePath: Uri = Uri.file('./x.tests.cs');

    const mockFileCanBeMutated = fileCanBeMutated as jest.MockedFn<typeof fileCanBeMutated>;
    const mockChooseAFileToMutate = chooseAFileToMutate as jest.MockedFn<typeof chooseAFileToMutate>;

    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    describe('GIVEN an undefined file path from the parameter', () => {
      // Arrange (GIVEN)
      beforeEach(() => {
        mockFileCanBeMutated.mockReturnValue(false);
      });

      describe('AND GIVEN no document is in the active editor', () => {
        it('THEN chooseAFileToMutate should have been called', async () => {
          // Act (WHEN)
          await selectAFileToMutateFrom(undefined);
          // Assert (THEN)
          expect(mockChooseAFileToMutate).toHaveBeenCalledTimes(1);
          expect(mockFileCanBeMutated).toHaveBeenCalledTimes(0);
        });
      });

      describe('AND GIVEN a non mutable document is in the active editor', () => {
        it('THEN chooseAFileToMutate should have been called', async () => {
          // Arrange (GIVEN)
          const uriPath: string = notMutableFilePath.path;
          const mockDocument = { fileName: uriPath, uri: new Uri({ path: uriPath }) };
          window.activeTextEditor = {
            document: mockDocument,
          };
          // Act (WHEN)
          await selectAFileToMutateFrom(undefined);
          // Assert (THEN)
          expect(mockChooseAFileToMutate).toHaveBeenCalledTimes(1);
          expect(mockFileCanBeMutated).toHaveBeenCalledTimes(1);
          expect(mockFileCanBeMutated).toHaveBeenCalledWith(notMutableFilePath.fsPath);
        });
      });

      describe('AND GIVEN a mutable document is in the active editor', () => {
        it('THEN should return the document Uri without calling chooseAFileToMutate should not have been called', async () => {
          // Arrange (GIVEN)
          const uriPath: string = 'x.cs';
          const mockDocument = { fileName: uriPath, uri: new Uri({ path: uriPath }) };
          window.activeTextEditor = {
            document: mockDocument,
          };
          when(mockFileCanBeMutated).calledWith(mockDocument.uri.fsPath).mockReturnValue(true);
          // Act (WHEN)
          const result: Uri = await selectAFileToMutateFrom(undefined);
          // Assert (THEN)
          expect(mockChooseAFileToMutate).not.toHaveBeenCalled();
          expect(mockFileCanBeMutated).toHaveBeenCalledTimes(1);
          expect(result).toBe(mockDocument.uri);
        });
      });
    });

    describe('GIVEN a not mutable file path from the parameter', () => {
      // Arrange (GIVEN)
      beforeEach(() => {
        mockFileCanBeMutated.mockReturnValue(true);
      });

      it('THEN should return the document Uri without calling chooseAFileToMutate should not have been called', async () => {
        // Arrange (GIVEN)
        // Act (WHEN)
        await selectAFileToMutateFrom(notMutableFilePath);
        // Assert (THEN)
        expect(mockChooseAFileToMutate).not.toHaveBeenCalled();
        expect(mockFileCanBeMutated).toHaveBeenCalledTimes(1);
      });
    });

    describe('GIVEN the file path from the parameter is mutable', () => {
      // Arrange (GIVEN)
      beforeEach(() => {
        mockFileCanBeMutated.mockReturnValue(true);
      });

      it('THEN should return the document Uri without calling chooseAFileToMutate should not have been called', async () => {
        // Arrange (GIVEN)
        // Act (WHEN)
        const result: Uri = await selectAFileToMutateFrom(aMutableFilePath);
        // Assert (THEN)
        expect(mockChooseAFileToMutate).not.toHaveBeenCalled();
        expect(mockFileCanBeMutated).toHaveBeenCalledTimes(1);
        expect(result).toBe(aMutableFilePath);
      });
    });
  });
});

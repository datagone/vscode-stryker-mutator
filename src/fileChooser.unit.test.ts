import { OpenDialogOptions } from 'vscode';
import { chooseAFileToMutate, chooseAFolderToMutate } from './fileChooser';
import { mockShowOpenDialog, Uri } from '../__mocks__/vscode';

describe('USING the File Chooser', () => {
  describe('WHEN choosing a file to mutate', () => {
    describe('GIVEN configured options for the dialogbox', () => {
      // Arrange (GIVEN)
      const expectedFilters: Record<string, string[]> = {
        '.Net Files': ['cs'],
        '.Net Solution Files': ['sln'],
        '.Net Project Files': ['csproj'],
      };
      const expectedOptions: OpenDialogOptions = {
        canSelectMany: false,
        filters: expectedFilters,
      };
      const selectedFilePath: Uri = Uri.file('./tempo/tryout/x.cs');
      const expectedMessageIfNoFileSelected: string = 'You must select a file or folder';

      beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();

        mockShowOpenDialog.mockReturnValue([selectedFilePath]);
      });

      it('THEN should show a dialogbox to select a file', async () => {
        // Act (WHEN)
        await chooseAFileToMutate();
        // Assert (THEN)
        expect(mockShowOpenDialog).toHaveBeenCalledTimes(1);
        expect(mockShowOpenDialog).toHaveBeenCalledWith(expectedOptions);
      });

      describe('AND GIVEN selecting a file', () => {
        it('THEN should return the selected file', async () => {
          // Act (WHEN)
          const result: Uri = await chooseAFileToMutate();
          // Assert (THEN)
          expect(result).toBeDefined();
          expect(result.fsPath).toBe(selectedFilePath.fsPath);
        });
      });

      describe('AND GIVEN selecting no file', () => {
        it('THEN should rejects with a message that a file must be selected', async () => {
          // Arrange (GIVEN)
          mockShowOpenDialog.mockReturnValue([]);
          // Act (WHEN)
          const result = () => chooseAFileToMutate();
          // Assert (THEN)
          await expect(result).rejects.toBe(expectedMessageIfNoFileSelected);
        });
      });

      describe('GIVEN the selection is cancelled', () => {
        it('THEN should rejects with a message that a file must be selected', async () => {
          // Arrange (GIVEN)
          mockShowOpenDialog.mockReturnValue(undefined); // here undefiend is interpreted as cancelled
          // Act (WHEN)
          const result = () => chooseAFileToMutate();
          // Assert (THEN)
          await expect(result).rejects.toBe(expectedMessageIfNoFileSelected);
        });
      });
    });
  });

  describe('WHEN choosing a folder to mutate', () => {
    describe('GIVEN configured options for the dialogbox', () => {
      // Arrange (GIVEN)
      const expectedOptions: OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: true,
        canSelectFiles: false,
      };
      const selectedFolderPath: Uri = Uri.file('./the/selected/folder/path/');
      const expectedMessageIfNoFolderSelected: string = 'You must select a folder';

      beforeEach(() => {
        jest.clearAllMocks();

        mockShowOpenDialog.mockReturnValue([selectedFolderPath]);
      });

      it('THEN should show a dialogbox to select a folder', async () => {
        // Act (WHEN)
        await chooseAFolderToMutate();

        // Assert (THEN)
        expect(mockShowOpenDialog).toHaveBeenCalledTimes(1);
        expect(mockShowOpenDialog).toHaveBeenCalledWith(expectedOptions);
      });

      describe('AND GIVEN selecting a folder', () => {
        it('THEN should return the selected folder', async () => {
          // Act (WHEN)
          const result: Uri = await chooseAFolderToMutate();

          // Assert (THEN)
          expect(result).toBeDefined();
          expect(result.fsPath).toBe(selectedFolderPath.fsPath);
        });
      });

      describe('AND GIVEN selecting no folder', () => {
        it('THEN should rejects with a message that a folder must be selected', async () => {
          // Arrange (GIVEN)
          mockShowOpenDialog.mockReturnValue([]);

          // Act (WHEN)
          const result = () => chooseAFolderToMutate();

          // Assert (THEN)
          await expect(result).rejects.toBe(expectedMessageIfNoFolderSelected);
        });
      });

      describe('GIVEN the selection is cancelled', () => {
        it('THEN should rejects with a message that a folder must be selected', async () => {
          // Arrange (GIVEN)
          mockShowOpenDialog.mockReturnValue(undefined); // here undefiend is interpreted as cancelled

          // Act (WHEN)
          const result = () => chooseAFolderToMutate();

          // Assert (THEN)
          await expect(result).rejects.toBe(expectedMessageIfNoFolderSelected);
        });
      });
    });
  });
});

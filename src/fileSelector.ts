import { Uri, window } from 'vscode';
import { fileCanBeMutated } from './valid-files';
import { chooseAFileToMutate, chooseAFolderToMutate } from './fileChooser';

export const selectAFileToMutateFrom = async (filePath: Uri | undefined): Promise<Uri> => {
  if (!filePath || !fileCanBeMutated(filePath.fsPath)) {
    const doc = window.activeTextEditor?.document;
    if (doc?.uri instanceof Uri && fileCanBeMutated(doc.uri.fsPath)) {
      filePath = doc.uri;
    } else {
      filePath = await chooseAFileToMutate();
    }
  }
  return filePath;
};

export const selectAFolderToMutateFrom = async (filePath: Uri | undefined): Promise<Uri> => {
  if (!filePath) {
    filePath = await chooseAFolderToMutate();
  }
  return filePath;
};

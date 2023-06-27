import { Uri, window } from 'vscode';
import { fileCanBeMutated } from './valid-files';
import { chooseAFileToMutate } from './fileChooser';

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

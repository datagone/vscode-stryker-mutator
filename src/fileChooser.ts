import { OpenDialogOptions, Uri, window } from 'vscode';

const ERROR_MESSAGE_MUST_SELECT_FILE_OR_FOLDER: string = 'You must select a file or folder';

export const chooseAFileToMutate = async (): Promise<Uri> => {
  let file: Uri;

  const filters: Record<string, string[]> = {
    '.Net Files': ['cs'],
    '.Net Solution Files': ['sln'],
    '.Net Project Files': ['csproj'],
  };
  const options: OpenDialogOptions = {
    canSelectMany: false,
    filters: filters,
  };

  const folderUri = await window.showOpenDialog(options);

  if (folderUri && folderUri.length === 1) {
    file = folderUri[0];
  } else {
    return Promise.reject(ERROR_MESSAGE_MUST_SELECT_FILE_OR_FOLDER);
  }
  return file;
};

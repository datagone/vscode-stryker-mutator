import * as vscode from 'vscode';

// const IS_TEST_FILE_REGEX = new RegExp(/(?<!\.?tests?[\w-\.\\\/]*)\.(cs|vb)$/, 'i');
const IS_TEST_FILE_REGEX = new RegExp(/tests?[\w-.\\/]*\.(cs)$/, 'i');

// export const isTestFile = (file: vscode.Uri) => !file.path.match(IS_TEST_FILE_REGEX);
export const isTestFile = (file: string) => IS_TEST_FILE_REGEX.test(file); /*file.path.match(IS_TEST_FILE_REGEX);*/

export const showInvalidFileMessage = async () =>
  await vscode.window.showErrorMessage('Cannot run Stryker to mutate a test files');

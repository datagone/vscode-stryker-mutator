import * as vscode from 'vscode';

const IS_TEST_FILE_REGEX = new RegExp(/tests?[\w-.\\/]*\.(cs)$/, 'i');

export const isTestFile = (file: string) => IS_TEST_FILE_REGEX.test(file);

export const showInvalidFileMessage = async () =>
  await vscode.window.showErrorMessage('Stryker.NET: Cannot run Stryker to mutate a test files');

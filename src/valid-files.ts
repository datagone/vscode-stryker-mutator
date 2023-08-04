import * as vscode from 'vscode';

const IS_TEST_FILE_REGEX = new RegExp(/tests?[\w\-\.\\\/\s\[\]\(\)]*\.(cs)$/, 'i');
const FILE_CAN_BE_MUTATED_REGEX = new RegExp(/[\w\s\-\[\]\(\)]\.(cs|sln|csproj)$/, 'i');

export const isTestFile = (file: string) => IS_TEST_FILE_REGEX.test(file);

export const showInvalidFileMessage = async () =>
  await vscode.window.showErrorMessage('Stryker.NET: Cannot run Stryker to mutate a test files');

export const fileCanBeMutated = (file: string) => !isTestFile(file) && FILE_CAN_BE_MUTATED_REGEX.test(file);

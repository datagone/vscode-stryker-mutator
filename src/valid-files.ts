import * as vscode from 'vscode';

const IS_TEST_FILE_REGEX = new RegExp(/tests?[\w\-\.\\\/\s\[\]\(\)]*\.(cs)$/, 'i');
const FILE_CAN_BE_MUTATED_REGEX = new RegExp(/[\w\s\-\[\]\(\)]\.(cs|sln|csproj)$/, 'i');

// const IS_A_SOLUTION_FILE_REGEX = new RegExp(/[\w-.\\/]*\.sln$/, 'i');
// const IS_A_PROJECT_FILE_REGEX = new RegExp(/([\w-.\\/]*\.csproj)$/, 'i');
// const IS_A_TEST_PROJECT_FILE_REGEX = new RegExp(/tests?[\w-.\\/]*\.csproj$/, 'i');

export const isTestFile = (file: string) => IS_TEST_FILE_REGEX.test(file);

export const showInvalidFileMessage = async () =>
  await vscode.window.showErrorMessage('Stryker.NET: Cannot run Stryker to mutate a test files');

export const fileCanBeMutated = (file: string) => !isTestFile(file) && FILE_CAN_BE_MUTATED_REGEX.test(file);

// export const isASolutionFile = (file: string) => IS_A_SOLUTION_FILE_REGEX.test(file);
// export const isAProjectFile = (file: string) => IS_A_PROJECT_FILE_REGEX.test(file);
// export const isNotATestProject = (file: string) => isAProjectFile(file) && !isATestProject(file);
// export const isATestProject = (file: string) => IS_A_TEST_PROJECT_FILE_REGEX.test(file);

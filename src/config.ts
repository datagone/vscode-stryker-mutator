import * as vscode from 'vscode';

export const dotnetCommand = (): string => {
  const userCommand = vscode.workspace.getConfiguration().get<string>('strykerDotNetRunner.dotnet.commandPath');
  if (userCommand) return userCommand;
  return `dotnet`;
};

export const strykerCommand = (/*file?: vscode.Uri*/): string => {
  return `${dotnetCommand()} stryker`;
};

export const strykerConfigFilePath = (): string | undefined =>
  vscode.workspace.getConfiguration().get('strykerDotNetRunner.stryker.configFile');

export const strykerOptionalParameters = (): string | undefined =>
  vscode.workspace.getConfiguration().get('strykerDotNetRunner.stryker.optionalParameters');

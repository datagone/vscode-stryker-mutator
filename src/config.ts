import * as vscode from 'vscode';

export const dotnetCommand = (): string => {
  const userCommand = vscode.workspace.getConfiguration().get<string>('strykerMutatorNet.dotnet.commandPath');
  if (userCommand) return userCommand;
  return `dotnet`;
};

export const strykerCommand = (): string => {
  return `${dotnetCommand()} stryker`;
};

export const strykerConfigFilePath = (): string | undefined =>
  vscode.workspace.getConfiguration().get('strykerMutatorNet.stryker.configFile');

export const strykerOptionalParameters = (): string | undefined =>
  vscode.workspace.getConfiguration().get('strykerMutatorNet.stryker.optionalParameters');

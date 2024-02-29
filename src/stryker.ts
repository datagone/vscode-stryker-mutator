import vscode from 'vscode';
import { strykerCommand, strykerConfigFilePath, strykerOptionalParameters } from './config';
import { makeReusableTerminal, runCommand } from './terminal';
import path from 'path';
import IPathToMutate from './pathToMutate.interface';

export type CommandRunner = (args: { file?: vscode.Uri | IPathToMutate; range?: string }) => void;

const makeCommand = (file?: vscode.Uri | IPathToMutate, range?: string) => {
  const strykerBin = strykerCommand();
  return `${strykerBin}${withMutateParam(file, range)}${withConfigFileParams()}${withOptionalParams()}`;
};

const withMutateParam = (file?: vscode.Uri | IPathToMutate, range?: string): string => {
  if (!file) {
    return '';
  }

  let mutantToTarget: string = path.basename(file.fsPath);

  // HACK: TOBE CHANGED
  if (mutantToTarget.toLowerCase().endsWith('.sln')) {
    return ` --solution "${mutantToTarget}"`;
  } else if (
    mutantToTarget.toLowerCase().endsWith('.tests.csproj') ||
    mutantToTarget.toLowerCase().endsWith('.test.csproj')
  ) {
    return ` --test-project "${mutantToTarget}"`;
  } else if (mutantToTarget.toLowerCase().endsWith('.csproj')) {
    return ` --project "${mutantToTarget}"`;
  } else if (path.extname(file.fsPath) === '.cs') {
    mutantToTarget = `**\\${mutantToTarget}`;
  } else {
    // It assume that it is a folder
    mutantToTarget = `**\\${mutantToTarget}\\*`;
  }

  const target = `${mutantToTarget}${range ? `{${range}}` : ''}`;
  return ` --mutate "${target}"`;
};

const withConfigFileParams = (): string => {
  const configFilePath = strykerConfigFilePath();
  return configFilePath ? ` --config-file ${configFilePath}` : '';
};

const withOptionalParams = (): string => {
  const optionalParams = strykerOptionalParameters();
  return optionalParams ? ` ${optionalParams}` : '';
};

export const commandRunner = () => {
  const terminal = makeReusableTerminal({ name: 'Stryker' });

  return ({ file, range }: { file?: vscode.Uri | IPathToMutate; range?: string }) => {
    const command = makeCommand(file, range);

    runCommand(terminal())(command);
  };
};

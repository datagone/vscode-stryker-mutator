import vscode from 'vscode';
import { strykerCommand, strykerConfigFilePath, strykerOptionalParameters } from './config';
import { makeReusableTerminal, runCommand } from './terminal';
import path from 'path';

export type CommandRunner = (args: { file?: vscode.Uri; range?: string }) => void;

const makeCommand = (file?: vscode.Uri, range?: string) => {
  const strykerBin = strykerCommand();
  return `${strykerBin}${withMutateParam(file, range)}${withConfigFileParams()}${withOptionalParams()}`;
};

const withMutateParam = (file?: vscode.Uri, range?: string): string => {
  if (!file) {
    return '';
  }

  let mutantToTarget: string = path.basename(file.fsPath);
  if (!mutantToTarget.endsWith('.cs')) {
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

  return ({ file, range }: { file?: vscode.Uri; range?: string }) => {
    const command = makeCommand(file, range);

    runCommand(terminal())(command);
  };
};

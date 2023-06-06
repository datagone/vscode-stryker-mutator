import vscode from 'vscode';
import { strykerCommand, strykerConfigFilePath, strykerOptionalParameters } from './config';
import { makeReusableTerminal, runCommand } from './terminal';
import path from 'path';

export type CommandRunner = (args: { file?: vscode.Uri; range?: string }) => void;

const makeCommand = (file?: vscode.Uri, range?: string) => {
  const strykerBin = strykerCommand();
  return `${strykerBin}${withSlnPrjFileOrFolder(file, range)}${withConfigFileParams()}${withOptionalParams()}`;
};

const withSlnPrjFileOrFolder = (file?: vscode.Uri, range?: string): string => {
  if (file) {
    let target: string = path.basename(file.fsPath);
    if (target.endsWith('.sln')) {
      return ` --solution "${target}"`;
    }
    // else if(target.endsWith('.csproj')) {
    //   return ` --project "${target}"`;
    // }
    // else if(target.endsWith('.Tests.csproj')) {
    //   return ` --test-project "${target}"`;
    // }
    else {
      return withMutateParam(file, range);
    }
  }
  return '';
};

const withMutateParam = (file?: vscode.Uri, range?: string): string => {
  // if(file) {
  let mutantToTarget: string = path.basename(file!.fsPath);
  if (!mutantToTarget.endsWith('.cs')) {
    mutantToTarget = `**\\${mutantToTarget}\\*`;
  }

  const target = `${mutantToTarget}${range ? `{${range}}` : ''}`;
  return ` --mutate "${target}"`;
  // }
  // return '';
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

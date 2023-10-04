import { existsSync, lstatSync } from 'fs';
import { workspace } from 'vscode';
import { InvalidWorkspaceException } from './fs-helpers-exception';

export const isDirectoryPath = (path: string): boolean => existsSync(path) && lstatSync(path).isDirectory();

export const isFileExists = (filePath: string): boolean => existsSync(filePath) && lstatSync(filePath).isFile();

export const getCurrentWorkspacePath = (): string => {
  let cwd: string;

  const workspaces = workspace.workspaceFolders ?? undefined;
  if (workspaces !== undefined && workspaces.length > 0) {
    cwd = workspaces[0].uri.fsPath;
  } else {
    throw new InvalidWorkspaceException('Workspace Folders can not be empty');
  }

  return cwd;
};

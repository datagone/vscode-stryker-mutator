import { existsSync, lstatSync } from 'fs';
import { workspace } from 'vscode';
import { InvalidDotNetSolutionFolderPathException, InvalidWorkspaceException } from './fs-helpers-exception';
import { dotnetSolutionFolder } from './config';
import path from 'path';

export const isDirectoryPath = (path: string): boolean => existsSync(path) && lstatSync(path).isDirectory();

export const isFileExists = (filePath: string): boolean => existsSync(filePath) && lstatSync(filePath).isFile();

export const getCurrentWorkspacePath = (): string => {
  let cwd: string;

  const workspaces = workspace.workspaceFolders ?? undefined;
  if (workspaces !== undefined && workspaces.length > 0) {
    cwd = workspaces[0].uri.fsPath;
  } else {
    throw new InvalidWorkspaceException('Workspace Folders cannot be empty');
  }

  return cwd;
};

export const getDotNetSolutionFolderPath = (): string => {
  let slnFolderPath = dotnetSolutionFolder();
  if (slnFolderPath === undefined) {
    return path.normalize(`${getCurrentWorkspacePath()}/`);
  }

  // Trim the start to remove any dot, slash and backslash
  slnFolderPath = slnFolderPath.replace(/^[.\/\\]+/, '');

  let solutionFolderPath = path.normalize(`${getCurrentWorkspacePath()}/${slnFolderPath}/`);
  if (isFileExists(solutionFolderPath)) {
    solutionFolderPath = path.normalize(`${path.dirname(solutionFolderPath)}/`);
  } else if (!isDirectoryPath(solutionFolderPath)) {
    throw new InvalidDotNetSolutionFolderPathException('The .NET Solution folder must exists. Check your settings.');
  }
  return solutionFolderPath;
};

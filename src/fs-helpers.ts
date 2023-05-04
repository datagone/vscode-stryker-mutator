import * as vscode from 'vscode';
import path from 'path';
import { existsSync } from 'fs';

export const findFileInTree = (root: vscode.Uri, start: vscode.Uri, file: string): boolean => {
  if (existsSync(`${start.path}${path.sep}${file}`)) return true;
  if (root.path === start.path) return false;
  return findFileInTree(root, vscode.Uri.file(start.path.substring(0, start.path.lastIndexOf(path.sep))), file);
};

// export const workspaceHasYarnLockFile = (file: vscode.Uri): boolean => {
//   const root = vscode.workspace.getWorkspaceFolder(file);
//   if (!root) return false;
//   if (!file.path.includes(root.uri.path)) return false;
//   return findFileInTree(root.uri, file, 'yarn.lock');
// };

// TODO : Uncomment this section when ready to work with a workspace approach (aka : not global tool installation - which is actually the default)
// export const workspaceHasDotNetToolManifestFile = (file: vscode.Uri): boolean => {
//   const root = vscode.workspace.getWorkspaceFolder(file);
//   if (!root) return false;
//   if (!file.path.includes(root.uri.path)) return false;
//   return findFileInTree(root.uri, file, '.config/dotnet-tools.json');
// };

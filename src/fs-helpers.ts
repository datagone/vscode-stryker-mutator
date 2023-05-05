import * as vscode from 'vscode';
import path from 'path';
import { existsSync } from 'fs';

export const findFileInTree = (root: vscode.Uri, start: vscode.Uri, file: string): boolean => {
  if (existsSync(`${start.path}${path.sep}${file}`)) return true;
  if (root.path === start.path) return false;
  return findFileInTree(root, vscode.Uri.file(start.path.substring(0, start.path.lastIndexOf(path.sep))), file);
};

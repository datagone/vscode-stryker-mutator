import { Uri } from 'vscode';

interface IPathToMutate {
  fsPath: string;
  // relativePath: string;

  isASolutionFile(): boolean;
  addPathToMutate(pathToMutate: Uri): Promise<void>;
}

export default IPathToMutate;

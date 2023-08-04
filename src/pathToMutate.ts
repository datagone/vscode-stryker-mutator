import IPathToMutate from './pathToMutate.interface';
import { fileCanBeMutated, showInvalidFileMessage } from './valid-files';
import { Uri, workspace } from 'vscode';

class PathToMutate implements IPathToMutate {
  private _filePath: Uri;

  constructor(filePath: Uri) {
    this._filePath = filePath;
  }

  public get fsPath(): string {
    return this._filePath.fsPath;
  }

  public async pathToMutateValidation(): Promise<void> {
    await this.validatePathToMutate(this._filePath);
  }

  private getRelativePath(path: Uri): string {
    return workspace.asRelativePath(path);
  }

  private async validatePathToMutate(path: Uri): Promise<void> {
    const relativePath: string = this.getRelativePath(path);
    if (!fileCanBeMutated(relativePath)) {
      await showInvalidFileMessage();
      return Promise.reject('Invalid path to mutate');
    }
  }
}

export default PathToMutate;

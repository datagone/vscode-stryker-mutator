import IPathToMutate from './pathToMutate.interface';
import { fileCanBeMutated, showInvalidFileMessage } from './valid-files';
import { Uri, workspace } from 'vscode';

class PathToMutate implements IPathToMutate {
  private _filePath: Uri;
  private _pathToMutate!: Uri;

  // constructor(filePath: string) {
  //   this._filePath = Urivscode.Uri.file(filePath);
  // }

  constructor(filePath: Uri) {
    // TODO : This is not the best way to do it.
    // this.validatePathToMutate(filePath);
    this._filePath = filePath;
  }

  public get fsPath(): string {
    return this._filePath.fsPath;
  }
  // public get relativePath(): string {
  //   return this.getRelativePath(this.fsPath);
  // }

  public async addPathToMutate(pathToMutate: Uri): Promise<void> {
    await this.validatePathToMutate(pathToMutate);
    this._pathToMutate = pathToMutate;
    //return Promise.resolve();
  }

  // public replaceFileToMutate(filePath: vscode.Uri): void {
  //   this._filePath = filePath;
  // }

  public isASolutionFile(): boolean {
    return this.getFilePath().endsWith('.sln');
  }

  private getFilePath(): string {
    return this.fsPath;
  }

  private getRelativePath(path: Uri | string): string {
    return workspace.asRelativePath(path);
  }

  private async validatePathToMutate(path: Uri): Promise<void> {
    const relativePath: string = this.getRelativePath(path);
    if (!fileCanBeMutated(relativePath)) {
      await showInvalidFileMessage();
      return Promise.reject('Invalid path to mutate');
    }
    //return Promise.resolve();
  }
}

export default PathToMutate;

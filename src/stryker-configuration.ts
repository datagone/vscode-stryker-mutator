import { ILogger } from './logger';
import * as fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

export type StrykerConfigurationType = {
  initializeBasicConfiguration(folderUri: vscode.Uri): Promise<string>;
  createStrykerConfigurationFile(folderUri: vscode.Uri): Promise<string>;
};

const solutionNameExtension: string = '.sln';
// const defaultJsonStrykerConfigFile = (): any => {
//   return {
//     'stryker-config': {
//       solution: `../SolutionFile${solutionNameExtension}`,
//       project: 'ExampleProject.csproj',
//     },
//     'mutation-level': 'Advanced',
//     reporters: ['html', 'json', 'progress'],
//     thresholds: { high: 100, low: 100, break: 100 },
//   };
// };

export class StrykerConfiguration implements StrykerConfigurationType {
  // readonly requiredFolderPathFormatMessage: string =
  //   'As per the dotnet default test project folder name, the folder path where the stryker configuration file will be saved must ends with either ".Tests" or ".Test"';
  readonly strykerConfigurationFileAlreadyExistsMessage: string =
    'The stryker configuration file already exists. It will not be overwritten.';
  readonly strykerConfigurationFileCreationSuccess: string = 'The stryker configuration file has been created:';

  readonly strykerConfigFilename: string = 'stryker-config.json';
  // readonly defaultJsonStrykerConfigFile: any = {
  //   'stryker-config': {
  //     solution: `../SolutionFile${solutionNameExtension}`,
  //     project: 'ExampleProject.csproj',
  //   },
  //   'mutation-level': 'Advanced',
  //   reporters: ['html', 'json', 'progress'],
  //   thresholds: { high: 100, low: 100, break: 100 },
  // };

  private _iLogger: ILogger;

  constructor(logger: ILogger) {
    this._iLogger = logger;
  }

  public async initializeBasicConfiguration(folderUri: vscode.Uri): Promise<string> {
    let strykerConfigPath: vscode.Uri | undefined = vscode.workspace.getWorkspaceFolder(folderUri)?.uri;
    if (!strykerConfigPath) {
      // strykerConfigPath = vscode.workspace.workspaceFolders![0].uri;
      const folderUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
      });
      if (folderUri && folderUri.length === 1) {
        strykerConfigPath = folderUri[0];
      } else {
        return Promise.reject('You must select one folder');
      }
    }

    // // TODO: to potentially remove since we may use the workspaceFolder instead
    //await this.isATestProject(strykerConfigPath!.uri);

    this._iLogger.info(`Creating the stryker configuration file into: ${path.join(strykerConfigPath!.fsPath)}`);

    return this.createStrykerConfigurationFile(strykerConfigPath!);
  }

  // // TODO: to potentially remove since we may use the workspaceFolder instead
  // private async isATestProject(folderUri: vscode.Uri): Promise<string> {
  //   if (folderUri.path.endsWith('.Tests') || folderUri.path.endsWith('.Test')) {
  //     return Promise.resolve('');
  //   } else {
  //     this._iLogger.warning(this.requiredFolderPathFormatMessage);
  //     return Promise.reject(this.requiredFolderPathFormatMessage);
  //   }
  // }

  private async isFileExists(filePath: string): Promise<string> {
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      this._iLogger.warning(this.strykerConfigurationFileAlreadyExistsMessage);
      return Promise.reject(this.strykerConfigurationFileAlreadyExistsMessage);
    }
    const fileExistMsg = `${filePath} does not exist, at the moment.`;
    this._iLogger.log(fileExistMsg);
    return Promise.resolve(fileExistMsg);
  }

  private defaultJsonStrykerConfigFile(solutionName: string): any {
    return {
      'stryker-config': {
        solution: `./${solutionName}`,
      },
      'mutation-level': 'Advanced',
      reporters: ['html', 'json', 'progress'],
      thresholds: { high: 100, low: 100, break: 100 },
    };
  }

  private async findDotnetSolutionFile(/*folderUri: vscode.Uri*/): Promise<string> {
    const files: vscode.Uri[] = await vscode.workspace.findFiles(`**/*${solutionNameExtension}`);
    const solutionFile: string = files[0].fsPath;
    const solutionName: string = path.basename(solutionFile);
    return Promise.resolve(solutionName);
  }
  private async buildStrykerConfigBaseFile(solutionName: string): Promise<string> {
    if (!solutionName.endsWith(solutionNameExtension)) {
      return Promise.reject(`Solution file must be a ${solutionNameExtension} file`);
    }
    const JsonStrykerConfigFile = this.defaultJsonStrykerConfigFile(solutionName);
    // JsonStrykerConfigFile['stryker-config'].solution = `./${solutionName}`;

    const jsonFile: string = JSON.stringify(JsonStrykerConfigFile, null, 2);
    return Promise.resolve(jsonFile);
  }

  public async createStrykerConfigurationFile(folderUri: vscode.Uri): Promise<string> {
    const filePath: string = path.join(folderUri.fsPath, this.strykerConfigFilename);
    const creationSuccessMessage: string = `${this.strykerConfigurationFileCreationSuccess} ${filePath}`;
    let error: Error | undefined;

    // // TODO: to potentially remove since we may use the workspaceFolder instead
    //await this.isATestProject(folderUri);

    await this.isFileExists(filePath);

    // const JsonStrykerConfigFile = this.defaultJsonStrykerConfigFile['stryker-config'].solution = '../NewSolutionFile.sln';
    // // Convert the object to a JSON string
    // const jsonString = JSON.stringify(JsonStrykerConfigFile, null, 2);
    const jsonString: string = await this.buildStrykerConfigBaseFile(await this.findDotnetSolutionFile(/*folderUri*/));

    // Write the JSON string to the file
    fs.writeFile(filePath, jsonString, (err) => {
      if (err) {
        this._iLogger.error(err.message);
        error = err;
      } else {
        this._iLogger.log(creationSuccessMessage);
      }
    });

    if (error) {
      return Promise.reject(error);
    }

    return Promise.resolve(creationSuccessMessage);
  }
}

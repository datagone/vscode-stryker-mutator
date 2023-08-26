import ILogger from './logger.interface';
import * as fs from 'fs';
import path from 'path';
import { Uri, window, workspace } from 'vscode';
import IStrykerConfiguration from './stryker-configuration.interface';

const solutionNameExtension: string = '.sln';

class StrykerConfiguration implements IStrykerConfiguration {
  private readonly strykerConfigurationFileAlreadyExistsMessage: string =
    'The stryker configuration file already exists. It will not be overwritten.';
  private readonly strykerConfigurationFileCreationSuccess: string = 'The stryker configuration file has been created:';

  private readonly strykerConfigFilename: string = 'stryker-config.json';

  private _logger: ILogger;

  constructor(logger: ILogger) {
    this._logger = logger;
  }

  public async initializeBasicConfiguration(folderUri: Uri): Promise<string> {
    let strykerConfigPath: Uri | undefined = workspace.getWorkspaceFolder(folderUri)?.uri;
    if (!strykerConfigPath) {
      const folderUri = await window.showOpenDialog({
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

    this._logger.info(`Creating the stryker configuration file into: ${path.join(strykerConfigPath!.fsPath)}`);

    return this.createStrykerConfigurationFile(strykerConfigPath!);
  }

  private async isFileExists(filePath: string): Promise<string> {
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      this._logger.warning(this.strykerConfigurationFileAlreadyExistsMessage);
      return Promise.reject(this.strykerConfigurationFileAlreadyExistsMessage);
    }
    const fileExistMsg = `${filePath} does not exist, at the moment.`;
    this._logger.log(fileExistMsg);
    return Promise.resolve(fileExistMsg);
  }

  private defaultJsonStrykerConfigFile(solutionName: string): any {
    return {
      'stryker-config': {
        solution: `./${solutionName}`,
        'mutation-level': 'Complete',
        reporters: ['html', 'json', 'progress'],
        'report-file-name': 'mutation-report',
        thresholds: { high: 100, low: 100, break: 100 },
      },
    };
  }

  private async findDotnetSolutionFile(): Promise<string> {
    const files: Uri[] = await workspace.findFiles(`**/*${solutionNameExtension}`);
    const solutionFile: string = files[0].fsPath;
    const solutionName: string = path.basename(solutionFile);
    return Promise.resolve(solutionName);
  }

  private async buildStrykerConfigBaseFile(solutionName: string): Promise<string> {
    if (!solutionName.endsWith(solutionNameExtension)) {
      return Promise.reject(`Solution file must be a ${solutionNameExtension} file`);
    }
    const JsonStrykerConfigFile = this.defaultJsonStrykerConfigFile(solutionName);

    const jsonFile: string = JSON.stringify(JsonStrykerConfigFile, null, 2);
    return Promise.resolve(jsonFile);
  }

  public async createStrykerConfigurationFile(folderUri: Uri): Promise<string> {
    const filePath: string = path.join(folderUri.fsPath, this.strykerConfigFilename);
    const creationSuccessMessage: string = `${this.strykerConfigurationFileCreationSuccess} ${filePath}`;
    let error: Error | undefined;

    await this.isFileExists(filePath);

    const jsonString: string = await this.buildStrykerConfigBaseFile(await this.findDotnetSolutionFile());

    // Write the JSON string to the file
    fs.writeFile(filePath, jsonString, (err) => {
      if (err) {
        this._logger.error(err.message);
        error = err;
      } else {
        this._logger.log(creationSuccessMessage);
      }
    });

    if (error) {
      return Promise.reject(error);
    }

    return Promise.resolve(creationSuccessMessage);
  }
}

export default StrykerConfiguration;

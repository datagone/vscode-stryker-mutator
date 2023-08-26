import { Uri } from 'vscode';
import { executeCommandWithArguments, isValidToRegex } from './cli-exec';
import IStrykerConfiguration from './stryker-configuration.interface';
import IDotnet from './dotnet.interface';
import ILogger from './logger.interface';

class Dotnet implements IDotnet {
  readonly strykerToolName: string = 'dotnet-stryker';

  private _strykerConfiguration: IStrykerConfiguration;
  private _logger: ILogger;

  constructor(strykerConfig: IStrykerConfiguration, logger: ILogger) {
    this._strykerConfiguration = strykerConfig;
    this._logger = logger;
  }

  public async isSdkInstalled(): Promise<boolean> {
    const sdkVersionArgs: string[] = ['--version'];
    const sdkVerificationOutputPattern: string = '^(\\d+\\.)*\\d+$';

    return this.executeCommandAndVerifyOutput(sdkVersionArgs, sdkVerificationOutputPattern);
  }

  public async isStrykerToolInstalled(): Promise<boolean> {
    let strykerToolIsInstalled: boolean;

    const toolListArgs: string[] = ['tool', 'list', '--global'];
    const toolVerificationOutputPattern: string = `${this.strykerToolName}(\\s*)((\\d+\\.)*\\d+)(\\s*)${this.strykerToolName}`;

    strykerToolIsInstalled = await this.executeCommandAndVerifyOutput(toolListArgs, toolVerificationOutputPattern);

    return Promise.resolve(strykerToolIsInstalled);
  }

  public async installStrykerTool(): Promise<boolean> {
    let strykerToolInstalled: boolean;

    const toolListArgs: string[] = ['tool', 'install', '--global', this.strykerToolName];
    const installVerificationOutputPattern: string = `${this.strykerToolName}.*((\\d+\\.)*\\d+).*successfully installed\\.`;

    this._logger.log('Task : Install the dotnet-stryker tool');

    await this.isSdkInstalled();

    strykerToolInstalled = await this.isStrykerToolInstalled();
    if (strykerToolInstalled === false) {
      this._logger.log('dotnet-stryker tool is not already installed');
      this._logger.log('Installing dotnet-stryker tool');
      strykerToolInstalled = await this.executeCommandAndVerifyOutput(toolListArgs, installVerificationOutputPattern);
    }

    return Promise.resolve(strykerToolInstalled);
  }

  public async uninstallStrykerTool(): Promise<boolean> {
    let strykerToolWasUninstall: boolean;

    const toolListArgs: string[] = ['tool', 'uninstall', '--global', this.strykerToolName];
    const installVerificationOutputPattern: string = `${this.strykerToolName}.*((\\d+\\.)*\\d+).*successfully uninstalled\\.`;

    this._logger.log('Task : Uninstall the stryker dotnet tool');

    await this.isSdkInstalled();

    const strykerToolToUninstall = await this.isStrykerToolInstalled();
    if (strykerToolToUninstall === true) {
      strykerToolWasUninstall = await this.executeCommandAndVerifyOutput(
        toolListArgs,
        installVerificationOutputPattern,
      );
    } else {
      strykerToolWasUninstall = true;
    }
    return Promise.resolve(strykerToolWasUninstall);
  }

  // TODO : It may not be in the right class... ?!?!?
  public async initializeStrykerConfiguration(folderpath: string): Promise<string> {
    return this._strykerConfiguration.initializeBasicConfiguration(Uri.parse(folderpath));
  }

  private async executeCommandAndVerifyOutput(args: string[], patternToVerifyOutput: string): Promise<boolean> {
    const stdout = await executeCommandWithArguments(args);
    return isValidToRegex(stdout, patternToVerifyOutput);
  }
}

export default Dotnet;

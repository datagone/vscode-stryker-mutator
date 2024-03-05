import { workspace } from 'vscode';

export type toolInstallationLocation = 'local' | 'global';

export const dotnetCommand = (): string =>
  workspace.getConfiguration().get('strykerMutatorNet.dotnet.commandPath') ?? 'dotnet';

export const strykerCommand = (): string => `${dotnetCommand()} stryker`;

export const strykerDotnetToolInstallationLocation = (): toolInstallationLocation =>
  workspace.getConfiguration().get('strykerMutatorNet.tool.installationLocation') ?? 'global';

export const dotnetSolutionFolder = (): string | undefined =>
  workspace.getConfiguration().get('strykerMutatorNet.dotnet.solutionFolder') ?? undefined;

export const strykerConfigFilePath = (): string | undefined =>
  workspace.getConfiguration().get('strykerMutatorNet.stryker.configFile');

export const strykerOptionalParameters = (): string | undefined =>
  workspace.getConfiguration().get('strykerMutatorNet.stryker.optionalParameters');

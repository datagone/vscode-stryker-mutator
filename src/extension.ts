import { ExtensionContext, commands } from 'vscode';
import {
  createBoilerplateStrykerConfigurationFileCommand,
  installStrykerDotnetToolCommand,
  uninstallStrykerDotnetToolCommand,
  mutateWorkspaceCommand,
  mutateFolderCommand,
  mutateSolutionCommand,
  mutateProjectCommand,
  mutateFileCommand,
  mutateSelectionCommand,
  updateStrykerDotnetToolCommand,
} from './commands';
import Dotnet from './dotnet';
import IDotnet from './dotnet.interface';
import Logger from './logger';
import { commandRunner } from './stryker';
import IStrykerConfiguration from './stryker-configuration.interface';
import StrykerConfiguration from './stryker-configuration';

export function activate(context: ExtensionContext) {
  const run = commandRunner();
  const logger = new Logger();
  const strykerConfiguration: IStrykerConfiguration = new StrykerConfiguration(logger);
  // TODO : strykerConfiguration may not be in the right class... ?!?!?
  const dotnetExec: IDotnet = new Dotnet(strykerConfiguration, logger);

  let createStrykerConfigurationFile = commands.registerCommand(
    'vscode-stryker-mutator.create-stryker-config-file',
    createBoilerplateStrykerConfigurationFileCommand(dotnetExec),
  );

  let installStrykerInDotnetTool = commands.registerCommand(
    'vscode-stryker-mutator.install-stryker-dotnet-tool',
    installStrykerDotnetToolCommand(dotnetExec),
  );

  let updateStrykerInDotnetTool = commands.registerCommand(
    'vscode-stryker-mutator.update-stryker-dotnet-tool',
    updateStrykerDotnetToolCommand(dotnetExec),
  );

  let uninstallStrykerInDotnetTool = commands.registerCommand(
    'vscode-stryker-mutator.uninstall-stryker-dotnet-tool',
    uninstallStrykerDotnetToolCommand(dotnetExec),
  );

  let mutateWorkspace = commands.registerCommand(
    'vscode-stryker-mutator.mutate-workspace',
    mutateWorkspaceCommand(run),
  );

  let mutateFolder = commands.registerCommand('vscode-stryker-mutator.mutate-folder', mutateFolderCommand(run));

  let mutateSolution = commands.registerCommand('vscode-stryker-mutator.mutate-solution', mutateSolutionCommand(run));

  let mutateProject = commands.registerCommand('vscode-stryker-mutator.mutate-project', mutateProjectCommand(run));

  let mutateFile = commands.registerCommand('vscode-stryker-mutator.mutate-file', mutateFileCommand(run));

  let mutateSelection = commands.registerCommand(
    'vscode-stryker-mutator.mutate-selection',
    mutateSelectionCommand(run),
  );

  context.subscriptions.push(createStrykerConfigurationFile);
  context.subscriptions.push(installStrykerInDotnetTool);
  context.subscriptions.push(updateStrykerInDotnetTool);
  context.subscriptions.push(uninstallStrykerInDotnetTool);
  context.subscriptions.push(mutateWorkspace);
  context.subscriptions.push(mutateSolution);
  context.subscriptions.push(mutateProject);
  context.subscriptions.push(mutateFile);
  context.subscriptions.push(mutateFolder);
  context.subscriptions.push(mutateSelection);
}

export function deactivate() {}

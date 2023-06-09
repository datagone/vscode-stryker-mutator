import * as vscode from 'vscode';
import {
  mutateFileCommand,
  mutateSelectionCommand,
  createBoilerplateStrykerConfigurationFileCommand,
  installStrykerDotnetToolCommand,
  uninstallStrykerDotnetToolCommand,
  mutateWorkspaceCommand,
} from './commands';
import { DotnetType, Dotnet } from './dotnet';
import { Logger } from './logger';
import { commandRunner } from './stryker';
import { StrykerConfiguration } from './stryker-configuration';

export function activate(context: vscode.ExtensionContext) {
  const run = commandRunner();
  const logger = new Logger();
  const strykerConfiguration = new StrykerConfiguration(logger);
  // TODO : strykerConfiguration may not be in the right class... ?!?!?
  const dotnetExec: DotnetType = new Dotnet(strykerConfiguration, logger);

  let createStrykerConfigurationFile = vscode.commands.registerCommand(
    'vscode-stryker-mutator.create-stryker-config-file',
    createBoilerplateStrykerConfigurationFileCommand(dotnetExec)
  );
  let installStrykerInDotnetTool = vscode.commands.registerCommand(
    'vscode-stryker-mutator.install-stryker-dotnet-tool',
    installStrykerDotnetToolCommand(dotnetExec)
  );

  let uninstallStrykerInDotnetTool = vscode.commands.registerCommand(
    'vscode-stryker-mutator.uninstall-stryker-dotnet-tool',
    uninstallStrykerDotnetToolCommand(dotnetExec)
  );

  let mutateWorkspace = vscode.commands.registerCommand(
    'vscode-stryker-mutator.mutate-workspace',
    mutateWorkspaceCommand(run)
  );

  let mutateFolder = vscode.commands.registerCommand('vscode-stryker-mutator.mutate-folder', mutateFileCommand(run));

  let mutateFile = vscode.commands.registerCommand('vscode-stryker-mutator.mutate-file', mutateFileCommand(run));

  let mutateSelection = vscode.commands.registerCommand(
    'vscode-stryker-mutator.mutate-selection',
    mutateSelectionCommand(run)
  );

  context.subscriptions.push(createStrykerConfigurationFile);
  context.subscriptions.push(installStrykerInDotnetTool);
  context.subscriptions.push(uninstallStrykerInDotnetTool);
  context.subscriptions.push(mutateWorkspace);
  context.subscriptions.push(mutateFolder);
  context.subscriptions.push(mutateFile);
  context.subscriptions.push(mutateSelection);
}

export function deactivate() {}

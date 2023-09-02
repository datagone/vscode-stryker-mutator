import { commands, mockRegisterCommand } from '../__mocks__/vscode';
import {
  createBoilerplateStrykerConfigurationFileCommand,
  installStrykerDotnetToolCommand,
  updateStrykerDotnetToolCommand,
  uninstallStrykerDotnetToolCommand,
  mutateWorkspaceCommand,
  mutateFolderCommand,
  mutateSolutionCommand,
  mutateProjectCommand,
  mutateFileCommand,
  mutateSelectionCommand,
} from './commands';
import { activate, deactivate } from './extension';
import { commandRunner } from './stryker';

jest.mock('./stryker');
jest.mock('./commands');

const mockCommandRunner = commandRunner as jest.MockedFn<typeof commandRunner>;

const mockCreateBoilerplateStrykerConfigurationFileCommand =
  createBoilerplateStrykerConfigurationFileCommand as jest.MockedFn<
    typeof createBoilerplateStrykerConfigurationFileCommand
  >;
const mockInstallStrykerDotnetToolCommand = installStrykerDotnetToolCommand as jest.MockedFn<
  typeof installStrykerDotnetToolCommand
>;
const mockUpdateStrykerDotnetToolCommand = updateStrykerDotnetToolCommand as jest.MockedFn<
  typeof updateStrykerDotnetToolCommand
>;
const mockUninstallStrykerDotnetToolCommand = uninstallStrykerDotnetToolCommand as jest.MockedFn<
  typeof uninstallStrykerDotnetToolCommand
>;
const mockMutateWorkspaceCommand = mutateWorkspaceCommand as jest.MockedFn<typeof mutateWorkspaceCommand>;
const mockMutateFolderCommand = mutateFolderCommand as jest.MockedFn<typeof mutateFolderCommand>;
const mockMutateSolutionCommand = mutateSolutionCommand as jest.MockedFn<typeof mutateSolutionCommand>;
const mockMutateProjectCommand = mutateProjectCommand as jest.MockedFn<typeof mutateProjectCommand>;
const mockMutateFileCommand = mutateFileCommand as jest.MockedFn<typeof mutateFileCommand>;
const mockMutateSelectionCommand = mutateSelectionCommand as jest.MockedFn<typeof mutateSelectionCommand>;

const EXPECTED_NBR_CALLS_FOR_REGISTERCOMMAND: number = 10;

describe('Extension', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe('Activate', () => {
    it('should register commands', () => {
      mockCommandRunner.mockReturnValue('command runner' as any);
      mockCreateBoilerplateStrykerConfigurationFileCommand.mockReturnValueOnce('stryker configuration file' as any);
      mockInstallStrykerDotnetToolCommand.mockReturnValueOnce('install stryker tool' as any);
      mockUpdateStrykerDotnetToolCommand.mockReturnValueOnce('update stryker tool' as any);
      mockUninstallStrykerDotnetToolCommand.mockReturnValueOnce('uninstall stryker tool' as any);

      mockMutateWorkspaceCommand.mockReturnValueOnce('mutate the workspace' as any);

      mockMutateFolderCommand.mockReturnValueOnce('mutate a folder' as any);
      mockMutateSolutionCommand.mockReturnValueOnce('mutate a solution' as any);
      mockMutateProjectCommand.mockReturnValueOnce('mutate a project' as any);
      mockMutateFileCommand.mockReturnValueOnce('mutate a file' as any);
      mockMutateSelectionCommand.mockReturnValueOnce('mutate a selection' as any);

      mockRegisterCommand.mockReturnValueOnce('on folder command registered' as any);
      mockRegisterCommand.mockReturnValueOnce('on solution command registered' as any);
      mockRegisterCommand.mockReturnValueOnce('on project command registered' as any);
      mockRegisterCommand.mockReturnValueOnce('on file command registered' as any);
      mockRegisterCommand.mockReturnValueOnce('on selection command registered' as any);

      const context = {
        subscriptions: {
          push: jest.fn(),
        },
      };

      activate(context as any);

      expect(commandRunner).toHaveBeenCalledTimes(1);

      expect(mockCreateBoilerplateStrykerConfigurationFileCommand).toHaveBeenCalledTimes(1);

      expect(mockInstallStrykerDotnetToolCommand).toHaveBeenCalledTimes(1);

      expect(mockUpdateStrykerDotnetToolCommand).toHaveBeenCalledTimes(1);

      expect(mockUninstallStrykerDotnetToolCommand).toHaveBeenCalledTimes(1);

      expect(mockMutateWorkspaceCommand).toHaveBeenCalledTimes(1);
      expect(mockMutateWorkspaceCommand).toHaveBeenCalledWith('command runner');

      expect(mockMutateFolderCommand).toHaveBeenCalledTimes(1);
      expect(mockMutateFolderCommand).toHaveBeenCalledWith('command runner');

      expect(mockMutateSolutionCommand).toHaveBeenCalledTimes(1);
      expect(mockMutateSolutionCommand).toHaveBeenCalledWith('command runner');

      expect(mockMutateProjectCommand).toHaveBeenCalledTimes(1);
      expect(mockMutateProjectCommand).toHaveBeenCalledWith('command runner');

      expect(mockMutateFileCommand).toHaveBeenCalledTimes(1);
      expect(mockMutateFileCommand).toHaveBeenCalledWith('command runner');

      expect(mockMutateSelectionCommand).toHaveBeenCalledTimes(1);
      expect(mockMutateSelectionCommand).toHaveBeenCalledWith('command runner');

      expect(commands.registerCommand).toHaveBeenCalledTimes(EXPECTED_NBR_CALLS_FOR_REGISTERCOMMAND);

      expect(commands.registerCommand).toHaveBeenCalledWith(
        'vscode-stryker-mutator.create-stryker-config-file',
        'stryker configuration file',
      );

      expect(commands.registerCommand).toHaveBeenCalledWith(
        'vscode-stryker-mutator.install-stryker-dotnet-tool',
        'install stryker tool',
      );

      expect(commands.registerCommand).toHaveBeenCalledWith(
        'vscode-stryker-mutator.update-stryker-dotnet-tool',
        'update stryker tool',
      );

      expect(commands.registerCommand).toHaveBeenCalledWith(
        'vscode-stryker-mutator.uninstall-stryker-dotnet-tool',
        'uninstall stryker tool',
      );

      expect(commands.registerCommand).toHaveBeenCalledWith(
        'vscode-stryker-mutator.mutate-workspace',
        'mutate the workspace',
      );

      expect(commands.registerCommand).toHaveBeenCalledWith('vscode-stryker-mutator.mutate-folder', 'mutate a folder');

      expect(commands.registerCommand).toHaveBeenCalledWith(
        'vscode-stryker-mutator.mutate-solution',
        'mutate a solution',
      );

      expect(commands.registerCommand).toHaveBeenCalledWith(
        'vscode-stryker-mutator.mutate-project',
        'mutate a project',
      );

      expect(commands.registerCommand).toHaveBeenCalledWith('vscode-stryker-mutator.mutate-file', 'mutate a file');

      expect(commands.registerCommand).toHaveBeenCalledWith(
        'vscode-stryker-mutator.mutate-selection',
        'mutate a selection',
      );

      expect(context.subscriptions.push).toHaveBeenCalledTimes(EXPECTED_NBR_CALLS_FOR_REGISTERCOMMAND);
      expect(context.subscriptions.push).toHaveBeenCalledWith('on folder command registered');
      expect(context.subscriptions.push).toHaveBeenCalledWith('on solution command registered');
      expect(context.subscriptions.push).toHaveBeenCalledWith('on project command registered');
      expect(context.subscriptions.push).toHaveBeenCalledWith('on file command registered');
      expect(context.subscriptions.push).toHaveBeenCalledWith('on selection command registered');
    });
  });

  describe('Deactivate', () => {
    it('should do nothing', () => {
      deactivate();
    });
  });
});

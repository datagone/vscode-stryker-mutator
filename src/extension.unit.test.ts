import { commands, mockRegisterCommand } from '../__mocks__/vscode';
import {
  mutateFileCommand,
  mutateSelectionCommand,
  createBoilerplateStrykerConfigurationFileCommand,
  installStrykerDotnetToolCommand,
  uninstallStrykerDotnetToolCommand,
  mutateWorkspaceCommand,
} from './commands';
import { activate, deactivate } from './extension';
import { commandRunner } from './stryker';

jest.mock('./dotnet');
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
const mockUninstallStrykerDotnetToolCommand = uninstallStrykerDotnetToolCommand as jest.MockedFn<
  typeof uninstallStrykerDotnetToolCommand
>;
const mockMutateWorkspaceCommand = mutateWorkspaceCommand as jest.MockedFn<typeof mutateWorkspaceCommand>;
const mockmutateFolderCommand = mutateFileCommand as jest.MockedFn<typeof mutateFileCommand>;
const mockmutateFileCommand = mutateFileCommand as jest.MockedFn<typeof mutateFileCommand>;
const mockmutateSelectionCommand = mutateSelectionCommand as jest.MockedFn<typeof mutateSelectionCommand>;

describe('Extension', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe('Activate', () => {
    it('should register commands', () => {
      mockCommandRunner.mockReturnValue('command runner' as any);
      mockCreateBoilerplateStrykerConfigurationFileCommand.mockReturnValueOnce('stryker configuration file' as any);
      mockInstallStrykerDotnetToolCommand.mockReturnValueOnce('install stryker tool' as any);
      mockUninstallStrykerDotnetToolCommand.mockReturnValueOnce('uninstall stryker tool' as any);
      mockMutateWorkspaceCommand.mockReturnValueOnce('mutate the workspace' as any);
      mockmutateFolderCommand.mockReturnValueOnce('mutate a folder' as any);
      mockmutateFileCommand.mockReturnValueOnce('mutate a file' as any);
      mockmutateSelectionCommand.mockReturnValueOnce('mutate a selection' as any);
      mockRegisterCommand.mockReturnValueOnce('on folder command registered' as any);
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

      expect(installStrykerDotnetToolCommand).toHaveBeenCalledTimes(1);

      expect(uninstallStrykerDotnetToolCommand).toHaveBeenCalledTimes(1);

      expect(mutateWorkspaceCommand).toHaveBeenCalledTimes(1);
      expect(mutateWorkspaceCommand).toHaveBeenCalledWith('command runner');

      expect(mutateFileCommand).toHaveBeenCalledTimes(2);
      expect(mutateFileCommand).toHaveBeenCalledWith('command runner');

      expect(mutateSelectionCommand).toHaveBeenCalledTimes(1);
      expect(mutateSelectionCommand).toHaveBeenCalledWith('command runner');
      expect(commands.registerCommand).toHaveBeenCalledTimes(7);

      expect(commands.registerCommand).toHaveBeenCalledWith(
        'vscode-stryker-mutator.create-stryker-config-file',
        'stryker configuration file'
      );

      expect(commands.registerCommand).toHaveBeenCalledWith(
        'vscode-stryker-mutator.install-stryker-dotnet-tool',
        'install stryker tool'
      );

      expect(commands.registerCommand).toHaveBeenCalledWith(
        'vscode-stryker-mutator.uninstall-stryker-dotnet-tool',
        'uninstall stryker tool'
      );

      expect(commands.registerCommand).toHaveBeenCalledWith(
        'vscode-stryker-mutator.mutate-workspace',
        'mutate the workspace'
      );

      expect(commands.registerCommand).toHaveBeenCalledWith('vscode-stryker-mutator.mutate-folder', 'mutate a folder');

      expect(commands.registerCommand).toHaveBeenCalledWith('vscode-stryker-mutator.mutate-file', 'mutate a file');

      expect(commands.registerCommand).toHaveBeenCalledWith(
        'vscode-stryker-mutator.mutate-selection',
        'mutate a selection'
      );

      expect(context.subscriptions.push).toHaveBeenCalledTimes(7);
      expect(context.subscriptions.push).toHaveBeenCalledWith('on folder command registered');
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

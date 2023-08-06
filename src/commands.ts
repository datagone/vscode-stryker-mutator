import * as vscode from 'vscode';
import { DotnetType } from './dotnet';
import { CommandRunner } from './stryker';
import { isTestFile, showInvalidFileMessage } from './valid-files';
import IPathToMutate from './pathToMutate.interface';
import PathToMutate from './pathToMutate';
import { selectAFileToMutateFrom, selectAFolderToMutateFrom } from './fileSelector';

const tool = 'dotnet-stryker';

export const installStrykerDotnetToolCommand = (dotnet: DotnetType) => async () => {
  await dotnet.installStrykerTool().then((toolInstalled: boolean) => {
    if (toolInstalled === true) {
      vscode.window.showInformationMessage(`Stryker.NET: ${tool} tool has been installed`);
    } else {
      vscode.window.showWarningMessage(`Stryker.NET: ${tool} tool is not installed`);
    }
  });
};

export const uninstallStrykerDotnetToolCommand = (dotnet: DotnetType) => async () => {
  dotnet.uninstallStrykerTool().then((toolIsUninstalled: boolean) => {
    if (toolIsUninstalled === true) {
      vscode.window.showInformationMessage(`Stryker.NET: ${tool} tool has been uninstalled`);
    } else {
      vscode.window.showWarningMessage(`Stryker.NET: ${tool} tool uninstallation failed`);
    }
  });
};

export const createBoilerplateStrykerConfigurationFileCommand = (dotnet: DotnetType) => async (arg: string) => {
  await dotnet
    .initializeStrykerConfiguration(arg)
    .then((configFileCreationResult: string) => {
      vscode.window.showInformationMessage(configFileCreationResult);
    })
    .catch((errorMessage) => {
      vscode.window.showErrorMessage(errorMessage);
    });
};

export const mutateWorkspaceCommand = (run: CommandRunner) => async () => {
  const selection = await vscode.window.showWarningMessage(
    '🧟‍♀️🧟‍♂️ Unleashing 🧟‍♂️🧟‍♀️ too much 🧟‍♀️🧟‍♂️ mutants 🧟‍♂️🧟‍♀️ into the wild (aka running stryker on a project or a solution) can be time and resources consuming. Are you sure you want to do this?',
    'Yes',
    'No',
  );
  if (selection === 'Yes') {
    run({});
  } else {
    vscode.window.showInformationMessage(`Stryker.NET: Your computer thanks you! 😇`);
  }
};

export const mutateFolderCommand =
  (run: CommandRunner) =>
  async (...args: unknown[]) => {
    let filePath: vscode.Uri | undefined;
    try {
      filePath = await selectAFolderToMutateFrom(args[0] as vscode.Uri);
    } catch (error) {
      const errMessage: string = `Stryker.NET: ${error}`;
      vscode.window.showErrorMessage(errMessage);
    }

    await launchCommandWithFile(run, filePath);
  };

export const mutateSolutionCommand =
  (run: CommandRunner) =>
  async (...args: unknown[]) => {
    let filePath: vscode.Uri | undefined;
    try {
      filePath = await selectAFileToMutateFrom(args[0] as vscode.Uri);
    } catch (error) {
      const errMessage: string = `Stryker.NET: ${error}`;
      vscode.window.showErrorMessage(errMessage);
    }

    await launchCommandWithFile(run, filePath);
  };

export const mutateProjectCommand =
  (run: CommandRunner) =>
  async (...args: unknown[]) => {
    let filePath: vscode.Uri | undefined;
    try {
      filePath = await selectAFileToMutateFrom(args[0] as vscode.Uri);
    } catch (error) {
      const errMessage: string = `Stryker.NET: ${error}`;
      vscode.window.showErrorMessage(errMessage);
    }

    await launchCommandWithFile(run, filePath);
  };

export const mutateFileCommand =
  (run: CommandRunner) =>
  async (...args: unknown[]) => {
    let filePath: vscode.Uri | undefined;
    try {
      filePath = await selectAFileToMutateFrom(args[0] as vscode.Uri);
    } catch (error) {
      const errMessage: string = `Stryker.NET: ${error}`;
      vscode.window.showErrorMessage(errMessage);
    }

    await launchCommandWithFile(run, filePath);
  };

const launchCommandWithFile = async (run: CommandRunner, filePath: vscode.Uri | undefined) => {
  if (filePath !== undefined) {
    const fileToMutate: IPathToMutate = new PathToMutate(filePath);
    await fileToMutate.pathToMutateValidation();

    run({ file: fileToMutate });
  }
};

export const mutateSelectionCommand =
  (run: CommandRunner) =>
  async (...args: unknown[]) => {
    if (!(args[0] instanceof vscode.Uri)) return;
    const file = args[0];
    const relativePath: string = vscode.workspace.asRelativePath(file.fsPath);

    if (isTestFile(relativePath)) {
      await showInvalidFileMessage();
      return;
    }

    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      console.log('Stryker.NET: No action, no active editor');
      return;
    }
    if (editor.selection.isEmpty) {
      console.log('Stryker.NET: No action, selection is single character');
      return;
    }

    const document = editor.document;
    const startOffset = document.offsetAt(editor.selection.start);
    const endOffset = document.offsetAt(editor.selection.end);
    const characterRange = `${startOffset}..${endOffset}`;

    run({ file: file, range: characterRange });
  };

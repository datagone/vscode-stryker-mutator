import * as vscode from 'vscode';
import IDotnet from './dotnet.interface';
import { CommandRunner } from './stryker';
import { isTestFile, showInvalidFileMessage } from './valid-files';
import IPathToMutate from './pathToMutate.interface';
import PathToMutate from './pathToMutate';
import { selectAFileToMutateFrom, selectAFolderToMutateFrom } from './fileSelector';
import { chooseToRunFullMutationTest } from './warningMessenger';
import Constants from './constants';

export const installStrykerDotnetToolCommand = (dotnet: IDotnet) => async () => {
  await dotnet.installStrykerTool().then((toolInstalled: boolean) => {
    if (toolInstalled === true) {
      vscode.window.showInformationMessage(messageFormaterDotnetTool('tool has been installed'));
    } else {
      vscode.window.showWarningMessage(messageFormaterDotnetTool('tool is not installed'));
    }
  });
};

export const uninstallStrykerDotnetToolCommand = (dotnet: IDotnet) => async () => {
  dotnet.uninstallStrykerTool().then((toolIsUninstalled: boolean) => {
    if (toolIsUninstalled === true) {
      vscode.window.showInformationMessage(messageFormaterDotnetTool('tool has been uninstalled'));
    } else {
      vscode.window.showWarningMessage(messageFormaterDotnetTool('tool uninstallation failed'));
    }
  });
};

export const createBoilerplateStrykerConfigurationFileCommand = (dotnet: IDotnet) => async (arg: string) => {
  await dotnet
    .initializeStrykerConfiguration(arg)
    .then((configFileCreationResult: string) => {
      vscode.window.showInformationMessage(configFileCreationResult);
    })
    .catch((error) => {
      vscode.window.showErrorMessage(messageFormaterError(`${error}`));
    });
};

export const mutateWorkspaceCommand = (run: CommandRunner) => async () => {
  if (await chooseToRunFullMutationTest()) {
    run({});
  }
};

export const mutateFolderCommand =
  (run: CommandRunner) =>
  async (...args: unknown[]) => {
    if (await chooseToRunFullMutationTest()) {
      let filePath: vscode.Uri | undefined;
      try {
        filePath = await selectAFolderToMutateFrom(args[0] as vscode.Uri);
      } catch (error) {
        vscode.window.showErrorMessage(messageFormaterError(`${error}`));
      }

      await launchCommandWithFile(run, filePath);
    }
  };

export const mutateSolutionCommand =
  (run: CommandRunner) =>
  async (...args: unknown[]) => {
    if (await chooseToRunFullMutationTest()) {
      let filePath: vscode.Uri | undefined;
      try {
        filePath = await selectAFileToMutateFrom(args[0] as vscode.Uri);
      } catch (error) {
        vscode.window.showErrorMessage(messageFormaterError(`${error}`));
      }

      await launchCommandWithFile(run, filePath);
    }
  };

export const mutateProjectCommand =
  (run: CommandRunner) =>
  async (...args: unknown[]) => {
    if (await chooseToRunFullMutationTest()) {
      let filePath: vscode.Uri | undefined;
      try {
        filePath = await selectAFileToMutateFrom(args[0] as vscode.Uri);
      } catch (error) {
        vscode.window.showErrorMessage(messageFormaterError(`${error}`));
      }

      await launchCommandWithFile(run, filePath);
    }
  };

export const mutateFileCommand =
  (run: CommandRunner) =>
  async (...args: unknown[]) => {
    let filePath: vscode.Uri | undefined;
    try {
      filePath = await selectAFileToMutateFrom(args[0] as vscode.Uri);
    } catch (error) {
      vscode.window.showErrorMessage(messageFormaterError(`${error}`));
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
      console.log(messageFormater('No action, no active editor'));
      return;
    }
    if (editor.selection.isEmpty) {
      console.log(messageFormater('No action, selection is single character'));
      return;
    }

    const document = editor.document;
    const startOffset = document.offsetAt(editor.selection.start);
    const endOffset = document.offsetAt(editor.selection.end);
    const characterRange = `${startOffset}..${endOffset}`;

    run({ file: file, range: characterRange });
  };

const messageFormaterDotnetTool = (message: string) => {
  return `${Constants.strykerDotnetTitle}: ${Constants.strykerDotnetToolName} ${message}`;
};
const messageFormater = (message: string) => {
  return `${Constants.strykerDotnetTitle}: ${message}`;
};
const messageFormaterError = (errorMessage: any) => {
  return `${Constants.strykerDotnetTitle}: ${errorMessage}`;
};

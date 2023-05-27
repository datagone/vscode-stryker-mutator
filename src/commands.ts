import * as vscode from 'vscode';
import { DotnetType } from './dotnet';
import { CommandRunner } from './stryker';
import { isTestFile, showInvalidFileMessage } from './valid-files';

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
    'No'
  );
  if (selection === 'Yes') {
    run({});
  } else {
    vscode.window.showInformationMessage(`Stryker.NET: Your computer thanks you! 😇`);
  }
};

export const mutateFileCommand =
  (run: CommandRunner) =>
  async (...args: unknown[]) => {
    let file: vscode.Uri;

    if (!(args[0] && args[0] instanceof vscode.Uri)) {
      const doc = vscode.window.activeTextEditor?.document;
      if (doc?.fileName.endsWith('.cs')) {
        file = doc.uri;
      } else {
        const filters: Record<string, string[]> = {
          'C# Files': ['cs'],
          'All Files': ['*'],
        };
        const options: vscode.OpenDialogOptions = {
          canSelectMany: false,
          filters: filters,
        };

        const folderUri = await vscode.window.showOpenDialog(options);
        if (folderUri && folderUri.length === 1) {
          file = folderUri[0];
        } else {
          vscode.window.showErrorMessage('Stryker.NET: You must select a file or folder');
          return;
        }
      }
    } else {
      file = args[0] as vscode.Uri;
    }
    const relativePath: string = vscode.workspace.asRelativePath(file.fsPath);

    if (isTestFile(relativePath)) {
      await showInvalidFileMessage();
      return;
    }

    run({ file });
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

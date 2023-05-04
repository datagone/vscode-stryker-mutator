// import { is } from '@babel/types';
// import { verify } from 'crypto';
import * as vscode from 'vscode';
import { /*DotnetCommandRunner,*/ /*DotnetExecuteCommand,*/ DotnetType /*,Dotnet*/ } from './dotnet';
import { CommandRunner } from './stryker';
import { isTestFile, showInvalidFileMessage } from './valid-files';
import { StrykerConfigurationType } from './stryker-configuration';

const tool = 'dotnet-stryker';

export const installStrykerDotnetToolCommand = (dotnet: DotnetType) => async () => {
  // console.log("Task : Install the stryker dotnet tool");

  // isDotnetExists(exec)
  // .then(dotnetExists => {
  //   if(dotnetExists) {
  //     isDotnetToolInstalled(exec).then(toolInstalled => {
  //       if(!toolInstalled) {
  //         installDotnetTool(exec, `${tool}.*((\\d+\\.)*\\d+).*successfully installed\\.`);
  //       }
  //       else {
  //         vscode.window.showWarningMessage(`${tool} tool is already installed`);
  //       }
  //     }).catch(error => {
  //       console.log(error);
  //       vscode.window.showErrorMessage(error);
  //     });
  //   }
  // })
  // .catch(error => {
  //   console.log(error);
  //   vscode.window.showErrorMessage(error);
  // });

  // // TODO : Uncomment for progressBar
  // vscode.window.withProgress({
  //   location: vscode.ProgressLocation.Notification,
  //   title: "Stryker.NET: Install dotnet-stryker tool",
  //   cancellable: false
  // }, async (progress) => {

  //   progress.report({ increment: 0, message: "Starting installation..." });

  //   // Call the tool installation function here
  //   await dotnet.installStrykerTool()
  //   .then((toolInstalled: boolean) => {
  //     if (toolInstalled === true) {
  //       const msg = `Stryker.NET: ${tool} tool has been installed`;
  //       progress.report({ increment: 100, message: "Installation complete." });
  //       vscode.window.showInformationMessage(msg);
  //     } else {
  //       const installationFailedMessage = `Installation failed: ${tool} tool is not installed`;
  //       progress.report({ increment: 0, message: installationFailedMessage });
  //       vscode.window.showWarningMessage(installationFailedMessage);
  //     }
  //   });
  // });
  // // TODO - END : Uncomment for progressBar

  await dotnet.installStrykerTool().then((toolInstalled: boolean) => {
    if (toolInstalled === true) {
      const msg = `Stryker.NET: ${tool} tool has been installed`;
      vscode.window.showInformationMessage(msg);
    } else {
      vscode.window.showWarningMessage(`Stryker.NET: ${tool} tool is not installed`);
    }
  });
};
// export const installStrykerDotnetToolCommand = (exec: DotnetExecuteCommand) => async () => {

//   console.log("Task : Install the stryker dotnet tool");

//   isDotnetExists(exec)
//   .then(dotnetExists => {
//     if(dotnetExists) {
//       isDotnetToolInstalled(exec).then(toolInstalled => {
//         if(!toolInstalled) {
//           installDotnetTool(exec, `${tool}.*((\\d+\\.)*\\d+).*successfully installed\\.`);
//         }
//         else {
//           vscode.window.showWarningMessage(`${tool} tool is already installed`);
//         }
//       }).catch(error => {
//         console.log(error);
//         vscode.window.showErrorMessage(error);
//       });
//     }
//   })
//   .catch(error => {
//     console.log(error);
//     vscode.window.showErrorMessage(error);
//   });
// };

// const installDotnetTool = (exec: DotnetExecuteCommand, patternToVerify: string) => {
//   let msg = "";
//   console.log(`Installing the ${tool} tool`);

//   exec(["tool","install","--global",`${tool}`], patternToVerify)
//   .then(toolInstalled => {
//     if (toolInstalled) {
//       msg = `${tool} tool has been installed`;
//       console.log(msg);
//       vscode.window.showInformationMessage(msg);
//     }
//     else {
//       msg = `${tool} tool is NOT installed.\r\nYou can install it manually with "dotnet tool install --global ${tool}"`;
//       console.log(msg);
//       vscode.window.showErrorMessage(msg);
//     }
//   })
//   .catch(error => {
//     msg = `An issue occured while installing the ${tool} tool : \r\n ${error}`;
//     console.log(msg);
//     vscode.window.showErrorMessage(msg);
//   });
// };

export const uninstallStrykerDotnetToolCommand = (dotnet: DotnetType) => async () => {
  dotnet.uninstallStrykerTool().then((toolIsUninstalled: boolean) => {
    if (toolIsUninstalled === true) {
      // uninstallDotnetTool(exec, `${tool}.*((\\d+\\.)*\\d+).*successfully uninstalled\\.`);
      // todo: uninstall the tool
      const msg = `Stryker.NET: ${tool} tool has been uninstalled`;
      vscode.window.showInformationMessage(msg);
    } else {
      vscode.window.showWarningMessage(`Stryker.NET: ${tool} tool uninstallation failed`);
    }
  });
};

//   console.log("Task : Uninstall the stryker dotnet tool");

//   isDotnetExists(exec)
//   .then(dotnetExists => {
//     if(dotnetExists) {
//       isDotnetToolInstalled(exec)
//       .then(toolInstalled => {
//         if(toolInstalled) {
//           uninstallDotnetTool(exec, `${tool}.*((\\d+\\.)*\\d+).*successfully uninstalled\\.`);
//         }
//         else {
//           vscode.window.showWarningMessage(`${tool} tool is NOT installed`);
//         }
//       })
//       .catch(error => {
//         console.log(error);
//         vscode.window.showErrorMessage(error);
//       });
//     }
//   })
//   .catch(error => {
//     console.log(error);
//     vscode.window.showErrorMessage(error);
//   });
// };

// const uninstallDotnetTool = (exec: DotnetExecuteCommand, patternToVerify: string) => {
//   let msg = "";
//   console.log(`Uninstalling the ${tool} tool`);

//   exec(["tool","uninstall","--global",`${tool}`], patternToVerify)
//   .then(toolUninstalled => {
//     if (toolUninstalled) {
//       msg = `${tool} tool has been uninstalled`;
//       console.log(msg);
//       vscode.window.showInformationMessage(msg);
//     } else {
//       msg = `${tool} tool was NOT uninstalled.\r\nYou can uninstall it manually with "dotnet tool uninstall --global ${patternToVerify}"`;
//       console.log(msg);
//       vscode.window.showErrorMessage(msg);
//     }
//   })
//   .catch(error => {
//     msg = `An issue occured while uninstalling the presence of the ${tool} tool : \r\n ${error}`;
//     console.log(msg);
//     vscode.window.showErrorMessage(msg);
//   });
// };

// const isDotnetExists = (exec: DotnetExecuteCommand): Promise<boolean> => {

//   const missingDotnetMessage = `If it is installed, please provide the full path in the settings file under 'stryker-mutator-net.dotnet.command'.`;
//   const msgMissingDotnet = `dotnet is NOT installed or configured properly.\r\n${missingDotnetMessage}`;

//   return exec(["--version"], "^(\\d+\\.)*\\d+$")
//   .then(isDotnetInstalled => {

//     return new Promise<boolean>((resolve) => {
//       if(isDotnetInstalled) {
//         let msg = `dotnet is installed`;
//         console.log(msg);
//       }
//       resolve(isDotnetInstalled);
//     });
//   })
//   .catch(error => {
//     let msgError = `${msgMissingDotnet}\r\n Error : ${error}`;
//     return Promise.reject(msgError);
//     // TODO : Verify if the above code do the same thing as the commented one
//     // return new Promise<boolean>((resolve, reject) => {
//     //     reject(msgError);
//     //     resolve(false);
//     // });
//   });
// };

// const isDotnetToolInstalled = (exec: DotnetExecuteCommand): Promise<boolean> => {
//   let msg = "";

//   return exec(["tool", "list", "--global"], `${tool}(\\s*)((\\d+\\.)*\\d+)(\\s*)${tool}`)
//   .then(toolExists => {
//     return new Promise<boolean>((resolve) => {
//       if(toolExists) {
//         msg = `${tool} tool is installed`;
//       }
//       else {
//         msg = `${tool} tool is NOT installed`;
//       }
//       console.log(msg);
//       resolve(toolExists);
//     });
//   })
//   .catch(error => {
//     msg = `An issue occured while verifying the presence of the ${tool} tool : \r\n ${error}`;
//     return new Promise<boolean>((resolve, reject) => {
//       reject(msg);
//       resolve(false);
//     });
//   });
// };

export const createBoilerplateStrykerConfigurationFileCommand = (dotnet: DotnetType) => async (arg: string) => {
  // TODO : strykerConfig may not be injected in dotnet class... ?!?!?
  /*(strykerConfig: StrykerConfigurationType) => async(arg: vscode.Uri) => {
  strykerConfig.initializeBasicConfiguration(arg)*/
  // console.log(`Create stryker config : ${arg}`);
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
    '🧟‍♀️🧟‍♂️ Unleashing 🧟‍♂️🧟‍♀️ too much 🧟‍♀️🧟‍♂️ mutants 🧟‍♂️🧟‍♀️ into  the wild (aka running stryker on a project or a solution) can be time and resources consuming. Are you sure you want to do this?',
    'Yes',
    'No'
  );
  if (selection === 'Yes') {
    run({});
  } else {
    vscode.window.showInformationMessage(`Stryker.NET : Your computer thanks you! 😇`);
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

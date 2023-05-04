import { ChildProcess } from 'child_process';
import { commandBuilder } from './cli-builder';
import util from 'util';
import { Uri, workspace } from 'vscode';

// todo this feels a new file or helper ?!
export const isValidToRegex = async (valueToValidate: string, regexpPattern: string): Promise<boolean> => {
  var regex = new RegExp(regexpPattern, `gmi`);
  var isValid = regex.test(valueToValidate);
  return Promise.resolve(isValid);
};

// todo: this feels that it should become private/protected
export const executeCommandWithArguments = async (args: string[]): Promise<string> => {
  // try {
  const cp = require('child_process');
  const execChildProcess = util.promisify(cp.exec);

  const commandToLaunch: string = commandBuilder(args);

  // todo : evaluate the posibility to use or not the cwd / workspace
  // const workspaceDirectory: string = workspace.workspaceFolders?.[0].uri!.fsPath!;

  // const workspaceDirectory: string | undefined = workspace.getWorkspaceFolder(Uri.parse('.'))?.uri.fsPath;
  // const workspaceDirectory: string | undefined = workspace.asRelativePath('.');
  // const workspaceDirectory: string | undefined = workspace.getWorkspaceFolder(workspace.workspaceFolders?.[0]?.uri!)?.uri.fsPath;

  // console.log(`DEBUG : workspace is ${workspaceDirectory}`);
  const { stdout } = await execChildProcess(commandToLaunch);
  // const { stdout } = await execChildProcess(commandToLaunch, { cwd: workspaceDirectory });
  return Promise.resolve(stdout);
  // } catch (error) {
  //   return Promise.reject(error);
  // }
};

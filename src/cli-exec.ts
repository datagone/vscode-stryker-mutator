import { commandBuilder } from './cli-builder';
import util from 'util';

// todo this feels a new file or helper ?!
export const isValidToRegex = async (valueToValidate: string, regexpPattern: string): Promise<boolean> => {
  var regex = new RegExp(regexpPattern, `gmi`);
  var isValid = regex.test(valueToValidate);
  return Promise.resolve(isValid);
};

// todo: this feels that it should become private/protected
export const executeCommandWithArguments = async (args: string[]): Promise<string> => {
  const cp = require('child_process');
  const execChildProcess = util.promisify(cp.exec);

  const commandToLaunch: string = commandBuilder(args);

  const { stdout } = await execChildProcess(commandToLaunch);

  return Promise.resolve(stdout);
};

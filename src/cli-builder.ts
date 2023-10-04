import { dotnetCommand, strykerDotnetToolInstallationLocation } from './config';
import { InvalidArgumentsException, MissingArgumentsException } from './dotnet-cli-exception';
import shellEscape from 'shell-escape';

const allowedCommand: string[] = ['stryker', 'tool', '--version', 'new'];

export const commandBuilder = (args: string[]): string => {
  if (args.length === 0) {
    throw new MissingArgumentsException('No arguments provided.');
  }

  if (!allowedCommand.includes(args[0])) {
    throw new InvalidArgumentsException(`The sub-command '${args[0]}' is not supported.`);
  }

  if (args[0] === 'tool') {
    args.push(argsInstallationLocation());
  }

  const escapedArgs = shellEscape(args);

  const dotnetExe = dotnetCommand();
  return `${dotnetExe} ${escapedArgs}`;
};

export const argsInstallationLocation = (): string => `--${strykerDotnetToolInstallationLocation()}`;
